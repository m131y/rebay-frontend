// ✅ src/pages/userProduct.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import postService from "../services/post";
import { FiHeart, FiEye } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import Avatar from "../components/ui/Avatar";

const priceFormat = (v) =>
  v == null
    ? ""
    : new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(
        Number(v)
      );

const CATEGORY_LABELS = {
  DIGITAL_DEVICES: "가전/디지털",
  HOME_APPLIANCES: "생활가전",
  FURNITURE: "가구",
  HOME_KITCHEN: "주방/생활",
  BOOKS: "도서",
  PLANTS: "식물",
  CLOTHES: "의류",
  OTHER_USED_ITEMS: "기타 중고물품",
};

const timeAgo = (isoStr) => {
  if (!isoStr) return "";
  const d = new Date(isoStr);
  const diff = Date.now() - d.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "방금 전";
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  const day = Math.floor(h / 24);
  return `${day}일 전`;
};

export default function UserProduct() {
  const { postId } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [imgUrl, setImgUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const fetchedRef = useRef(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/posts/${postId}`); // ✅ 항상 조회수 +1
        const data = res.data;

        if (!data) {
          setPost(null);
          setLoading(false);
          return;
        }

        setPost(data);

        if (data.imageUrl) {
          const imgRes = await api.get(
            `/api/upload/post/image?url=${encodeURIComponent(data.imageUrl)}`
          );
          setImgUrl(imgRes?.data?.imageUrl || data.imageUrl);
        } else {
          setImgUrl(null);
        }
        const rawLiked = localStorage.getItem(`liked:${postId}`);
        const rawCount = localStorage.getItem(`likeCount:${postId}`);
        setLiked(rawLiked ? JSON.parse(rawLiked) : false);
        setLikeCount(rawCount ? Number(rawCount) : 0);
      } catch (err) {
        console.error("❌ 상품 조회 실패:", err);
        setPost(null);
      } finally {
        setLoading(false);
      }
    };

    // React StrictMode 대비
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      fetchPost();
    }
  }, [postId]);

  const onToggleLike = async () => {
    if (!post?.id) return;
    try {
      const { isLiked, likeCount } = await postService.toggleLike(post.id);
      setLiked(isLiked);
      setLikeCount(likeCount);
      localStorage.setItem(`liked:${postId}`, JSON.stringify(isLiked));
      localStorage.setItem(`likeCount:${post.id}`, String(likeCount)); // ✅ 추가
    } catch (e) {
      console.error("좋아요 실패:", e);
    }
  };

  const categoryLabel = useMemo(
    () => CATEGORY_LABELS[post?.category] || "",
    [post?.category]
  );

  if (loading)
    return (
      <div className="max-w-[1100px] mx-auto px-4 py-6 text-gray-500">
        로딩 중입니다...
      </div>
    );

  if (!post)
    return (
      <div className="max-w-[1100px] mx-auto px-4 py-6">
        <button
          onClick={() => navigate(-1)}
          className="px-3 py-1.5 border rounded-lg hover:bg-gray-50"
        >
          ‹ 이전으로
        </button>
        <p className="mt-6 text-gray-600">해당 상품을 찾을 수 없습니다.</p>
      </div>
    );

  return (
    <div className="max-w-[1100px] mx-auto px-4 py-6">
      <div className="mb-4">
        <button
          onClick={() => navigate(-1)}
          className="px-3 py-1.5 border rounded-lg hover:bg-gray-50"
        >
          ‹ 이전으로
        </button>
      </div>

      {/* 상단 */}
      <section className="grid grid-cols-12 gap-8">
        {/* 이미지 */}
        <div className="col-span-12 md:col-span-6">
          <div className="relative rounded-2xl border p-2 bg-gray-50">
            <button
              onClick={onToggleLike}
              className="absolute left-3 top-3 z-10 inline-flex items-center gap-1 rounded-full bg-white/90 backdrop-blur px-2.5 py-1.5 text-sm border hover:bg-white"
              aria-pressed={liked}
            >
              {liked ? (
                <FaHeart size={16} className="text-red-500" />
              ) : (
                <FiHeart size={16} className="text-gray-500" />
              )}
              <span className={liked ? "text-red-600" : "text-gray-700"}>
                {likeCount}
              </span>
            </button>

            <div className="h-[420px] rounded-xl overflow-hidden flex items-center justify-center bg-white">
              {imgUrl ? (
                <img
                  src={imgUrl || undefined}
                  alt={post?.title || "상품 이미지"}
                  className="max-h-[420px] w-auto object-contain"
                />
              ) : (
                <div className="w-full h-full bg-gray-100" />
              )}
            </div>
          </div>
        </div>

        {/* 정보 */}
        <div className="col-span-12 md:col-span-6">
          <div className="flex flex-col space-y-5">
            {categoryLabel && (
              <span className="inline-block self-start rounded-full bg-indigo-50 text-indigo-600 text-xs font-medium px-2 py-0.5">
                {categoryLabel}
              </span>
            )}
            <div className="space-y-2">
              <h1 className="text-[34px] font-extrabold tracking-tight">
                {post?.title}
              </h1>
              <div className="text-[24px] font-bold">
                {post?.price != null ? `${priceFormat(post.price)}원` : ""}
              </div>
            </div>
            <div className="flex items-center gap-5 text-sm text-gray-500">
              <span>{timeAgo(post?.createdAt)}</span>
              <span className="inline-flex items-center gap-1">
                <FiEye /> 조회 {post?.viewCount ?? 0}회
              </span>
            </div>
            <div className="pt-1">
              <button className="inline-flex items-center justify-center rounded-lg bg-blue-600 text-white px-7 py-3 text-[15px] font-semibold hover:bg-blue-700">
                구매하기
              </button>
            </div>
            {!!(post?.hashtags && post.hashtags.length) && (
              <div className="flex flex-wrap gap-2 pt-1">
                {post.hashtags.map((t) => (
                  <span
                    key={t.id ?? t}
                    className="rounded-full bg-purple-50 text-purple-600 text-xs font-medium px-2 py-0.5"
                  >
                    #{t.name ?? t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 하단 */}
      <section className="grid grid-cols-12 gap-6 mt-8">
        <div className="col-span-12 md:col-span-6">
          <div className="rounded-2xl border p-5 h-full min-h-[240px]">
            <h3 className="text-base font-semibold mb-3">상품정보</h3>
            <p className="text-gray-700 whitespace-pre-wrap">
              {post?.content || "상품 설명이 없습니다."}
            </p>
          </div>
        </div>

        <div className="col-span-12 md:col-span-6">
          <div className="rounded-2xl border p-5 h-full min-h-[240px]">
            <h3 className="text-base font-semibold mb-3">사용자 정보</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full overflow-hidden">
                  {" "}
                  {/* ✅ 크기 고정 */}
                  <Avatar
                    user={{
                      username: post?.user?.username || "판매자",
                      profileImageUrl: post?.user?.profileImageUrl || null,
                    }}
                    size="small"
                  />
                </div>
                <div className="leading-tight">
                  <div className="font-medium">
                    {post?.user?.username || "판매자"}
                  </div>
                  <div className="text-xs text-gray-500">상품 · 팔로워 -</div>
                </div>
              </div>
              <button className="px-3 py-1.5 border rounded-full hover:bg-gray-50 text-sm">
                + Follow
              </button>
            </div>

            <div className="mt-5">
              <div className="text-sm font-medium mb-2">최근 후기</div>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm">
                  <span className="w-7 h-7 rounded-full bg-gray-200 inline-block" />
                  <span>userB 의 후기</span>
                  <span className="ml-auto text-yellow-500">★★★★★</span>
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <span className="w-7 h-7 rounded-full bg-gray-200 inline-block" />
                  <span>userC 의 후기</span>
                  <span className="ml-auto text-yellow-500">★★★★★</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
