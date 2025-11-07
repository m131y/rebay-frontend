import { FaImage } from "react-icons/fa";

const Product = () => {
  return (
    <div className="w-[130px] h-[230px] ">
      <div className="w-full h-full border border-gray-200 rounded-sm">
        <div className="w-auto h-[140px] bg-gray-300 m-2 flex items-center justify-center">
          <FaImage size={70} className=" text-rebaygray-100" />
        </div>
        <div className="m-2">
          <div className="font-presentation text-[16px]">제목</div>
          <div className="font-presentation text-[15px]">가격</div>
          <div className="font-presentation text-[13px]">설명</div>
        </div>
      </div>
    </div>
  );
};

export default Product;
