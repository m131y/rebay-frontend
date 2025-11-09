import { useEffect } from "react";
import useReviewStore from "../store/reviewStore";
import ReviewCard from "./reviewCard";

const ReviewList = ({ user }) => {
  const { sellerReviews, getSellerReviews } = useReviewStore();

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
    </div>
  );
};

export default ReviewList;
