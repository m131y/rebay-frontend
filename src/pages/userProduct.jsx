// ✅ src/pages/userProduct.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import postService from "../services/post";
import { FiHeart, FiEye } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import Avatar from "../components/ui/Avatar";
import MainLayout from "../components/layout/MainLayout";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import useStatisticsStore from "../store/statisticsStore";
import useAuthStore from "../store/authStore";
import useReviewStore from "../store/reviewStore";
import ReviewList from "../components/review/reviewList";
import useFollowStore from "../store/followStore";
import { preparePayment } from "../services/payment";
import TradeChart from "../components/ui/TradeChart";
import { Chart as ChartJS } from "chart.js";

import { chatApi } from "../services/chat";

ChartJS.defaults.font.family = "Presentation";
ChartJS.defaults.font.size = 11;
ChartJS.defaults.font.weight = "400";

const priceFormat = (v) =>
  v == null
    ? ""
    : new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(
        Number(v)
      );

const CATEGORY_HIERARCHY = {
  200: {
    name: "전자기기",
    children: {
      210: {
        name: "카메라",
        children: {
          211: { name: "DSLR/미러리스" },
          212: { name: "일반 디지털 카메라" },
        },
      },
      220: { name: "음향기기", children: {} },
      230: { name: "게임/취미", children: {} },
      240: {
        name: "노트북/PC",
        children: {
          241: { name: "노트북" },
          242: { name: "데스크탑/본체" },
          243: { name: "모니터/주변기기" },
        },
      },
      250: { name: "태블릿/웨어러블", children: {} },
      260: {
        name: "핸드폰",
        children: {
          261: { name: "아이폰13" },
          262: { name: "아이폰13 mini" },
          263: { name: "아이폰13 Pro" },
          264: { name: "아이폰13 Pro Max" },
          265: { name: "아이폰14" },
          266: { name: "아이폰14 Pro" },
          267: { name: "아이폰14 Pro Max" },
          268: { name: "아이폰14 Plus" },
          269: { name: "아이폰15" },
          270: { name: "아이폰15 Pro" },
          271: { name: "아이폰15 Pro Max" },
          272: { name: "아이폰15 Plus" },
          273: { name: "아이폰16" },
          274: { name: "아이폰16 Pro" },
          275: { name: "아이폰16 Pro Max" },
          276: { name: "아이폰16 Plus" },
          277: { name: "아이폰17" },
          278: { name: "아이폰17 Air" },
          279: { name: "아이폰17 Pro Max" },
          281: { name: "기타 아이폰 모델" },
          290: { name: "갤럭시/기타 안드로이드폰" },
        },
      },
      280: { name: "디지털 액세서리", children: {} },
    },
  },

  300: {
    name: "생활가전",
    children: {
      310: { name: "대형가전", children: {} },
      320: { name: "주방가전", children: {} },
      330: { name: "미용/건강가전", children: {} },
      340: { name: "계절가전", children: {} },
    },
  },

  400: {
    name: "가구/인테리어",
    children: {
      410: {
        name: "침대/매트리스",
        children: {
          411: { name: "싱글침대" },
          412: { name: "더블/퀸/킹 침대" },
        },
      },
      420: { name: "소파/테이블", children: {} },
      430: { name: "조명", children: {} },
      440: { name: "수납/선반", children: {} },
    },
  },

  500: {
    name: "생활/주방",
    children: {
      510: { name: "조리도구", children: {} },
      520: { name: "식기/컵", children: {} },
      530: { name: "청소/세탁 용품", children: {} },
    },
  },

  600: { name: "도서", children: {} },
  700: { name: "식물/반려동물", children: {} },

  800: {
    name: "의류/잡화",
    children: {
      810: { name: "남성 의류", children: {} },
      820: { name: "여성 의류", children: {} },
      830: {
        name: "가방/잡화",
        children: {
          831: { name: "명품 가방" },
          832: { name: "지갑/벨트" },
          833: { name: "시계" },
        },
      },
    },
  },

  900: { name: "기타 중고 물품", children: {} },
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

  const { user } = useAuthStore();
  const { getStatisticsByUserProfile, getTradeHistory } = useStatisticsStore();
  const { toggleFollow } = useFollowStore();

  const [isfollowing, setIsFollowing] = useState(null);
  const [post, setPost] = useState(null);
  const [imgUrl, setImgUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [tradeHistoryList, setTradeHistoryList] = useState([]);

  const fetchedRef = useRef(false);

  const [tabCounts, setTabCounts] = useState({
    post: 0,
    review: 0,
    follower: 0,
    following: 0,
  });

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

  useEffect(() => {
    const fetchSeller = async () => {
      try {
        setTabCounts(await getStatisticsByUserProfile(post?.user?.id));
        setIsFollowing(post?.user?.following);
      } catch (err) {
        console.error("❌ 유저 조회 실패:", err);
      }
    };

    fetchSeller();
  }, [post]);

  const handleToggleFollow = async () => {
    await toggleFollow(post?.user?.id);
    setTabCounts(await getStatisticsByUserProfile(post?.user?.id));
    setIsFollowing(!isfollowing);
  };

  const isOwnProduct = post?.user?.id === user?.id;

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

  // 채팅 시작 핸들러
  const handleStartChat = async () => {
    if (!user) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }
    if (user.id === post.user.id) {
      alert("자신의 상품과는 채팅할 수 없습니다.");
      return;
    }

    try {
      // 채팅방 생성/조회 요청
      const res = await chatApi.createOrGetRoom(post.user.id);
      const roomId = res.data;

      // 채팅방으로 이동
      navigate(`/chat/${roomId}`);
    } catch (err) {
      console.error("채팅방 연결 실패:", err);
      alert("채팅방 연결에 실패했습니다.");
    }
  };

  //  결제 준비
  const handlePurchase = async () => {
    if (!post || !user) return;

    try {
      const res = await preparePayment(post.id, user.id, post.price);

      navigate("/checkout", { state: { transaction: res } });
    } catch (err) {
      console.error("결제 준비 실패: ", err);
      alert("결제 준비에 실패했습니다.");
    }
  };

  const findCategoryName = (code) => {
    if (!code) {
      return "";
    }

    if (CATEGORY_HIERARCHY[code]) {
      return CATEGORY_HIERARCHY[code].name;
    }

    const searchRecursive = (children) => {
      for (const key in children) {
        if (!Object.prototype.hasOwnProperty.call(children, key)) {
          continue;
        }

        const currentCode = parseInt(key, 10);
        const currentCategory = children[key];

        if (currentCode === code) {
          return currentCategory.name;
        }

        if (currentCategory.children) {
          const foundName = searchRecursive(currentCategory.children);
          if (foundName) {
            return foundName;
          }
        }
      }
      return null;
    };

    for (const rootCode in CATEGORY_HIERARCHY) {
      if (Object.prototype.hasOwnProperty.call(CATEGORY_HIERARCHY, rootCode)) {
        const found = searchRecursive(CATEGORY_HIERARCHY[rootCode].children);
        if (found) {
          return found;
        }
      }
    }

    return "";
  };

  const categoryLabel = useMemo(
    () => findCategoryName(post?.categoryCode),
    [post?.categoryCode]
  );

  useEffect(() => {
    const fetchTradeHistory = async () => {
      if (!post?.categoryCode) {
        return;
      }

      const code = post.categoryCode;

      try {
        const history = await getTradeHistory(code);
        setTradeHistoryList(history);
      } catch (err) {
        console.error("❌ 거래 시세 조회 실패:", err);
      }
    };

    fetchTradeHistory();
  }, [post?.categoryCode, getTradeHistory]);

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
          className="px-3 py-1.5 border border-rebay-gray-400 rounded-lg hover:bg-gray-50"
        >
          ‹ 이전으로
        </button>
        <p className="mt-6 text-gray-600">해당 상품을 찾을 수 없습니다.</p>
      </div>
    );

  return (
    <MainLayout>
      <Header />
      <div className="max-w-[1100px] mx-auto px-4 py-6 font-presentation">
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="cursor-pointer px-3 py-1.5 border border-rebay-gray-400 rounded-lg hover:bg-gray-50"
          >
            ‹ 이전으로
          </button>

          {isOwnProduct && (
            <div className="pt-1 flex gap-2">
              <button
                onClick={() => navigate(`/products/${post.id}/edit`)}
                className="cursor-pointer inline-flex items-center justify-center rounded-lg border border-rebay-gray-400 px-4 py-2 hover:bg-gray-100"
              >
                수정
              </button>
              <button
                onClick={async () => {
                  if (!window.confirm("이 상품을 삭제할까요?")) return;
                  try {
                    await postService.deletePost(post.id);
                    navigate("/products");
                  } catch (e) {
                    console.error(e);
                    alert("삭제 실패");
                  }
                }}
                className="cursor-pointer inline-flex items-center justify-center rounded-lg border border-rebay-gray-400 px-4 py-2 hover:bg-gray-100"
              >
                삭제
              </button>
            </div>
          )}
        </div>

        {/* 상단 */}
        <section className="grid grid-cols-12 gap-8">
          {/* 이미지 */}
          <div className="col-span-12 md:col-span-6">
            <div className="relative rounded-2xl border border-rebay-gray-400 shadow p-2 bg-gray-50">
              <button
                onClick={onToggleLike}
                className="cursor-pointer absolute left-3 top-3 z-10 inline-flex items-center gap-1 rounded-full bg-red-500/40 backdrop-blur px-2.5 py-1.5 text-sm hover:bg-red-500/50"
                aria-pressed={liked}
              >
                {liked ? (
                  <FaHeart size={16} className="text-red-500" />
                ) : (
                  <FiHeart size={16} className=" text-white/70" />
                )}
                <span className={liked ? "text-red-600" : "text-white/70"}>
                  {likeCount}
                </span>
              </button>

              <div className="w-[420px] h-[420px] rounded-xl overflow-hidden flex items-center justify-center bg-white">
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
              {!isOwnProduct && (
                <div className="pt-1">
                  <button
                    onClick={handlePurchase}
                    className="cursor-pointer inline-flex items-center justify-center rounded-lg bg-rebay-blue text-white px-7 py-3 text-[15px] shadow hover:shadow-md transition-all font-semibold hover:opacity-90"
                  >
                    구매하기
                  </button>

                  {/* 채팅하기 버튼 추가 */}
                  <button
                    onClick={handleStartChat}
                    className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 px-7 py-3 text-[15px] font-semibold hover:bg-gray-50 transition"
                  >
                    채팅하기
                  </button>
                </div>
              )}

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
            <div className="rounded-2xl border border-rebay-gray-400 p-5 h-full shadow min-h-[240px]">
              <h3 className="text-base font-semibold mb-3">상품정보</h3>
              <p className="text-gray-700 whitespace-pre-wrap">
                {post?.content || "상품 설명이 없습니다."}
              </p>
            </div>
          </div>

          <div className="col-span-12 md:col-span-6">
            <div className="rounded-2xl border border-rebay-gray-400  p-5 h-full shadow min-h-[240px]">
              <h3 className="text-base font-semibold mb-3">사용자 정보</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full overflow-hidden">
                    <Avatar user={post?.user} size="small" />
                  </div>
                  <div className="leading-tight">
                    <div className="font-medium">
                      {post?.user?.username || "판매자"}
                    </div>
                    <div className="text-xs text-gray-500">
                      상품{tabCounts.post} · 팔로워 {tabCounts.follower}
                    </div>
                  </div>
                </div>
                {!isOwnProduct ? (
                  isfollowing ? (
                    <button
                      onClick={handleToggleFollow}
                      className="cursor-pointer px-3 py-1.5 text-white font-bold rounded-full bg-rebay-gray-400 transition shadow hover:shadow-md hover:opacity-90 text-sm"
                    >
                      unfollow
                    </button>
                  ) : (
                    <button
                      onClick={handleToggleFollow}
                      className="cursor-pointer px-3 py-1.5 text-white font-bold rounded-full bg-rebay-blue transition shadow hover:shadow-md hover:opacity-90 text-sm"
                    >
                      Follow +
                    </button>
                  )
                ) : (
                  <div></div>
                )}
              </div>

              <div className="mt-5">
                <div className="text-sm font-medium mb-2">최근 후기</div>
                <ReviewList user={post?.user} variant="compact" />
              </div>
            </div>
          </div>
        </section>

        {tradeHistoryList.length != 0 && (
          <section className="my-6 p-2 font-presentation w-full h-auto border border-rebay-gray-400 rounded-2xl">
            <TradeChart tradeHistoryList={tradeHistoryList} />
          </section>
        )}
      </div>
      <Footer />
    </MainLayout>
  );
}
