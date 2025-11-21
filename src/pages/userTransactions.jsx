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

const UserTransactions = () => {
  const { id: userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // 대시보드 탭
  const navItems = [
    { id: "buyer", label: "구매 내역" },
    { id: "seller", label: "판매 내역" },
  ];

  const [activeTab, setActiveTab] = useState("buyer");

  const [buyerTransactions, setBuyerTransactions] = useState([]);
  const [sellerTransactions, setSellerTransactions] = useState([]);
  const [sellerInfo, setSellerInfo] = useState(null);

  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(null);

  // 판매 통계
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    totalEarnings: 0,
  });

  // 상태 텍스트
  const getStatusText = (status) => {
    const statusMap = {
      PAYMENT_PENDING: "결제 대기",
      PAID: "결제 완료",
      SETTLEMENT_PENDING: "정산 대기",
      COMPLETED: "정산 완료",
      CANCELED: "거래 취소",
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

  // 구매 내역 로드
  const loadBuyerTransactions = async () => {
    try {
      setLoading(true);
      const data = await getBuyerTransactions(userId);
      setBuyerTransactions(data || []);
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
        getSellerTransactions(userId),
      ]);

      setSellerInfo(userData);
      setSellerTransactions(transactionData || []);

      // 판매 통계 계산
      const pending = transactionData.filter((t) => t.status === "PAID").length;
      const completed = transactionData.filter(
        (t) => t.status === "COMPLETED"
      ).length;

      const totalEarnings =
        transactionData
          .filter((t) => t.status === "COMPLETED")
          .reduce((sum, t) => sum + t.amount, 0) ?? 0;

      setStats({
        total: transactionData.length,
        pending,
        completed,
        totalEarnings,
      });
    } catch (err) {
      console.error(err);
      alert("판매 내역 조회 실패");
    } finally {
      setLoading(false);
    }
  };

  // 탭 변경에 따라 로딩
  useEffect(() => {
    if (activeTab === "buyer") loadBuyerTransactions();
    else loadSellerTransactions();
  }, [activeTab, userId]);

  // 구매자 수령 확인
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
      await loadBuyerTransactions();
    } catch (err) {
      console.error(err);
      alert("수령 확인 실패");
    } finally {
      setConfirming(null);
    }
  };

  // 거래 카드 렌더링
  const renderTransactionCard = (t, isBuyerTab) => {
    const canConfirm = isBuyerTab && t.status === "PAID" && !t.isReceived;

    return (
      <div
        key={t.id}
        className="bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow w-full mb-4 cursor-pointer"
        onClick={() => navigate(`/transaction/${t.id}`)}
      >
        {/* 상품 정보 */}
        <div className="flex justify-between items-start mb-4">
          <div>
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

  const transactions =
    activeTab === "buyer" ? buyerTransactions : sellerTransactions;

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

        {/* 리스트 */}
        <div className="w-[990px]">
          {loading ? (
            <div className="flex justify-center items-center py-20 text-xl">
              로딩 중...
            </div>
          ) : transactions.length === 0 ? (
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
            transactions
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .map((t) => renderTransactionCard(t, activeTab === "buyer"))
          )}
        </div>
      </main>

      <Footer />
    </MainLayout>
  );
};

export default UserTransactions;
