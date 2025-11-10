import { useEffect, useState } from "react";
import useReviewStore from "../../store/reviewStore";
import ReviewCard from "./reviewCard";
import CreateReview from "./createReview";

const ReviewList = ({ user }) => {
  const { sellerReviews, getSellerReviews } = useReviewStore();
  const [showCreateReview, setShowCreateReview] = useState(false);

  useEffect(() => {
    const loadSellerReviews = async () => {
      try {
        await getSellerReviews(user.id);
      } catch (err) {
        console.error(err);
      }
    };
    loadSellerReviews();
  }, [getSellerReviews]);
  return (
    <div>
      <button
        onClick={() => setShowCreateReview(true)}
        className="cursor-pointer bg-rebay-blue rounded-md py-[10.5px] px-[22px] flex items-center justify-center shadow-sm hover:opacity-90 transition"
      >
        <div className="font-presentation text-white text-[12px] font-medium">
          후기작성(임시)
        </div>
      </button>
      {sellerReviews && (
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
