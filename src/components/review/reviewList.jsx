import { useEffect, useState } from "react";
import useReviewStore from "../../store/reviewStore";
import ReviewCard from "./reviewCard";
import CreateReview from "./createReview";
import { FiAlignLeft, FiArrowLeft, FiArrowRight } from "react-icons/fi";

const ReviewList = ({ user }) => {
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

  return (
    <div>
      <div className="flex justify-between">
        <button
          onClick={() => setShowCreateReview(true)}
          className="cursor-pointer bg-rebay-blue rounded-md py-[10.5px] px-[22px] flex items-center justify-center shadow-sm hover:opacity-90 transition"
        >
          <div className="font-presentation text-white text-[12px] font-medium">
            후기작성(임시)
          </div>
        </button>
      </div>
      <div className="flex justify-between">
        <div
          className="cursor-pointer hover:underline flex items-center"
          onClick={handleSelecSellerdReviews}
        >
          <FiArrowLeft /> 상점 후기
        </div>
        <div
          className="cursor-pointer hover:underline flex items-center"
          onClick={handleSelectWrittenReviews}
        >
          작성한 후기
          <FiArrowRight />
        </div>
      </div>

      {reviewType === "SellerReviews"
        ? sellerReviews && (
            <div>
              {sellerReviews.length != 0 ? (
                <div>
                  {sellerReviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              ) : (
                <div className="font-presentation flex justify-center items-center h-[200px] text-4xl">
                  아직 없어요
                </div>
              )}
            </div>
          )
        : ReviewerReviews && (
            <div>
              {ReviewerReviews.length != 0 ? (
                <div>
                  {ReviewerReviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              ) : (
                <div className="font-presentation flex justify-center items-center h-[200px] text-4xl">
                  아직 없어요
                </div>
              )}
            </div>
          )}

      {showCreateReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <CreateReview onClose={() => setShowCreateReview(false)} />
        </div>
      )}
    </div>
  );
};

export default ReviewList;
