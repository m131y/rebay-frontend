// src/components/products/product.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaImage } from "react-icons/fa";
import api from "../../services/api";
import useAuthStore from "../../store/authStore";

const PriceFormat = (value) =>
  value == null
    ? ""
    : new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(
        Number(value)
      );

const Product = ({ post, onClick, variant = "default", type }) => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [signedUrl, setSignedUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const isAuction = type === "AUCTION";

  const isSold = post?.status === "SOLD";

  useEffect(() => {
    let cancelled = false;

    const loadImage = async () => {
      try {
        const fileKey = post?.thumbnailImageUrl || "";
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
  }, [post?.thumbnailImageUrl]);

  const handleClick = () => {
    if (typeof onClick === "function") return onClick(post);
    const finalId = post?.id ?? post?.productId;
    if (!user) {
      return;
    }

    if (finalId != null) {
      if (type === "POST") {
        navigate(`/products/${finalId}`);
      } else {
        navigate(`/auctions/${finalId}`);
      }
    }
  };

  const variants = {
    compact: {
      wrapper: "w-[130px] h-[230px]",
      imageHeight: "h-[120px]",
      titleText: "font-semibold text-[11px]",
      priceText: "text-[10px] font-semibold",
      descText: "text-[10px]",
      iconSize: 50,
    },
    default: {
      wrapper: "w-[190px] h-[320px]",
      imageHeight: "h-[200px]",
      titleText: "font-semibold text-[15px]",
      priceText: "text-[14px] font-semibold",
      descText: "text-[12px] text-gray-500",
      iconSize: 72,
    },
  };

  const currentStyle = variants[variant] || variants.default;

  const cardType = `group w-full h-full border rounded-[12px] 
                   hover:shadow-md hover:-translate-y-[2px] transition-transform text-left
                   focus:outline-none focus:ring-2 focus:ring-blue-300  ${
                     isAuction
                       ? "bg-red-50 border-red-300"
                       : "bg-blue-50 border-blue-300"
                   }`;

  return (
    <div className={`cursor-pointer ${currentStyle.wrapper}`}>
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") handleClick();
        }}
        className={cardType}
      >
        {/* 이미지 영역 */}
        <div
          className={`relative m-3 ${currentStyle.imageHeight} bg-gray-200 rounded-[10px] overflow-hidden flex items-center justify-center`}
        >
          {signedUrl ? (
            <img
              src={signedUrl}
              alt={post?.title || "상품"}
              className="w-full h-full  object-cover group-hover:scale-[1.02] transition-transform"
              loading="lazy"
              onError={() => setSignedUrl("")}
            />
          ) : (
            <FaImage
              size={currentStyle.iconSize}
              className="text-rebay-gray-300"
            />
          )}

          {/* 판매완료 오버레이 (SOLD일 때만) */}
          {isSold && (
            <div className="absolute inset-0 flex items-center justify-center">
              {/* 배경 살짝 어둡게 */}
              <div className="absolute inset-0 bg-black/20" />
              {/* 동그란 배지 */}
              <div className="relative flex items-center justify-center w-[86px] h-[86px] rounded-full bg-black/60 text-white text-xs font-semibold">
                판매완료
              </div>
            </div>
          )}
        </div>

        {/* 텍스트 영역 */}
        <div className="mx-3 mb-3">
          <div className={`${currentStyle.titleText} `}>
            <div className="flex w-full justify-between">
              <div className=" truncate">{post?.title || "제목 없음"}</div>
            </div>
          </div>

          {post?.price != null ? (
            <div className={`${currentStyle.priceText} mt-1`}>
              {PriceFormat(post.price)}원
            </div>
          ) : (
            <div className={`${currentStyle.priceText} mt-1`}>
              입찰가: {PriceFormat(post.currentPrice)}원
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
