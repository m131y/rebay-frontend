const Trade = ({ history }) => {
  const purchasedAt = history.purchasedAt.substring(0, 10);
  return (
    <div className="flex justify-between">
      <div>{purchasedAt}</div>
      <div>{history.price.toLocaleString("ko-KR")} 원</div>
    </div>
  );
};
export default Trade;
