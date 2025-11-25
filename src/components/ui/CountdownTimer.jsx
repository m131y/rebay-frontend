import { useEffect, useState } from "react";

const CountdownTimer = ({ endTime }) => {
  const [timeLeft, setTimeLeft] = useState(
    () => new Date(endTime).getTime() - new Date().getTime()
  );

  useEffect(() => {
    if (timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft(new Date(endTime).getTime() - new Date().getTime());
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime, timeLeft]);

  if (timeLeft <= 0) {
    return <div className="text-xl text-red-600 font-bold">경매 종료</div>;
  }

  // 밀리초를 시, 분, 초로 변환하는 함수
  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    const minutes = String(Math.floor((totalSeconds / 60) % 60)).padStart(
      2,
      "0"
    );
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    return { hours, minutes, seconds };
  };

  const { hours, minutes, seconds } = formatTime(timeLeft);

  return (
    <div className="flex items-center space-x-2 text-3xl font-extrabold text-rebay-green">
      <div className="bg-black text-white rounded-lg px-2 py-1 min-w-[50px] text-center shadow">
        {hours}
      </div>
      <span className="text-gray-700">:</span>
      <div className="bg-black text-white rounded-lg px-2 py-1 min-w-[50px] text-center shadow">
        {minutes}
      </div>
      <span className="text-gray-700">:</span>
      <div className="bg-black text-white rounded-lg px-2 py-1 min-w-[50px] text-center shadow">
        {seconds}
      </div>
    </div>
  );
};

export default CountdownTimer;
