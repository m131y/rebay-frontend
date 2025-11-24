import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import MainLayout from "../components/layout/MainLayout";
import {
  getBuyerTransactions,
  getSellerTransactions,
  confirmReceipt,
} from "../services/payment";

import userService from "../services/user";
import useAuthStore from "../store/authStore";
import usePostStore from "../store/postStore";

const UserTransactions = () => {
  const { id: userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { userPosts } = usePostStore();

  // 게시글 종류
  const TRADE_TYPES = {
    ALL: "ALL",
    NORMAL: "NORMAL",
    AUCTION: "AUCTION",
  };

  // 대시보드 탭
  const navItems = [
    { id: "buyer", label: "구매 내역" },
    { id: "seller", label: "판매 내역" },
  ];

  // 페이징 상태
  const [buyerPage, setBuyerPage] = useState(0);
  const [sellerPage, setSellerPage] = useState(0);
  const size = 10;

  // 각 탭의 상태 및 필터
  const [activeTab, setActiveTab] = useState("buyer");
  const [buyerFilter, setBuyerFilter] = useState(TRADE_TYPES.ALL);
  const [sellerFilter, setSellerFilter] = useState(TRADE_TYPES.ALL);

  const [sellerInfo, setSellerInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(null);

  // Page 객체 저장
  const [buyerTransactions, setBuyerTransactions] = useState({
    content: [],
    totalPages: 0,
    number: 0,
  });
  const [sellerTransactions, setSellerTransactions] = useState({
    content: [],
    totalPages: 0,
    number: 0,
  });

  // 판매 통계
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    totalEarnings: 0,
  });

  // 탭 변경에 따라 로딩
  useEffect(() => {
    if (activeTab === "buyer") {
      setBuyerPage(0);
      loadBuyerTransactions();
    } else {
      setSellerPage(0);
      loadSellerTransactions();
    }
  }, [activeTab, userId]);

  // 페이징 이동 시 로드
  useEffect(() => {
    if (activeTab === "buyer") loadBuyerTransactions();
  }, [buyerPage]);

  useEffect(() => {
    if (activeTab === "seller") loadSellerTransactions();
  }, [sellerPage]);

  const transactions =
    activeTab === "buyer" ? buyerTransactions : sellerTransactions;

  // 상태 텍스트
  const getStatusText = (status) => {
    const statusMap = {
      PAYMENT_PENDING: "결제 대기",
      READY: "결제 대기",
      PAID: "결제 완료",
      SETTLEMENT_PENDING: "정산 대기",
      COMPLETED: "정산 완료",
      CANCELED: "거래 취소",
      EXPIRED: "만료된 거래",
    };
    return statusMap[status] || status;
  };

  // 상태 색상
  const getStatusColor = (status) => {
    const map = {
      PAYMENT_PENDING: "bg-gray-100 text-gray-800",
      PAID: "bg-blue-100 text-blue-800",
      SETTLEMENT_PENDING: "bg-yellow-100 text-yellow-800",
      COMPLETED: "bg-green-100 text-green-800",
      CANCELED: "bg-red-100 text-red-800",
    };
    return map[status] || "bg-gray-100 text-gray-800";
  };

  // 카드 클릭 핸들러
  const handleCardClick = (t) => {
    const auctionStatus = t.auctionStatus;

    if (t.productType === "AUCTION" && auctionStatus === "BIDDING") {
      return navigate(`/auctions/${t.postId}`);
    }

    return navigate(`/transaction/${t.id}`);
  };

  // 구매자 수령 확인 핸들러
  const handleConfirmReceipt = async (transactionId, e) => {
    e.stopPropagation();
    if (
      !window.confirm("상품을 받으셨나요? 수령 확인 시 판매자에게 정산됩니다.")
    )
      return;

    try {
      setConfirming(transactionId);
      await confirmReceipt(transactionId, parseInt(userId));
      alert("상품 수령이 확인되었습니다.");
      loadBuyerTransactions();
    } catch (err) {
      console.error(err);
      alert("수령 확인 실패");
    } finally {
      setConfirming(null);
    }
  };

  // API 요청
  // 구매 내역 로드
  const loadBuyerTransactions = async () => {
    try {
      setLoading(true);
      const data = await getBuyerTransactions(userId, buyerPage, size);

      // 임시 dummy
      data.content.push({
        id: 999999,
        productName: "테스트 경매 상품",
        sellerName: "경매판매자",
        buyerName: "경매구매자",
        orderId: "AUC-TEST-001",
        amount: 150000,
        status: "PAYMENT_PENDING",
        productType: "AUCTION",
        auctionStatus: "LOSE",
        createdAt: new Date().toISOString(),
      });

      // productId를 기준으로 productType 주입
      const mapped = {
        ...data,
        content: data.content.map((t) => {
          const post = userPosts.find((p) => p.productId === t.productId);
          return {
            ...t,
            productType: t.productType ?? post?.productType ?? "NORMAL",
          };
        }),
      };

      setBuyerTransactions(mapped);
    } catch (err) {
      console.error(err);
      alert("구매 내역 조회 실패");
    } finally {
      setLoading(false);
    }
  };

  // 판매 내역 + 판매자 정보 로드
  const loadSellerTransactions = async () => {
    try {
      setLoading(true);

      const [userData, transactionData] = await Promise.all([
        userService.getUserProfile(userId),
        getSellerTransactions(userId, sellerPage, size),
      ]);

      setSellerInfo(userData);

      const mapped = {
        ...transactionData,
        content: transactionData.content.map((t) => {
          const post = userPosts.find((p) => p.productId === t.productId);
          return {
            ...t,
            productType: post?.productType ?? "NORMAL",
          };
        }),
      };

      setSellerTransactions(mapped);

      // 판매 통계 계산
      if (sellerPage === 0) {
        const list = transactionData.content ?? [];

        const pending = list.filter((t) => t.status === "PAID").length;
        const completed = list.filter((t) => t.status === "COMPLETED").length;

        const totalEarnings =
          list
            .filter((t) => t.status === "COMPLETED")
            .reduce((sum, t) => sum + t.amount, 0) ?? 0;

        setStats({
          total: transactionData.totalElements ?? list.length,
          pending,
          completed,
          totalEarnings,
        });
      }
    } catch (err) {
      console.error(err);
      alert("판매 내역 조회 실패");
    } finally {
      setLoading(false);
    }
  };

  // 경매 상태 뱃지 UI 함수 (dummy)
  const getAuctionStatusBadge = (status) => {
    if (!status) return null;

    if (status === "BIDDING") {
      return (
        <span className="px-2 py-1 rounded-md text-xs font-semibold bg-gray-200 text-gray-700">
          📝 입찰 중
        </span>
      );
    }

    if (status === "WON") {
      return (
        <span className="px-2 py-1 rounded-md text-xs font-semibold bg-amber-100 text-amber-800">
          ✨ 낙찰
        </span>
      );
    }

    return (
      <span className="px-2 py-1 rounded-md text-xs font-semibold bg-red-100 text-red-700">
        ❌ 패찰
      </span>
    );
  };

  // 글 종류 뱃지
  const getProductTypeBadge = (type) => {
    if (type === "AUCTION") {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-bold bg-red-500 text-white">
          🔨 경매
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-bold bg-blue-500 text-white">
        💰 중고거래
      </span>
    );
  };

  // 거래 카드 렌더링
  const renderTransactionCard = (t, isBuyerTab) => {
    const canConfirm = isBuyerTab && t.status === "PAID" && !t.isReceived;

    return (
      <div
        key={t.id}
        className="bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow w-full mb-4 cursor-pointer"
        onClick={() => handleCardClick(t)}
      >
        {/* 상품 정보 */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {getProductTypeBadge(t.productType)}

              {t.productType === "AUCTION" &&
                getAuctionStatusBadge(t.auctionStatus)}
            </div>

            <h3 className="text-xl font-semibold mb-2">{t.productName}</h3>
            <p className="text-sm text-gray-600 mb-1">
              {isBuyerTab
                ? `판매자: ${t.sellerName}`
                : `구매자: ${t.buyerName}`}
            </p>
            <p className="text-sm text-gray-500">주문번호: {t.orderId}</p>
          </div>

          <div className="text-right">
            <p className="text-2xl font-bold text-blue-600 mb-2">
              {t.amount.toLocaleString()}원
            </p>
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                t.status
              )}`}
            >
              {getStatusText(t.status)}
            </span>
          </div>
        </div>

        <div className="border-t pt-4 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            <p>주문 일시: {new Date(t.createdAt).toLocaleString()}</p>

            {t.status === "COMPLETED" && t.receivedAt && (
              <p className="text-green-600 mt-1">
                정산 완료: {new Date(t.receivedAt).toLocaleString()}
              </p>
            )}

            {t.status === "PAID" && !isBuyerTab && (
              <p className="text-blue-600 mt-1">
                결제 완료! 구매자가 상품 수령 확인 시 정산됩니다.
              </p>
            )}
          </div>

          {canConfirm && (
            <button
              onClick={(e) => handleConfirmReceipt(t.id, e)}
              disabled={confirming === t.id}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
            >
              {confirming === t.id ? "처리 중..." : "상품 수령 확인"}
            </button>
          )}
        </div>
      </div>
    );
  };

  const filteredList =
    activeTab === "buyer"
      ? buyerTransactions.content.filter((t) => {
          if (buyerFilter === TRADE_TYPES.ALL) return true;
          return t.productType === buyerFilter;
        })
      : sellerTransactions.content.filter((t) => {
          if (sellerFilter === TRADE_TYPES.ALL) return true;
          return t.productType === sellerFilter;
        });

  return (
    <MainLayout>
      <Header />

      <main className="w-full flex-grow flex flex-col items-center mt-[70px] py-10">
        {/* 제목 */}
        <div className="w-[990px] flex justify-between">
          <h1 className="text-3xl font-bold">거래 내역</h1>
          <button onClick={() => navigate(-1)} className="text-gray-500">
            뒤로가기
          </button>
        </div>

        {/* 구분선 */}
        <div className="w-[1400px]">
          <div className="p-[0.5px] bg-gradient-to-r from-white via-gray-400 to-white w-full md:w-3/4 mx-auto my-8">
            <div className="h-[0.5px] bg-white rounded-full"></div>
          </div>
        </div>

        {/* 탭 */}
        <div className="w-[990px] font-presentation flex space-x-20 text-2xl">
          {navItems.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`cursor-pointer w-full flex justify-center items-center border-b-4 h-[60px] mb-[20px] ${
                  active
                    ? "text-black border-rebay-gray-500"
                    : "text-gray-500 border-rebay-gray-300"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* 판매 탭*/}
        {activeTab === "seller" && sellerInfo && (
          <div className="w-[990px] mb-10 space-y-6">
            {/* 판매자 정보 */}
            <div className="bg-white border rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold mb-2">판매자 정보</h2>
                  <p className="text-gray-700 text-lg">{sellerInfo.username}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-500 text-sm">총 수익</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.totalEarnings.toLocaleString()}원
                  </p>
                </div>
              </div>
            </div>

            {/* 판매 통계 */}
            <div className="bg-white border rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4">판매 통계</h2>

              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <p className="text-gray-500 text-sm mb-1">전체 거래</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>

                <div>
                  <p className="text-gray-500 text-sm mb-1">정산 대기</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {stats.pending}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500 text-sm mb-1">정산 완료</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.completed}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 구매 필터 */}
        {activeTab === "buyer" && (
          <div className="w-[990px] mb-6 flex gap-2">
            <button
              onClick={() => setBuyerFilter(TRADE_TYPES.ALL)}
              className={`px-4 py-2 rounded-full text-sm font-semibold ${
                buyerFilter === TRADE_TYPES.ALL
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              전체
            </button>

            <button
              onClick={() => setBuyerFilter(TRADE_TYPES.NORMAL)}
              className={`px-4 py-2 rounded-full text-sm font-semibold ${
                buyerFilter === TRADE_TYPES.NORMAL
                  ? "bg-blue-500 text-white"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              중고거래
            </button>

            <button
              onClick={() => setBuyerFilter(TRADE_TYPES.AUCTION)}
              className={`px-4 py-2 rounded-full text-sm font-semibold ${
                buyerFilter === TRADE_TYPES.AUCTION
                  ? "bg-red-500 text-white"
                  : "bg-red-100 text-red-700"
              }`}
            >
              경매
            </button>
          </div>
        )}

        {/* 판매 필터 */}
        {activeTab === "seller" && (
          <div className="w-[990px] mb-6 flex gap-2">
            <button
              onClick={() => setSellerFilter(TRADE_TYPES.ALL)}
              className={`px-4 py-2 rounded-full text-sm font-semibold ${
                sellerFilter === TRADE_TYPES.ALL
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              전체
            </button>

            <button
              onClick={() => setSellerFilter(TRADE_TYPES.NORMAL)}
              className={`px-4 py-2 rounded-full text-sm font-semibold ${
                sellerFilter === TRADE_TYPES.NORMAL
                  ? "bg-blue-500 text-white"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              중고거래
            </button>

            <button
              onClick={() => setSellerFilter(TRADE_TYPES.AUCTION)}
              className={`px-4 py-2 rounded-full text-sm font-semibold ${
                sellerFilter === TRADE_TYPES.AUCTION
                  ? "bg-red-500 text-white"
                  : "bg-red-100 text-red-700"
              }`}
            >
              경매거래
            </button>
          </div>
        )}

        {/* 리스트 */}
        <div className="w-[990px]">
          {loading ? (
            <div className="flex justify-center items-center py-20 text-xl">
              로딩 중...
            </div>
          ) : filteredList.length === 0 ? (
            <div className="bg-white p-12 rounded-lg shadow text-center">
              <p className="text-gray-500 text-lg mb-6">
                {activeTab === "buyer"
                  ? "구매 내역이 없습니다."
                  : "판매 내역이 없습니다."}
              </p>
              <button
                onClick={() => navigate("/")}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg"
              >
                홈으로
              </button>
            </div>
          ) : (
            filteredList.map((t) =>
              renderTransactionCard(t, activeTab === "buyer")
            )
          )}
        </div>

        {/* 페이징 버튼 */}
        <div className="flex flex-col items-center my-8 space-y-4">
          {/* 현재 페이지 표시 */}
          {(activeTab === "buyer"
            ? buyerTransactions.totalPages
            : sellerTransactions.totalPages) > 0 && (
            <div className="text-gray-700 font-medium text-lg">
              {activeTab === "buyer"
                ? `${buyerTransactions.number + 1} / ${
                    buyerTransactions.totalPages
                  }`
                : `${sellerTransactions.number + 1} / ${
                    sellerTransactions.totalPages
                  }`}
            </div>
          )}

          {/* 이전 / 다음 버튼 */}
          <div className="flex space-x-4">
            <button
              disabled={
                activeTab === "buyer"
                  ? buyerTransactions.number === 0
                  : sellerTransactions.number === 0
              }
              onClick={() =>
                activeTab === "buyer"
                  ? setBuyerPage((p) => Math.max(p - 1, 0))
                  : setSellerPage((p) => Math.max(p - 1, 0))
              }
              className={`px-4 py-2 rounded-lg ${
                activeTab === "buyer"
                  ? buyerTransactions.number === 0
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                  : sellerTransactions.number === 0
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              이전
            </button>

            <button
              disabled={
                activeTab === "buyer"
                  ? buyerTransactions.number + 1 >= buyerTransactions.totalPages
                  : sellerTransactions.number + 1 >=
                    sellerTransactions.totalPages
              }
              onClick={() =>
                activeTab === "buyer"
                  ? setBuyerPage((p) =>
                      buyerTransactions.number + 1 <
                      buyerTransactions.totalPages
                        ? p + 1
                        : p
                    )
                  : setSellerPage((p) =>
                      sellerTransactions.number + 1 <
                      sellerTransactions.totalPages
                        ? p + 1
                        : p
                    )
              }
              className={`px-4 py-2 rounded-lg ${
                activeTab === "buyer"
                  ? buyerTransactions.number + 1 >= buyerTransactions.totalPages
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                  : sellerTransactions.number + 1 >=
                    sellerTransactions.totalPages
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              다음
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </MainLayout>
  );
};

export default UserTransactions;
