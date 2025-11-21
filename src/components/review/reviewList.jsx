import { useEffect, useState } from "react";
import useReviewStore from "../../store/reviewStore";
import ReviewCard from "./reviewCard";
import CreateReview from "./createReview";
import { FiAlignLeft, FiArrowLeft, FiArrowRight } from "react-icons/fi";

const ReviewList = ({ user, variant = "default" }) => {
  const {
    ReviewerReviews,
    getReviewerReviewes,
    sellerReviews,
    getSellerReviews,
  } = useReviewStore();

  const [showCreateReview, setShowCreateReview] = useState(false);
  const [reviewType, setReviewType] = useState("SellerReviews");

  const handleSelecSellerdReviews = () => {
    setReviewType("SellerReviews");
  };

  const handleSelectWrittenReviews = () => {
    setReviewType("WrittenReviews");
  };

  useEffect(() => {
    const loadReviews = async () => {
      try {
        await getSellerReviews(user.id);
        await getReviewerReviewes(user.id);
      } catch (err) {
        console.error(err);
      }
    };
    loadReviews();
  }, [getSellerReviews, getReviewerReviewes]);

  const reviewsToDisplay =
    variant === "compact"
      ? sellerReviews
      : reviewType === "SellerReviews"
      ? sellerReviews
      : ReviewerReviews;

  return (
    <div>
      {variant === "default" && (
        <>
          <div className="flex justify-between mb-4">
            <button
              onClick={() => setShowCreateReview(true)}
              className="cursor-pointer bg-rebay-blue rounded-md py-[10.5px] px-[22px] flex items-center justify-center shadow-sm hover:opacity-90 transition"
            >
              <div className="font-presentation text-white text-[12px] font-medium">
                후기작성(임시)
              </div>
            </button>
          </div>

          <div className="flex font-presentation justify-between mb-6 pb-2">
            <div
              className={`cursor-pointer hover:underline flex items-center ${
                reviewType === "SellerReviews"
                  ? "font-bold text-rebay-blue"
                  : "text-gray-600"
              }`}
              onClick={handleSelecSellerdReviews}
            >
              <FiArrowLeft className="mr-1" /> 상점 후기
            </div>
            <div
              className={`cursor-pointer hover:underline flex items-center ${
                reviewType === "WrittenReviews"
                  ? "font-bold text-rebay-blue"
                  : "text-gray-600"
              }`}
              onClick={handleSelectWrittenReviews}
            >
              작성한 후기 <FiArrowRight className="ml-1" />
            </div>
          </div>
        </>
      )}

      <div>
        {reviewsToDisplay && (
          <div className="text-rebay-gray-700">
            {reviewsToDisplay.length !== 0 ? (
              <div className="space-y-4">
                {reviewsToDisplay.map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    variant={variant}
                  />
                ))}
              </div>
            ) : (
              <div className="font-presentation flex justify-center items-center h-[200px] text-xl text-gray-500">
                아직 없어요.
              </div>
            )}
          </div>
        )}
      </div>

      {showCreateReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <CreateReview onClose={() => setShowCreateReview(false)} />
        </div>
      )}
    </div>
  );
};

export default ReviewList;
