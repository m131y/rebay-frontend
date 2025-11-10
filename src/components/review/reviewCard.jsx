import Avatar from "../ui/Avatar";
import { BsStar, BsStarFill } from "react-icons/bs";

const ReviewCard = ({ review }) => {
  let numericRating = 0;

  if (review.rating === "FIVE") {
    numericRating = 5;
  } else if (review.rating === "FOUR") {
    numericRating = 4;
  } else if (review.rating === "THREE") {
    numericRating = 3;
  } else if (review.rating === "TWO") {
    numericRating = 2;
  } else if (review.rating === "ONE") {
    numericRating = 1;
  }

  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= numericRating) {
      stars.push(<BsStarFill key={i} size={20} color="#ffc107" />);
    } else {
      stars.push(<BsStar key={i} size={20} color="#e4e5e9" />);
    }
  }

  let createdAt = review.createdAt.substring(0, 10);

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
          <div className="">
            <div>{createdAt}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;
