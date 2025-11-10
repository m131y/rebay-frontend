import { Link } from "react-router-dom";
import useAuthStore from "../../store/authStore";

const Footer = () => {
  const { user } = useAuthStore();
  return (
    <footer className="w-full bg-white">
      <div className="w-full max-w-full mx-auto px-[60px] relative">
        <div className="border-t border-[#e6e6e6] absolute top-0 left-0 w-full"></div>
        <div className="w-full pt-[40px] flex justify-between items-start">
          <div className="font-presentation text-black text-lg font-normal leading-[150%]">
            ReBay
          </div>

          <div className="flex space-x-[36px]">
            <div className="w-[140.25px] flex flex-col gap-[18px] items-end justify-center">
              <div className="font-presentation text-black text-[12px] font-medium leading-[150%]">
                상품
              </div>
              <div className="font-presentation text-[#454545] text-[12px] font-medium leading-[150%] cursor-pointer hover:text-black">
                상품 판매하기
              </div>
              <div className="font-presentation text-[#454545] text-[12px] font-medium leading-[150%] cursor-pointer hover:text-black">
                페이지
              </div>
              <div className="font-presentation text-[#454545] text-[12px] font-medium leading-[150%] cursor-pointer hover:text-black">
                페이지
              </div>
            </div>

            <div className="w-[140.25px] flex flex-col gap-[18px] items-end justify-start text-right">
              <div className="font-presentation text-black text-[12px] font-medium leading-[150%]">
                상점
              </div>
              <div className="font-presentation text-[#454545] text-[12px] font-medium leading-[150%] cursor-pointer hover:text-black">
                페이지
              </div>
              <div className="font-presentation text-[#454545] text-[12px] font-medium leading-[150%] cursor-pointer hover:text-black">
                페이지
              </div>
              <div className="font-presentation text-[#454545] text-[12px] font-medium leading-[150%] cursor-pointer hover:text-black">
                페이지
              </div>
            </div>

            <div className="w-[140.25px] flex flex-col gap-[18px] items-end justify-start text-right">
              <Link
                to={`/user/${user?.id}`}
                className="font-presentation text-black text-[12px] font-medium leading-[150%]"
              >
                마이페이지
              </Link>
              <div className="font-presentation text-[#454545] text-[12px] font-medium leading-[150%] cursor-pointer hover:text-black">
                페이지
              </div>
              <div className="font-presentation text-[#454545] text-[12px] font-medium leading-[150%] cursor-pointer hover:text-black">
                페이지
              </div>
              <div className="font-presentation text-[#454545] text-[12px] font-medium leading-[150%] cursor-pointer hover:text-black">
                페이지
              </div>
            </div>
          </div>
        </div>
        <div className="flex space-x-[6px] pb-[36px] pt-10">
          <div className="buttons-icon w-[30px] h-[30px] p-[6px] relative cursor-pointer hover:opacity-80">
            <img
              className="icon w-[18px] h-[18px]  top-[6px] left-[6px]"
              src="/icon0.svg"
              alt="Social Icon 1"
            />
          </div>
          <div className="buttons-icon w-[30px] h-[30px] p-[6px] relative cursor-pointer hover:opacity-80">
            {" "}
            <img
              className="icon2 w-[18px] h-[18px]  top-[6px] left-[6px]"
              src="/icon1.svg"
              alt="Social Icon 2"
            />
          </div>
          <div className="buttons-icon w-[30px] h-[30px] p-[6px] relative cursor-pointer hover:opacity-80">
            <img
              className="icon3 w-[18px] h-[18px]  top-[6px] left-[6px]"
              src="/icon2.svg"
              alt="Social Icon 3"
            />
          </div>
          <div className="buttons-icon w-[30px] h-[30px] p-[6px] relative cursor-pointer hover:opacity-80">
            <img
              className="icon4 w-[18px] h-[18px] top-[6px] left-[6px]"
              src="/icon3.svg"
              alt="Social Icon 4"
            />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
