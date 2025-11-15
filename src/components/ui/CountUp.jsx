import { useEffect, useState } from "react";

const CountUp = ({ endValue, duration = 1500 }) => {
  const [count, setCount] = useState(0);
  const startValue = 0;

  useEffect(() => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = timestamp - startTimestamp;
      const percentage = Math.min(progress / duration, 1);

      // 값 보간 (Interpolation)
      const nextCount = Math.floor(
        percentage * (endValue - startValue) + startValue
      );
      setCount(nextCount);

      if (percentage < 1) {
        window.requestAnimationFrame(step);
      }
    };

    // endValue가 유효한 숫자일 때만 애니메이션 시작
    if (typeof endValue === "number" && endValue > 0) {
      setCount(0); // 시작 시 0으로 초기화
      window.requestAnimationFrame(step);
    } else {
      setCount(endValue || 0);
    }

    // key prop 변경으로 이 effect가 다시 실행되므로, 추가적인 cleanup은 필요 없음
    return () => {
      // 컴포넌트 unmount 시 또는 key 변경 시 effect cleanup
    };
  }, [endValue, duration]); // key가 변경되면 컴포넌트 자체가 리렌더링되어 effect 재실행 보장

  // 숫자를 천 단위 구분 기호와 함께 포맷
  return <>{count.toLocaleString()}</>;
};
export default CountUp;
