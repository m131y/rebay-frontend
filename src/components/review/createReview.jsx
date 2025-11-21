import { FiX } from "react-icons/fi";
import Input from "../ui/Input";
import { BsStar, BsStarFill } from "react-icons/bs";
import useReviewStore from "../../store/reviewStore";
import { useEffect, useMemo, useState } from "react";

const CreateReview = ({ review, onClose }) => {
  const { createReview, updateReview, loading, error } = useReviewStore();

  const [formData, setFormData] = useState({
    content: review?.content ? review?.content : "",
    rating: review?.rating ? review?.rating : "",
    transactionId: "",
  });

  const [transactionId, setTransactionId] = useState(0);

  const stars = [1, 2, 3, 4, 5];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (review) {
        const { content, rating } = formData;
        await updateReview(review.id, { content, rating });
        alert(`성공적으로 수정되었습니다.`);
        onClose();
      } else {
        await createReview(formData.transactionId, {
          content: formData.content,
          rating: formData.rating,
        });
        alert(`성공적으로 등록되었습니다.`);
        onClose();
      }
    } catch (error) {
      alert(`후기 등록에 실패하였습니다.`);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRating = (count) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      rating: count,
    }));
  };

  const starElements = useMemo(() => {
    const currentCount = formData.rating || 0;
    return stars.map((index) => (
      <span
        key={index}
        style={{ cursor: "pointer" }}
        onClick={() => handleRating(index)}
      >
        {index <= currentCount ? (
          <BsStarFill size={30} color="#ffc107" />
        ) : (
          <BsStar size={30} color="#e4e5e9" />
        )}
      </span>
    ));
  }, [formData.rating]);

  return (
    <div>
      <div className="w-[350px]">
        <div className="">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl ">
            <div className="flex justify-end pt-4 pr-4">
              <FiX onClick={onClose} className="cursor-pointer" />
            </div>
            <div className="px-12 py-5">
              <form
                className="font-presentation flex flex-col gap-[15px]"
                onSubmit={handleSubmit}
              >
                <Input
                  type="text"
                  name="transactionId"
                  placeholder="transactionId"
                  value={formData.transactionId}
                  onChange={handleChange}
                  required
                />
                <textarea
                  type="text"
                  name="content"
                  placeholder="후기를 입력해주세요."
                  value={formData.content}
                  onChange={handleChange}
                  required
                  className="text-lg p-4 resize-none w-full rounded-xl bg-gray-50/50 border border-gray-200 h-[100px] focus:outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-100 transition-all"
                  rows="2"
                />
                <div className="flex justify-center">{starElements}</div>
                <button
                  className="cursor-pointer mt-4 bg-rebay-blue w-full h-[40px] rounded-xl text-white font-bold"
                  type="submit"
                  disabled={loading || !formData || !formData}
                >
                  {loading ? "저장 중..." : "저장"}
                </button>
              </form>

              {error && <p className="text-error">{error}</p>}

              <div className="flex items-center justify-center my-4"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateReview;
