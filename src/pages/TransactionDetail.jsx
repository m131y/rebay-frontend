import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTransaction, confirmReceipt } from "../services/payment";
import useAuthStore from "../store/authStore";

const TransactionDetail = () => {
  const { transactionId } = useParams();
  const navigate = useNavigate();

  // 거래 정보 상태
  const [transaction, setTransaction] = useState(null);

  // 로딩, 에러, 처리 등 UI 상태
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState(null);

  // 로그인 사용자 정보
  const { user } = useAuthStore();

  // 컴포넌트가 처음 렌더링되었을 때 거래 정보 불러옴
  useEffect(() => {
    if (transactionId) {
      loadTransaction();
    } else {
      setError("거래 ID가 없습니다.");
      setLoading(false);
    }
  }, [transactionId]);

  // 거래 상세 정보 조회
  const loadTransaction = async () => {
    try {
      const data = await getTransaction(transactionId);
      setTransaction(data);
      setError(null);
    } catch (error) {
      console.error("거래 조회 실패:", error);
      setError(
        error?.response?.data?.message || "거래 정보를 불러오는데 실패했습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  // 구매자가 상품 수령 확인 버튼을 눌렀을 때 실행되는 함수
  const handleConfirmReceipt = async () => {
    const confirmed = window.confirm(
      "상품을 정말 받으셨나요? 수령 확인 후 판매자에게 금액이 전달됩니다."
    );
    if (!confirmed) return;

    setConfirming(true);
    try {
      const updatedTransaction = await confirmReceipt(
        transactionId,
        transaction.buyerId
      );
      setTransaction(updatedTransaction);
      alert("상품 수령이 확인되었습니다. 판매자에게 금액이 정산되었습니다.");
    } catch (error) {
      console.error("수령 확인 실패:", error);
      alert(error?.response?.data?.message || "수령 확인에 실패했습니다.");
    } finally {
      setConfirming(false);
    }
  };

  // 상태 텍스트 변환
  const getStatusText = (status) => {
    const statusMap = {
      PAYMENT_PENDING: "결제 대기",
      PAID: "결제 완료 (에스크로 예치)",
      SETTLEMENT_PENDING: "정산 대기",
      COMPLETED: "거래 완료",
      CANCELED: "거래 취소",
    };
    return statusMap[status] || status;
  };

  // 상태별 색상 배경 설정
  const getStatusColor = (status) => {
    const colorMap = {
      PAYMENT_PENDING: "bg-gray-100 text-gray-800",
      PAID: "bg-blue-100 text-blue-800",
      SETTLEMENT_PENDING: "bg-yellow-100 text-yellow-800",
      COMPLETED: "bg-green-100 text-green-800",
      CANCELED: "bg-red-100 text-red-800",
    };
    return colorMap[status] || "bg-gray-100 text-gray-800";
  };

  // 로딩 중 UI
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-xl">거래 정보 불러오는 중...</div>
        </div>
      </div>
    );
  }

  // 에러 UI
  if (error || !transaction) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8">
            <div className="text-6xl mb-4">!</div>
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              거래를 불러올 수 없습니다
            </h1>
            <p className="text-red-700 mb-6">
              {error || "거래를 찾을 수 없습니다."}
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate("/")}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                홈으로
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                다시 시도
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 구매한 사용자가 판매자인지 확인
  const isSeller = user?.id === transaction?.sellerId;

  // 구매자가 수령 확인을 할 수 있는 조건
  const canConfirmReceipt =
    !isSeller && transaction.status === "PAID" && !transaction.isReceived;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* 뒤로가기 + 제목 */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="mr-4 text-gray-600 hover:text-gray-800"
          >
            ← 뒤로
          </button>
          <h1 className="text-3xl font-bold">거래 상세 정보</h1>
        </div>

        {/* 거래 기본 정보 */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">
                {transaction.productName}
              </h2>
              <p className="text-gray-600 text-sm">
                주문번호: {transaction.orderId}
              </p>
            </div>
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
                transaction.status
              )}`}
            >
              {getStatusText(transaction.status)}
            </span>
          </div>

          {/* 상세 정보 목록 */}
          <div className="border-t pt-6 space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">결제 금액</span>
              <span className="text-xl font-bold text-blue-600">
                {transaction.amount?.toLocaleString()}원
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">결제 방법</span>
              <span>{transaction.method || "안전결제"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">구매자</span>
              <span>{transaction.buyerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">판매자</span>
              <span>{transaction.sellerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">상품 수령 여부</span>
              <span
                className={
                  transaction.isReceived
                    ? "text-green-600 font-semibold"
                    : "text-gray-600"
                }
              >
                {transaction.isReceived ? "수령 완료" : "미수령"}
              </span>
            </div>

            {transaction.receivedAt && (
              <div className="flex justify-between">
                <span className="text-gray-600">수령 확인 시간</span>
                <span className="text-m">
                  {new Date(transaction.receivedAt).toLocaleString("ko-KR")}
                </span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-gray-600">거래 시각</span>
              <span className="text-m">
                {new Date(transaction.createdAt).toLocaleString("ko-KR")}
              </span>
            </div>
          </div>
        </div>

        {/* 상태별 안내 메시지 */}
        {transaction.status === "PAYMENT_PENDING" && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-gray-800 mb-2">결제 대기 중</h3>
            <p className="text-sm text-gray-700">
              결제가 아직 완료되지 않았습니다. 결제를 완료해주세요.
            </p>
          </div>
        )}

        {transaction.status === "PAID" && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-blue-800 mb-2">
              💰 에스크로 안내
            </h3>
            <p className="text-m text-blue-700 mb-2">
              결제 금액은 현재 에스크로에 안전하게 예치되어 있습니다.
            </p>
            {canConfirmReceipt && (
              <p className="text-m text-blue-700 font-semibold">
                ⚠️ 상품을 받으신 후 아래 "상품 수령 확인" 버튼을 눌러주세요.
              </p>
            )}
          </div>
        )}

        {transaction.status === "SETTLEMENT_PENDING" && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-yellow-800 mb-2">정산 처리 중</h3>
            <p className="text-sm text-yellow-700">
              판매자에게 금액을 정산하는 중입니다. 잠시만 기다려주세요.
            </p>
          </div>
        )}

        {transaction.status === "COMPLETED" && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-green-800 mb-2">거래 완료</h3>
            <p className="text-sm text-green-700">
              판매자에게 금액이 정산되었습니다. 거래가 완료되었습니다.
            </p>
          </div>
        )}

        {transaction.status === "CANCELED" && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-red-800 mb-2">거래 취소</h3>
            <p className="text-sm text-red-700">
              이 거래는 취소되었습니다. 결제 금액은 환불 처리됩니다.
            </p>
          </div>
        )}

        {/* 버튼 영역 */}
        {isSeller ? (
          // 판매자: 홈 버튼만 표시
          <div className="flex justify-center mt-6">
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              홈으로
            </button>
          </div>
        ) : (
          // 구매자: 홈 + 수령확인 버튼 표시
          <div className="flex gap-4 mt-6">
            <button
              onClick={() => navigate("/")}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              홈으로
            </button>

            {canConfirmReceipt && (
              <button
                onClick={handleConfirmReceipt}
                disabled={confirming}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
              >
                {confirming ? "처리 중..." : "상품 수령 확인"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionDetail;
