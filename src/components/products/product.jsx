import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaImage } from "react-icons/fa";
import api from "../../services/api";

const PriceFormat = (value) =>
  value == null
    ? ""
    : new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(
        Number(value)
      );

const Product = ({ post, onClick, variant = "default" }) => {
  const navigate = useNavigate();
  const [signedUrl, setSignedUrl] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadImage = async () => {
      try {
        const fileKey = post?.imageUrl || "";
        if (!fileKey) {
          if (!cancelled) {
            setSignedUrl("");
            setLoading(false);
          }
          return;
        }
        setLoading(true);
        const res = await api.get(
          `/api/upload/post/image?url=${encodeURIComponent(fileKey)}`
        );
        const url = res?.data?.imageUrl || "";
        if (!cancelled) setSignedUrl(url);
      } catch (err) {
        console.error("[product] presigned fetch failed:", err);
        if (!cancelled) setSignedUrl("");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadImage();
    return () => {
      cancelled = true;
    };
  }, [post?.imageUrl]);

  const handleClick = () => {
    if (typeof onClick === "function") return onClick(post);
    if (post?.id != null) navigate(`/products/${post.id}`);
  };

  const variants = {
    compact: {
      wrapper: "w-[130px] h-[230px] ",
      imageHeight: "h-[120px]",
      titleText: "font-semibold text-[11px]",
      priceText: "text-[10px] font-semibold",
      descText: "text-[10px]",
      iconSize: 50,
    },
    default: {
      wrapper: "w-[190px] h-[320px] ",
      imageHeight: "h-[200px]",
      titleText: "font-semibold text-[15px]",
      priceText: "text-[14px] font-semibold",
      descText: "text-[12px] text-gray-500",
      iconSize: 72,
    },
  };

  const currentStyle = variants[variant] || variants.default;

  return (
    <div className={`${currentStyle.wrapper}`}>
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") handleClick();
        }}
        className="group w-full h-full border border-gray-200 rounded-[12px] bg-white 
                   hover:shadow-md hover:-translate-y-[2px] transition-transform text-left
                   focus:outline-none focus:ring-2 focus:ring-blue-300"
      >
        <div
          className={`m-3 ${currentStyle.imageHeight} bg-gray-200 rounded-[10px] overflow-hidden flex items-center justify-center`}
        >
          {signedUrl ? (
            <img
              src={signedUrl}
              alt={post?.title || "상품"}
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform"
              loading="lazy"
              onError={() => setSignedUrl("")}
            />
          ) : (
            <FaImage
              size={`${currentStyle.iconSize}`}
              className="text-rebay-gray-300"
            />
          )}
        </div>

        <div className="mx-3 mb-3">
          <div
            className={`${currentStyle.titleText} leading-snug line-clamp-1`}
          >
            {post?.title || "제목 없음"}
          </div>

          {post?.price != null && (
            <div className={`${currentStyle.priceText} mt-1`}>
              {PriceFormat(post.price)}원
            </div>
          )}

          {post?.content && (
            <div className={`${currentStyle.descText} mt-1 line-clamp-2`}>
              {post.content}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Product;
