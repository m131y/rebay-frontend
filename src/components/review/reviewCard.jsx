import { HiOutlineDotsVertical } from "react-icons/hi";
import useAuthStore from "../../store/authStore";
import Avatar from "../ui/Avatar";
import {
  BsFillPencilFill,
  BsFillTrashFill,
  BsStar,
  BsStarFill,
} from "react-icons/bs";
import { useState } from "react";
import useReviewStore from "../../store/reviewStore";
import CreateReview from "./createReview";

const ReviewCard = ({ review }) => {
  const { user } = useAuthStore();

  const [showReviewSetting, setShowReviewSetting] = useState(false);
  const [showEditReview, setShowEditReview] = useState(false);

  const { deleteReview } = useReviewStore();

  const handleReviewEdit = () => {
    setShowEditReview(true);
  };

  const handleReviewDelete = async () => {
    const isConfirmed = confirm("후기를 삭제하시겠습니까?");

    if (isConfirmed) {
      await deleteReview(review.id);
      window.location.reload();
    }
  };

  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= review.rating) {
      stars.push(<BsStarFill key={i} size={20} color="#ffc107" />);
    } else {
      stars.push(<BsStar key={i} size={20} color="#e4e5e9" />);
    }
  }

  let createdAt = review.createdAt.substring(0, 10);

  const isOwnReview = user.id === review.reviewer.id;

  return (
    <div className="flex items-center mt-5 w-full ">
      <div className="font-presentation text-xl flex h-[150px] w-[990px] border-b-1 border-gray-400">
        <Avatar size="size-30" user={review.reviewer} />
        <div className="w-full flex justify-between px-4">
          <div className="">
            <div className="text-2xl">{review.reviewer.username}</div>
            <div className="flex">{stars}</div>
            <div className="text-2xl">{review.postName}</div>
            <div>{review.content}</div>
          </div>
          <div className="flex flex-col items-end">
            <div>{createdAt}</div>
            <div className="flex justify-end">
              {isOwnReview ? (
                <div
                  className="cursor-pointer"
                  onClick={() => setShowReviewSetting(!showReviewSetting)}
                >
                  <HiOutlineDotsVertical />
                </div>
              ) : (
                <div></div>
              )}
            </div>
            {showReviewSetting && (
              <div className="w-[70px] h-auto flex items-center justify-center flex-col shadow">
                <div
                  className="cursor-pointer flex items-center"
                  onClick={handleReviewEdit}
                >
                  <BsFillPencilFill size={15} className="mx-1" /> 수정
                </div>
                <div
                  className="cursor-pointer flex items-center"
                  onClick={handleReviewDelete}
                >
                  <BsFillTrashFill size={15} className="mx-1" /> 삭제
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {showEditReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <CreateReview
            review={review}
            onClose={() => setShowEditReview(false)}
          />
        </div>
      )}
    </div>
  );
};

export default ReviewCard;
