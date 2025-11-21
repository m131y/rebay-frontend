import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { loadTossPayments } from "@tosspayments/payment-sdk";

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const transaction = location.state?.transaction;

  const [tosspayments, setTossPayments] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // transaction이 없으면 home으로 이동
  useEffect(() => {
    if (!transaction) {
      alert("결제 정보가 없습니다.");
      navigate("/");
    }
  }, [transaction, navigate]);

  // Toss SDK 초기화: 별도의 getClientKey() -> 서버에서 받은 transaction 객체의 clientKey로 바로 초기화
  useEffect(() => {
    const initToss = async () => {
      if (!transaction) return;
      try {
        const toss = await loadTossPayments(transaction.clientKey);
        setTossPayments(toss);
      } catch (err) {
        console.error("Toss SDK 초기화 실패: ", err);
        alert("결제 준비에 실패했습니다.");
      }
    };
    initToss();
  }, [transaction]);

  // 결제 버튼 클릭
  const handlePayment = async () => {
    if (!tosspayments || !transaction || isLoading) return;

    setIsLoading(true);
    try {
      await tosspayments.requestPayment("카드", {
        amount: transaction.amount,
        orderId: transaction.orderId,
        orderName: transaction.productName,
        successUrl: `${window.location.origin}/payment/success?transactionId=${transaction.id}`,
        failUrl: `${window.location.origin}/payment/fail`,
      });
    } catch (error) {
      console.error("결제 실패:", error);
      alert("결제 처리 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!transaction) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">결제하기</h1>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-xl font-semibold mb-4">주문 상품</h2>
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">상품명</span>
              <span className="font-semibold">{transaction.productName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">결제 금액</span>
              <span className="text-xl font-bold text-blue-600">
                {transaction.amount.toLocaleString()}원
              </span>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-yellow-800 mb-2">
            에스크로 결제 안내
          </h3>
          <p className="text-sm text-yellow-700">
            이 거래는 에스크로로 보호됩니다. 결제 금액은 구매자가 상품 수령을
            확인할 때까지 안전하게 보관되며, 수령 확인 후 판매자에게 전달됩니다.
          </p>
        </div>

        {!tosspayments && (
          <div className="text-center text-gray-500 mb-4 py-2">
            결제 준비 중..
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={() => navigate(-1)} //products/${postId} 로 돌아가도록 수정 예정
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            취소
          </button>
          <button
            onClick={handlePayment}
            disabled={!tosspayments || isLoading}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            {isLoading ? "처리중.." : "결제하기"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
