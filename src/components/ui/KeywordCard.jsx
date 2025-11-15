const KeywordCards = ({ key, rank, term }) => {
  let rankColorClass = "bg-rebay-gray-300";
  if (rank === 1) {
    rankColorClass = "bg-rebay-blue"; // 1위 강조
  } else if (rank === 2) {
    rankColorClass = "bg-rebay-blue opacity-80"; // 2~3위 강조
  } else if (rank === 3) {
    rankColorClass = "bg-rebay-blue opacity-60 ";
  }
  return (
    <div className="cursor-pointer flex-shrink-0 bg-rebay-gray-100 w-[200px] h-[110px] rounded-xl shadow mb-4 hover:scale-[1.02] transition duration-300">
      <div
        className={`size-[30px] ${rankColorClass}  rounded-full mt-3 ml-3 flex justify-center items-center`}
      >
        <div className="font-presentation font-bold text-white">{rank}</div>
      </div>
      <div className="font-presentation ml-3 font-semibold text-[27px]">
        {term}
      </div>
      <div className="font-presentation ml-3 text-[13px] text-rebay-gray-600">
        지금 바로 거래해보세요!
      </div>
    </div>
  );
};

export default KeywordCards;
