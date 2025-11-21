import { useSearchParams, useNavigate } from "react-router-dom";

const PaymentFail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const message =
    searchParams.get("message") || "결제 처리 중 오류가 발생했습니다.";
  const code = searchParams.get("code");
  const orderId = searchParams.get("orderId");

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 mb-6">
          <div className="text-center">
            <div className="text-6xl mb-4">✗</div>
            <h1 className="text-2xl font-bold text-red-600 mb-4">결제 실패</h1>
            <p className="text-red-700 mb-2">{message}</p>
            {code && <p className="text-sm text-red-600">에러 코드: {code}</p>}
          </div>
        </div>

        {orderId && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-lg font-semibold mb-2">주문 정보</h2>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">주문번호</span>
              <span className="font-mono">{orderId}</span>
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-blue-800 mb-2">
            결제 실패 주요 원인
          </h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-blue-700">
            <li>다른 사용자가 이미 상품을 구매함</li>
            <li>카드 한도 초과 또는 잔액 부족</li>
            <li>카드 정보 입력 오류</li>
            <li>사용자가 결제를 취소함</li>
          </ul>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => navigate("/")}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            홈으로
          </button>
          <button
            onClick={() => navigate(-1)}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            다시 시도
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentFail;
