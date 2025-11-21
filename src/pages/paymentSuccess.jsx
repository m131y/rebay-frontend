import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { confirmPayment } from "../services/payment";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [transaction, setTransaction] = useState(null);
  const [error, setError] = useState(null);
  const hasConfirmed = useRef(false);

  const paymentKey = searchParams.get("paymentKey");
  const orderId = searchParams.get("orderId");
  const amount = searchParams.get("amount");
  const transactionId = searchParams.get("transactionId");

  useEffect(() => {
    // 필수 파라미터 검증
    if (!paymentKey || !orderId || !amount) {
      setError("결제 정보가 올바르지 않습니다.");
      setLoading(false);
      return;
    }

    // 이미 확인 중이거나 확인 완료된 경우 중복 실행 방지
    if (hasConfirmed.current) return;
    hasConfirmed.current = true;

    confirmPaymentProcess();
  }, [paymentKey, orderId, amount]);

  const confirmPaymentProcess = async () => {
    try {
      const result = await confirmPayment(
        paymentKey,
        orderId,
        parseInt(amount)
      );
      setTransaction(result);
    } catch (error) {
      console.error("결제 승인 실패:", error);
      setError(error?.response?.data?.message || "결제 승인에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-xl">결제 승인 처리 중...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8">
            <div className="text-6xl mb-4">✕</div>
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              결제 승인 실패
            </h1>
            <p className="text-red-700 mb-6">{error}</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate("/")}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                홈으로
              </button>
              <button
                onClick={() => navigate(-1)}
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 mb-6">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">✓</div>
            <h1 className="text-3xl font-bold text-green-600 mb-2">
              결제 완료!
            </h1>
            <p className="text-green-700">
              결제가 성공적으로 완료되었습니다. 금액은 에스크로에 안전하게
              예치되었습니다.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-xl font-semibold mb-4">거래 정보</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">주문번호</span>
              <span className="font-mono">{transaction?.orderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">상품명</span>
              <span>{transaction?.productName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">결제 금액</span>
              <span className="font-bold">
                {transaction?.amount?.toLocaleString()}원
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">결제 방법</span>
              <span>{transaction?.method || "카드"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">거래 상태</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                결제 완료 (에스크로 예치)
              </span>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-yellow-800 mb-2">다음 단계</h3>
          <ol className="list-decimal list-inside space-y-2 text-yellow-700">
            <li>판매자가 상품을 발송합니다</li>
            <li>상품을 받으신 후 "상품 수령 확인" 버튼을 눌러주세요</li>
            <li>수령 확인 후 판매자에게 금액이 정산됩니다</li>
          </ol>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => navigate("/")}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            홈으로
          </button>
          <button
            onClick={() => navigate(`/transaction/${transaction?.id}`)}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            거래 상세보기
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
