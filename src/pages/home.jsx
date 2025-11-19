import Footer from "../components/layout/Footer";
import Header from "../components/layout/Header";
import MainLayout from "../components/layout/MainLayout";
import Product from "../components/products/product";
import { Link, useNavigate } from "react-router-dom";
import ImageSlider from "../components/ui/imageSlider";
import { useEffect, useRef, useState } from "react";
import useStatisticsStore from "../store/statisticsStore";
import useAuthStore from "../store/authStore";
import useUserStore from "../store/userStore";
import Login from "../components/auth/login";
import Signup from "../components/auth/signup";
import CountUp from "../components/ui/CountUp";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import KeywordCards from "../components/ui/keywordCard";

const Home = () => {
  const {
    weeklyTopPosts,
    dailyTopKeywords,
    userAvgEarnings,
    getTopLikedProductsLastWeek,
    getDailyTop10Keywords,
    getAverageEarningsPerUser,
    getPersonalizedRecommendations,
    loading,
  } = useStatisticsStore();
  const { getSearchHistory, searchHistory } = useUserStore();
  const { user, logout, error } = useAuthStore();

  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  const navigate = useNavigate();
  const handleOpenSignup = () => {
    setShowLogin(false);
    setShowSignup(true);
  };

  const handleOpenLogin = () => {
    setShowLogin(true);
    setShowSignup(false);
  };

  const handleLogout = () => {
    logout();
    window.location.reload();
  };

  const handleProductClick = (post) => {
    if (!user) {
      setShowLogin(true);
    } else {
      navigate(`/products/${post.id}`);
    }
  };

  const handleSellClick = () => {
    if (!user) {
      setShowLogin(true);
    } else {
      navigate(`/sell`);
    }
  };

  const [personalizedRecommendationPosts, setPersonalizedRecommendationPosts] =
    useState([]);

  useEffect(() => {
    const fetchData = async () => {
      await getTopLikedProductsLastWeek();
      await getDailyTop10Keywords();
      await getAverageEarningsPerUser();
    };

    fetchData();
  }, [
    getTopLikedProductsLastWeek,
    getDailyTop10Keywords,
    getAverageEarningsPerUser,
  ]);

  useEffect(() => {
    if (userAvgEarnings !== null) {
      const interval = setInterval(() => {
        setAnimationKey((prevKey) => prevKey + 1);
      }, 10000);

      return () => clearInterval(interval);
    }
    setAnimationKey((prevKey) => prevKey + 1);
  }, [userAvgEarnings]);

  useEffect(() => {
    if (!user) {
      setPersonalizedRecommendationPosts([]); // 혹시 모를 이전 데이터 초기화
      return;
    }

    const fetchUserData = async () => {
      const recommendations = await getPersonalizedRecommendations();
      setPersonalizedRecommendationPosts(recommendations || []);

      await getSearchHistory();
    };

    fetchUserData();
  }, [user, getPersonalizedRecommendations, getSearchHistory]);

  const scrollRef = useRef(null);
  const scrollStep = 200;

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -scrollStep, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: scrollStep, behavior: "smooth" });
    }
  };

  return (
    <MainLayout>
      <Header />
      {loading && <div className="text-center mt-20">데이터 로딩 중...</div>}
      {!loading && (
        <main className="w-full flex-grow flex flex-col items-center mt-[50px] py-10">
          <div className="w-full max-w-[1300px] flex flex-col items-center space-y-15">
            <section className="w-[690px] flex flex-col items-center justify-start space-y-5">
              <div className="w-full flex flex-col gap-4 items-start justify-start mx-auto">
                <div className="w-full flex flex-col gap-[2.6px] items-start">
                  <h1 className="font-presentation text-black text-[36px] font-bold ">
                    여기서만 느낄 수 있는 경매의 재미, ReBay
                  </h1>

                  <p className="font-presentation text-[30px] flex items-center font-bold text-gray-800">
                    사람들은 지금
                    <div className="bg-black max-w-max h-[40px] flex items-center justify-center rounded-full mx-1 px-3 text-white">
                      <span className="inline-block mx-1 ">
                        <CountUp
                          key={animationKey}
                          endValue={userAvgEarnings}
                          duration={1500}
                        />
                      </span>
                    </div>
                    원 벌고 있어요
                  </p>
                </div>
                <button
                  onClick={handleSellClick}
                  className="cursor-pointer w-[150px] h-[50px] shadow-sm hover:shadow-lg bg-rebay-blue  transition-all duration-200 hover:opacity-90 rounded-xl flex items-center justify-center"
                >
                  <span className="font-presentation text-white text-[17px]">
                    나도 판매하기
                  </span>
                </button>
              </div>
            </section>

            <section className="w-[690px] flex flex-col justify-center">
              <div className="flex justify-between ">
                <div className=" font-presentation font-bold text-[27px] mb-3">
                  실시간 인기 키워드
                </div>
                <div className="flex m-2 space-x-2">
                  <div
                    onClick={scrollLeft}
                    className="cursor-pointer shadow-md hover:shadow-lg hover-bg-rebay-gray-100 transition-all size-[25px] rounded-full bg-rebay-gray-100 flex justify-center items-center"
                  >
                    <FaChevronLeft className="size-[10px] text-rebay-gray-600" />
                  </div>
                  <div
                    onClick={scrollRight}
                    className="cursor-pointer shadow-md hover:shadow-lg hover-bg-rebay-gray-100 transition-all size-[25px] rounded-full bg-rebay-gray-100 flex justify-center items-center"
                  >
                    <FaChevronRight className="size-[10px] text-rebay-gray-600" />
                  </div>
                </div>
              </div>
              <div
                ref={scrollRef} // useRef로 스크롤 대상 지정
                className="flex flex-row overflow-x-scroll hide-scrollbar space-x-4 h-auto pb-4"
              >
                {dailyTopKeywords.map((keyword, keywordIndex) => (
                  <KeywordCards
                    key={keywordIndex}
                    rank={keywordIndex + 1}
                    term={keyword}
                  />
                ))}
              </div>
            </section>

            {/* <section className="w-full flex justify-center">
              <div className="w-[690px] p-2 border border-rebay-gray-400 flex justify-between font-presentation">
                {searchHistory.map((history) => (
                  <div>{history}</div>
                ))}
              </div>
            </section> */}

            <section className="w-[690px] flex items-center justify-start">
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
            {weeklyTopPosts && (
              <section className="w-[690px] h-[550px] flex flex-col items-center justify-start space-y-5 mx-auto">
                <h2 className="font-presentation text-black text-[30px] font-extrabold text-left self-start">
                  이번 주 인기 상품
                </h2>

                <div className="w-full h-auto">
                  <div className="grid grid-cols-5 gap-[10px]">
                    {weeklyTopPosts.map((post) => (
                      <Product
                        key={post.id}
                        post={post}
                        onClick={handleProductClick}
                        variant="compact"
                      />
                    ))}
                  </div>
                </div>
              </section>
            )}
            {user && (
              <div>
                <section className="w-[690px] h-auto flex flex-col items-center justify-start space-y-5 mx-auto">
                  <h2 className="font-presentation text-black text-[30px] font-extrabold text-left self-start">
                    사용자 활동 기반 추천
                  </h2>

                  <div className="w-full h-auto">
                    <div className="grid grid-cols-5 gap-[10px]">
                      {personalizedRecommendationPosts.map((post) => (
                        <Product key={post.id} post={post} variant="compact" />
                      ))}
                    </div>
                  </div>
                </section>
              </div>
            )}
          </div>
        </main>
      )}

      {showLogin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Login
            onClose={() => setShowLogin(false)}
            onOpenSignup={handleOpenSignup}
          />
        </div>
      )}

      {showSignup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Signup
            onClose={() => setShowSignup(false)}
            onOpenLogin={handleOpenLogin}
          />
        </div>
      )}
      <Footer />
    </MainLayout>
  );
};

export default Home;
