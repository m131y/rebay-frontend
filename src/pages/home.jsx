import Footer from "../components/layout/Footer";
import Header from "../components/layout/Header";
import MainLayout from "../components/layout/MainLayout";
import Product from "../components/products/product";
import { Link } from "react-router-dom";
import ImageSlider from "../components/ui/imageSlider";

const Home = () => {
  return (
    <MainLayout>
      <Header />
      <main className="w-full flex-grow flex flex-col items-center mt-[70px] py-10">
        <div className="w-full max-w-[1300px] flex flex-col items-center space-y-24">
          <section className="w-[690px] flex flex-col items-center justify-start space-y-10">
            <div className="w-full flex flex-col gap-9 items-start justify-start mx-auto">
              <div className="w-full flex flex-col gap-[2.6px] items-start">
                <h1 className="font-presentation text-black text-[36px] font-bold ">
                  여기서만 느낄 수 있는 경매의 재미, ReBay
                </h1>
                <p className="font-presentation text-[15px] text-gray-500/75 font-normal">
                  단 하나뿐인 기회를 ReBay에서 잡으세요
                </p>
              </div>
              <Link
                to="/sell"
                className="cursor-pointer w-[150px] h-[50px] shadow-sm hover:shadow-lg bg-rebay-blue  transition-all duration-200 hover:opacity-90 rounded-lg flex items-center justify-center"
              >
                <span className="font-presentation text-white text-[15px]">
                  지금 판매하기
                </span>
              </Link>
            </div>
            {<ImageSlider />}
          </section>

          <section className="w-[690px] h-[200px] flex flex-col items-start space-y-5 mx-auto">
            <h2 className="font-presentation text-black text-[30px] font-extrabold tracking-[-0.02em] mt-[30px]">
              카테고리 별 상품
            </h2>

            <div className="w-full h-[120px] flex justify-start space-x-[15px]">
              <div className="w-[220px] h-[120px] bg-white rounded-[10px] border border-[#e6e6e6] p-[24.99px] flex items-center justify-center">
                <div className="font-presentation text-black text-[20px] font-medium">
                  가전/디지털
                </div>
              </div>

              <div className="w-[220px] h-[120px] bg-white rounded-[10px] border border-[#e6e6e6] p-[24.99px] flex items-center justify-center">
                <div className="font-presentation text-black text-[20px] font-medium">
                  명품/패션
                </div>
              </div>

              <div className="w-[220px] h-[120px] bg-white rounded-[10px] border border-[#e6e6e6] p-[24.99px] flex items-center justify-center">
                <div className="font-presentation text-black text-[20px] font-medium">
                  취미/수집
                </div>
              </div>

              <div className="w-[220px] h-[120px] bg-white rounded-[10px] border border-[#e6e6e6] p-[24.99px] flex items-center justify-center">
                <div className="font-presentation text-black text-[20px] font-medium">
                  예술품
                </div>
              </div>
            </div>
          </section>

          <section className="w-[690px] h-[700px] flex flex-col items-center justify-start space-y-5 mx-auto">
            <h2 className="font-presentation text-black text-[30px] font-extrabold text-left self-start">
              오늘의 인기 상품
            </h2>

            <div className="w-full h-auto">
              <div className="grid grid-cols-5 gap-[10px]">
                <Product title="hi" price="1400" desc="중고" />
                <Product />
                <Product />
                <Product />
                <Product />
                <Product />
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </MainLayout>
  );
};

export default Home;
