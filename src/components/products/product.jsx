import { FaImage } from "react-icons/fa";

const Product = ({ title, price, desc, variant = "default" }) => {
  const variants = {
    sm: {
      wrapper: "w-[90px] h-[160px] ",
      imageHeight: "h-[90px]",
      titleText: "text-sm",
      priceText: "text-xs font-semibold",
      descText: "text-[10px]",
      iconSize: 40,
    },
    default: {
      wrapper: "w-[130px] h-[230px] ",
      imageHeight: "h-[140px]",
      titleText: "text-[16px]",
      priceText: "text-[15px] font-semibold",
      descText: "text-[13px]",
      iconSize: 70,
    },
    lg: {
      wrapper: "w-[195px] h-[345px] ",
      imageHeight: "h-[210px]",
      titleText: "text-xl",
      priceText: "text-lg font-bold",
      descText: "text-sm",
      iconSize: 100,
    },
  };

  const currentStyle = variants[variant] || variants.default;

  return (
    <div className={`${currentStyle.wrapper}`}>
      <div className="w-full h-full border border-gray-200 rounded-sm">
        <div
          className={`w-auto ${currentStyle.imageHeight} bg-gray-300 m-2 flex items-center justify-center`}
        >
          <FaImage
            size={`${currentStyle.iconSize}`}
            className=" text-rebaygray-100"
          />
        </div>
        <div className="m-2">
          <div className={`font-presentation ${currentStyle.titleText}`}>
            {title}
          </div>
          <div className={`font-presentation ${currentStyle.priceText}`}>
            {price}
          </div>
          <div className={`font-presentation ${currentStyle.descText}`}>
            {desc}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Product;
