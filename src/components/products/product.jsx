import { useEffect, useState } from "react";
import { FaImage } from "react-icons/fa";
import api from "../../services/api";

const PriceFormat = (value) =>
  value == null
    ? ""
    : new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(
        Number(value)
      );

const Product = ({ post, onClick }) => {
  const [signedUrl, setSignedUrl] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadImage = async () => {
      try {
        const fileKey = post?.imageUrl || "";
        if (!fileKey) {
          if (!cancelled) setSignedUrl("");
          return;
        }

        const res = await api.get(
          `/api/upload/post/image?url=${encodeURIComponent(fileKey)}`
        );
        const url = res?.data?.imageUrl || "";
        if (!cancelled) setSignedUrl(url);
      } catch (err) {
        console.error("[product] presigned fetch failed:", err);
        if (!cancelled) setSignedUrl("");
      }
    };

    loadImage();
    return () => {
      cancelled = true;
    };
  }, [post]);

  return (
    <div className="w-[190px] h-[320px]">
      <button
        type="button"
        onClick={onClick}
        className="w-full h-full border border-gray-200 rounded-[12px] bg-white hover:shadow-sm transition text-left"
      >
        <div className="m-3 h-[200px] bg-gray-100 rounded-[10px] overflow-hidden flex items-center justify-center">
          {signedUrl ? (
            <img
              src={signedUrl}
              alt={post?.title || "상품"}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={() => setSignedUrl("")}
            />
          ) : (
            <FaImage size={72} className="text-rebaygray-100" />
          )}
        </div>

        <div className="mx-3 mb-3">
          <div className="font-presentation text-[16px] font-semibold leading-snug line-clamp-1">
            {post?.title}
          </div>
          <div className="font-presentation text-[14px] font-semibold mt-1">
            {post?.price != null ? `${PriceFormat(post.price)}원` : ""}
          </div>
          <div className="font-presentation text-[12px] text-gray-500 mt-1 line-clamp-2">
            {post?.content}
          </div>
        </div>
      </button>
    </div>
  );
};

export default Product;
