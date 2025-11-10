import { useNavigate, useParams } from "react-router-dom";
import Footer from "../components/layout/Footer";
import Header from "../components/layout/Header";
import MainLayout from "../components/layout/MainLayout";
import Avatar from "../components/ui/Avatar";
import useAuthStore from "../store/authStore";
import useUserStore from "../store/userStore";
import { useEffect, useState } from "react";
import Product from "../components/products/product";
import ReviewList from "../components/review/reviewList";
import CreateReview from "../components/review/createReview";
import useReviewStore from "../store/reviewStore";

const UserProfile = () => {
  const { targetUserId } = useParams();
  const { user } = useAuthStore();
  const { userProfile, getUserProfile } = useUserStore();
  const { getReviewsCountByUser } = useReviewStore();
  const navigate = useNavigate();

  const navItems = [
    { id: "product", label: "상품" },
    { id: "review", label: "후기" },
    { id: "follower", label: "팔로워" },
    { id: "following", label: "팔로잉" },
  ];

  const [activeTab, setActiveTab] = useState("product");
  const [showProduct, setShowProduct] = useState(true);
  const [showReview, setShowReview] = useState(false);
  const [showFollower, setShowFollower] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);

  const [tabCounts, setTabCounts] = useState({
    product: 0,
    review: 0,
    follower: 0,
    following: 0,
  });

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);

    if (tabId == "product") {
      setShowProduct(true);
      setShowReview(false);
      setShowFollower(false);
      setShowFollowing(false);
    }

    if (tabId == "review") {
      setShowProduct(false);
      setShowReview(true);
      setShowFollower(false);
      setShowFollowing(false);
    }

    if (tabId == "follower") {
      setShowProduct(false);
      setShowReview(false);
      setShowFollower(true);
      setShowFollowing(false);
    }

    if (tabId == "following") {
      setShowProduct(false);
      setShowReview(false);
      setShowFollower(false);
      setShowFollowing(true);
    }
  };

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        await getUserProfile(targetUserId);
      } catch (err) {
        console.error(err);
      }
    };
    loadUserProfile();
  }, [getUserProfile, targetUserId]);

  useEffect(() => {
    const loadTapDetails = async () => {
      try {
        setTabCounts(await getReviewsCountByUser(targetUserId));
      } catch (err) {
        console.error(err);
      }
    };
    loadTapDetails();
  }, [activeTab, targetUserId, getReviewsCountByUser]);

  const isOwnProfile = userProfile?.id === user?.id;

  return (
    <div>
      {userProfile && (
        <MainLayout>
          <Header />
          <main className="w-full flex-grow flex flex-col items-center mt-[70px] py-10">
            <div className="font-presentation flex justify-between w-[990px]">
              <div className="flex items-center">
                <Avatar user={userProfile} size="size-[150px]" />
                <div className="ml-10 ">
                  <div className="text-2xl">{userProfile.username}</div>
                  <div className="flex">
                    <div> {userProfile.fullName}</div>
                    <div className="mx-2"> | </div>
                    <div> {userProfile.email}</div>
                  </div>
                  <div className=" font-presentation w-full text-lg flex justify-start items-center">
                    {userProfile.bio ? (
                      <div>{userProfile.bio}</div>
                    ) : (
                      <div>자기소개</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-[20px]">
                {isOwnProfile ? (
                  <button
                    onClick={() => navigate(`/user/${userProfile.id}/edit`)}
                    className="cursor-pointer w-[120px] h-[40px] rounded-xl shadow-sm hover:shadow-lg font-bold bg-rebay-gray-300 transition-all  duration-200 hover-bg-rebay-gray-300"
                  >
                    edit
                  </button>
                ) : (
                  <button className="cursor-pointer w-[120px] h-[40px] rounded-xl shadow-sm hover:shadow-lg font-bold text-white bg-rebay-blue transition-all  duration-200 hover:opacity-90">
                    follow +
                  </button>
                )}
              </div>
            </div>
            <div className="w-[1400px]">
              <div class="p-[0.5px] bg-gradient-to-r from-white via-gray-400 to-white w-full md:w-3/4 mx-auto my-8">
                <div class="h-[0.5px] bg-white rounded-full"></div>
              </div>
            </div>

            <div className="w-[990px] font-presentation flex space-x-20 text-2xl">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={`cursor-pointer w-full flex justify-center items-center shadow-bottom border-b-3  border-rebay-gray-300 mb-[20px] h-[60px] transition-colors ${
                      isActive
                        ? "text-black border-rebay-gray-500 transition-all"
                        : "text-gray-500"
                    }`}
                    aria-label={item.label}
                  >
                    {item.label}
                    {tabCounts[`${item.id}`]}
                    {/* 현재 후기 갯수만 조회 */}
                  </button>
                );
              })}
            </div>

            <div className="w-[990px]">
              {showProduct && (
                <section className="mt-[20px] w-full h-[700px] flex flex-col items-center justify-start space-y-5 mx-auto">
                  <div className="w-full h-auto">
                    <div className="grid grid-cols-5 gap-[10px]">
                      <Product variant="lg" />
                      <Product variant="lg" />
                      <Product variant="lg" />
                      <Product variant="lg" />
                      <Product variant="lg" />
                      <Product variant="lg" />
                      <Product variant="lg" />
                      <Product variant="lg" />
                      <Product variant="lg" />
                      <Product variant="lg" />
                    </div>
                  </div>
                </section>
              )}

              {showReview && <ReviewList user={userProfile} />}
            </div>
          </main>
          <Footer />
        </MainLayout>
      )}
    </div>
  );
};

export default UserProfile;
