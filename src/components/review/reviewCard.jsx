import { HiOutlineDotsVertical } from "react-icons/hi";
import useAuthStore from "../../store/authStore";
import Avatar from "../ui/Avatar";
import {
  BsFillPencilFill,
  BsFillTrashFill,
  BsStar,
  BsStarFill,
} from "react-icons/bs";
import { useEffect, useRef, useState } from "react";
import useReviewStore from "../../store/reviewStore";
import CreateReview from "./createReview";

const ReviewCard = ({ review, variant }) => {
  const { user } = useAuthStore();

  const [showMenu, setShowMenu] = useState(false);
  const [showEditReview, setShowEditReview] = useState(false);

  const { deleteReview } = useReviewStore();

  const menuRef = useRef(null);

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

  useEffect(() => {
    const handleClickOutSide = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutSide);
      return () => {
        document.removeEventListener("mousedown", handleClickOutSide);
      };
    }
  }, [showMenu]);

  const stars = [];
  const starSize = variant === "default" ? 20 : 10;
  for (let i = 1; i <= 5; i++) {
    if (i <= review.rating) {
      stars.push(<BsStarFill key={i} size={starSize} color="#ffc107" />);
    } else {
      stars.push(<BsStar key={i} size={starSize} color="#e4e5e9" />);
    }
  }

  let createdAt = review.createdAt.substring(0, 10);

  const isOwnReview = user.id === review.reviewer.id;
  if (variant == "default") {
    return (
      <div className="flex items-center mt-5 w-full ">
        <div className="font-presentation text-xl flex h-[150px] w-[990px] border-b-1 border-gray-400">
          <Avatar size="size-30" user={review.reviewer} />
          <div className="w-full flex justify-between px-4">
            <div className="">
              <div className="text-2xl text-gray-900">
                {review.reviewer.username}
              </div>
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
                    onClick={() => setShowMenu(!showMenu)}
                  >
                    <HiOutlineDotsVertical />
                  </div>
                ) : (
                  <div></div>
                )}
              </div>
              {showMenu && (
                <div
                  className="w-[70px] h-auto flex items-center justify-center flex-col shadow"
                  ref={menuRef}
                >
                  <div
                    className="cursor-pointer w-full hover-bg-rebay-gray-100 flex justify-center items-center"
                    onClick={handleReviewEdit}
                  >
                    <BsFillPencilFill size={15} className="mx-1" /> 수정
                  </div>
                  <div
                    className="cursor-pointer  w-full hover-bg-rebay-gray-100 flex justify-center items-center"
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
  }

  if (variant == "compact") {
    return (
      <div className="flex items-center mt-5 w-full ">
        <div className="font-presentation flex h-[35px] w-full border-gray-400">
          <Avatar user={review.reviewer} />
          <div className="w-full flex justify-between px-2">
            <div className="w-full leading-0.5">
              <div className="flex justify-between">
                <div className="text-xs flex flex-col text-black">
                  {review.reviewer.username}님의 후기
                  <div className="text-xs ">{review.content}</div>
                </div>
                <div className="flex flex-col">
                  <div className="flex space-x-1">{stars}</div>
                  <div className="flex text-xs justify-end text-rebay-gray-500">
                    {createdAt}
                  </div>
                </div>
              </div>
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
  }
};

export default ReviewCard;
