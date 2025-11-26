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
import ReviewList from "../components/review/reviewList";
import useFollowStore from "../store/followStore";
import { preparePayment } from "../services/payment";
import TradeChart from "../components/ui/TradeChart";
import { Chart as ChartJS } from "chart.js";

import { chatApi } from "../services/chat";
import CountdownTimer from "../components/ui/CountdownTimer";
import likeService from "../services/like";

import { EventSourcePolyfill } from "event-source-polyfill";
import StorageService from "../services/storage";

ChartJS.defaults.font.family = "Presentation";
ChartJS.defaults.font.size = 11;
ChartJS.defaults.font.weight = "400";

const priceFormat = (v) =>
  v == null
    ? ""
    : new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(
        Number(v)
      );

// ======================
// A버전 공통 이미지 키 추출 함수
// (ProductCreate에서 쓰던 컨셉이랑 동일하게 여러 필드 지원)
// ======================
function extractImageKeys(post) {
  if (!post) return [];

  // 1) 여러 장 배열 형태 우선 확인
  const candidates = [
    post.imageUrls,
    post.images,
    post.imageList,
    post.photos,
    post.files,
    post.attachments,
    post.postImages,
    post.imageKeys,
  ].filter(Boolean);

  for (const cand of candidates) {
    if (Array.isArray(cand) && cand.length > 0) {
      const arr = cand
        .map((it) => {
          if (typeof it === "string") return it;
          if (!it || typeof it !== "object") return null;
          return (
            it.imageUrl || it.url || it.key || it.path || it.fileKey || null
          );
        })
        .filter((s) => typeof s === "string" && s.trim());
      if (arr.length) return arr;
    }
  }

  // 2) 단일 이미지 필드
  if (typeof post.imageUrl === "string" && post.imageUrl.trim()) {
    return [post.imageUrl.trim()];
  }

  return [];
}

const CATEGORY_HIERARCHY = {
  // -------------------------
  // 200: 전자기기 (Digital Devices)
  // -------------------------
  200: {
    name: "전자기기",
    children: {
      210: {
        name: "카메라",
        children: {
          211: { name: "DSLR/미러리스" },
          212: { name: "필름/토이카메라" },
          213: { name: "액션캠/드론" },
        },
      },
      220: {
        name: "음향기기",
        children: {
          221: { name: "이어폰/헤드폰" },
          222: { name: "스피커/앰프" },
        },
      },
      230: {
        name: "게임/타이틀",
        children: {
          231: { name: "PlayStation 5" },
          232: { name: "PlayStation 5 pro" },
          233: { name: "닌텐도 스위치" },
          234: { name: "닌텐도 스위치 라이트" },
          235: { name: "닌텐도 스위치 2" },
        },
      },
      240: {
        name: "노트북/PC",
        children: {
          241: { name: "MacBook Air 13" },
          242: { name: "MacBook Air 15" },
          243: { name: "MacBook Pro 14" },
          244: { name: "MacBook Pro 16" },
        },
      },
      250: {
        name: "모니터/주변기기",
        children: {
          251: { name: "모니터" },
          252: { name: "키보드/마우스" },
          253: { name: "프린터/스캐너" },
        },
      },
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
        },
      },
      280: {
        name: "스마트워치/밴드",
        children: {}, // Level 3 코드가 없으므로 빈 객체 유지
      },
    },
  },

  // -------------------------
  // 300: 생활가전 (Home Appliances)
  // -------------------------
  300: {
    name: "생활가전",
    children: {
      310: {
        name: "대형가전",
        children: {
          311: { name: "TV" },
          312: { name: "냉장고/김치냉장고" },
          313: { name: "세탁기/건조기" },
        },
      },
      320: {
        name: "주방가전",
        children: {
          321: { name: "커피머신/포트" },
          322: { name: "전자레인지/오븐" },
        },
      },
      330: {
        name: "계절가전/공기",
        children: {
          331: { name: "에어컨/냉방" },
          332: { name: "난방기/온풍기" },
          333: { name: "공기청정기/가습기" },
        },
      },
      340: {
        name: "미용/건강가전",
        children: {}, // Level 3 코드가 없으므로 빈 객체 유지
      },
    },
  },

  // -------------------------
  // 400: 가구/인테리어 (Furniture/Interior)
  // -------------------------
  400: {
    name: "가구/인테리어",
    children: {
      410: {
        name: "침대/매트리스",
        children: {
          411: { name: "싱글침대" },
          412: { name: "더블/퀸/킹 침대" },
          413: { name: "화장대/협탁" },
        },
      },
      420: {
        name: "소파/테이블",
        children: {
          421: { name: "패브릭/가죽 소파" },
          422: { name: "식탁/책상" },
        },
      },
      430: {
        name: "수납/서랍장",
        children: {
          431: { name: "책장/선반" },
          432: { name: "옷장/붙박이장" },
        },
      },
      440: {
        name: "조명/DIY",
        children: {
          441: { name: "스탠드/장스탠드" },
          442: { name: "인테리어 소품" },
        },
      },
    },
  },

  // -------------------------
  // 500: 생활/주방 (Home/Kitchen)
  // -------------------------
  500: {
    name: "생활/주방",
    children: {
      510: {
        name: "조리도구",
        children: {
          511: { name: "냄비/프라이팬" },
          512: { name: "칼/도마" },
        },
      },
      520: {
        name: "식기/컵",
        children: {
          521: { name: "접시/그릇" },
          522: { name: "머그/와인잔" },
        },
      },
      530: {
        name: "침구/패브릭",
        children: {
          531: { name: "이불/베개" },
          532: { name: "커튼/블라인드" },
        },
      },
      540: {
        name: "청소/세탁용품",
        children: {}, // Level 3 코드가 없으므로 빈 객체 유지
      },
    },
  },

  // -------------------------
  // 600: 도서 (Books)
  // -------------------------
  600: {
    name: "도서",
    children: {
      610: {
        name: "소설/에세이",
        children: {}, // Level 3 코드가 없으므로 빈 객체 유지
      },
      620: {
        name: "학습/수험서",
        children: {}, // Level 3 코드가 없으므로 빈 객체 유지
      },
    },
  },

  // -------------------------
  // 700: 식물/반려동물 (Plants/Pets)
  // -------------------------
  700: {
    name: "식물/반려동물",
    children: {
      710: {
        name: "화분/정원용품",
        children: {}, // Level 3 코드가 없으므로 빈 객체 유지
      },
      720: {
        name: "반려동물용품",
        children: {}, // Level 3 코드가 없으므로 빈 객체 유지
      },
    },
  },

  // -------------------------
  // 800: 의류/잡화 (Apparel/Goods)
  // -------------------------
  800: {
    name: "의류/잡화",
    children: {
      810: {
        name: "상의/아우터",
        children: {
          811: { name: "티셔츠/셔츠" },
          812: { name: "맨투맨/후드티" },
          813: { name: "코트/자켓" },
        },
      },
      820: {
        name: "하의/원피스",
        children: {
          821: { name: "청바지/슬랙스" },
          822: { name: "스커트/원피스" },
        },
      },
      830: {
        name: "가방/잡화",
        children: {
          831: { name: "명품 가방" },
          832: { name: "지갑/벨트" },
          833: { name: "모자/장갑" },
        },
      },
      840: {
        name: "신발",
        children: {
          841: { name: "운동화/스니커즈" },
          842: { name: "구두/부츠" },
        },
      },
      850: {
        name: "시계/쥬얼리",
        children: {}, // Level 3 코드가 없으므로 빈 객체 유지
      },
    },
  },

  // -------------------------
  // 900: 기타 중고 물품 (Other Used Items)
  // -------------------------
  900: {
    name: "기타 중고 물품",
    children: {}, // Level 2, 3 코드가 없으므로 빈 객체 유지
  },
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
  const { productId } = useParams();
  const isAuction = window.location.pathname.startsWith("/auctions/");
  const navigate = useNavigate();

  const [isSold, setIsSold] = useState();

  const { user } = useAuthStore();
  const { getStatisticsByUserProfile, getTradeHistory } = useStatisticsStore();
  const { toggleFollow } = useFollowStore();

  const [isfollowing, setIsFollowing] = useState(null);
  const [post, setPost] = useState(null);

  const [images, setImages] = useState([]); // presign된 이미지 URL 배열
  const [current, setCurrent] = useState(0); // 대표 인덱스

  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [tradeHistoryList, setTradeHistoryList] = useState([]);

  const [isClosingAuction, setIsClosingAuction] = useState(false);
  const hasClosedRef = useRef(false); // 중복 호출 방지

  const fetchedRef = useRef(false);

  const [tabCounts, setTabCounts] = useState({
    post: 0,
    review: 0,
    follower: 0,
    following: 0,
  });

  const [isBidModalOpen, setIsBidModalOpen] = useState(false);
  const [bidInput, setBidInput] = useState("");

  const formatAuctionTime = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const hour = date.getHours().toString().padStart(2, "0");
    const minute = date.getMinutes().toString().padStart(2, "0");

    return `${year}년 ${month}월 ${day}일 ${hour}시 ${minute}분`;
  };

  const shouldShowTradeChart = useMemo(() => {
    if (!post?.categoryCode) return false;
    const code = post.categoryCode;

    // 카테고리 코드가 23x, 24x, 26x 범위에 속하는지 확인
    if (code >= 200 && code < 900) {
      // Level 2 코드 추출 (예: 261 -> 260)
      const level2Code = Math.floor(code / 10) * 10;
      return level2Code === 230 || level2Code === 240 || level2Code === 260;
    }

    return false;
  }, [post?.categoryCode]);

  // SSE 연결 및 실시간 가격 업데이트 로직
  useEffect(() => {
    // 경매가 아니거나, 로그인이 안 되어 있거나, post 정보가 없으면 스킵
    if (!isAuction || !post?.id || !user) return;

    const token = StorageService.getAccessToken();
    const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8080";

    // SSE 연결 생성 (헤더에 토큰 포함)
    const eventSource = new EventSourcePolyfill(
      `${baseURL}/api/auction/${post.id}/stream`,
      {
        headers: { Authorization: `Bearer ${token}` },
        heartbeatTimeout: 86400000,
      }
    );

    eventSource.onopen = () => {
      console.log("경매 실시간 연결 성공");
    };

    // 서버에서 "BID_UPDATE" 이벤트를 보내면 처리
    eventSource.addEventListener("BID_UPDATE", (e) => {
      const data = JSON.parse(e.data);
      console.log("실시간 입찰 정보 수신:", data);

      // 화면의 가격 정보를 실시간으로 업데이트
      setPost((prev) => ({
        ...prev,
        price: data.currentPrice, // 현재가 갱신
        currentPrice: data.currentPrice,
      }));
    });

    return () => {
      eventSource.close(); // 페이지 나가면 연결 종료
      console.log("경매 연결 종료");
    };
  }, [isAuction, post?.id, user]);

  // 입찰 버튼 클릭 핸들러
  const handleBid = async () => {
    if (!user) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    const inputPrice = window.prompt(
      `현재가: ${priceFormat(post.price)}원\n얼마를 입찰하시겠습니까?`,
      post.price + 1000 // 기본값: 현재가 + 1000원
    );

    if (!inputPrice) return; // 취소

    const bidAmount = Number(inputPrice);
    if (isNaN(bidAmount)) {
      alert("숫자만 입력해주세요.");
      return;
    }

    if (bidAmount <= post.price) {
      alert("현재가보다 높은 금액을 입력해야 합니다.");
      return;
    }

    try {
      await postService.placeBid(post.id, bidAmount);
      alert("입찰에 성공했습니다!");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "입찰에 실패했습니다.");
    }
  };

  // 상품 상세 + 이미지 presign
  useEffect(() => {
    if (!productId) return;

    const fetchPost = async () => {
      try {
        let response;
        if (isAuction) {
          response = await postService.getAuction(productId);
        } else {
          response = await postService.getPost(productId);
        }

        console.log(response);
        setPost(response);
        setIsSold(response?.status === "SOLD");

        // ⭐ 여러 장 이미지 키 추출 → presign URL 변환
        const keys = extractImageKeys(response);

        if (keys.length > 0) {
          try {
            const urls = await Promise.all(
              keys.map(async (k) => {
                try {
                  const imgRes = await api.get(
                    `/api/upload/post/image?url=${encodeURIComponent(k)}`
                  );
                  return imgRes?.data?.imageUrl || k;
                } catch {
                  return k; // presign 실패 시 원본 key 그대로
                }
              })
            );
            setImages(urls);
            setCurrent(0);
          } catch {
            setImages(keys);
            setCurrent(0);
          }
        } else {
          setImages([]);
        }

        console.log(response);
        setLiked(response.liked);
        setLikeCount(response.likeCount);
      } catch (err) {
        console.error("❌ 상품 조회 실패:", err);
        setPost(null);
        setImages([]);
      } finally {
        setLoading(false);
      }
    };

    // React StrictMode 대비
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      fetchPost();
    }
  }, [productId, isAuction]);

  // 판매자 정보
  useEffect(() => {
    const fetchSeller = async () => {
      try {
        setTabCounts(await getStatisticsByUserProfile(post?.seller?.id));
        setIsFollowing(post?.seller?.following);
      } catch (err) {
        console.error("❌ 유저 조회 실패:", err);
      }
    };

    if (post?.seller?.id) fetchSeller();
  }, [post?.seller?.id, post?.seller?.following, getStatisticsByUserProfile]);

  const handleToggleFollow = async () => {
    await toggleFollow(post?.seller?.id);
    setTabCounts(await getStatisticsByUserProfile(post?.seller?.id));
    setIsFollowing(!isfollowing);
  };

  const isOwnProduct = post?.seller?.id === user?.id;

  const onToggleLike = async () => {
    if (!post?.id) return;
    try {
      if (isAuction) {
        const { isLiked, likeCount } = await likeService.toggleAuctionLike(
          post.id
        );
        setLiked(isLiked);
        setLikeCount(likeCount);
      } else {
        const { isLiked, likeCount } = await likeService.toggleLike(post.id);
        setLiked(isLiked);
        setLikeCount(likeCount);
      }
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
    if (user.id === post.seller.id) {
      alert("자신의 상품과는 채팅할 수 없습니다.");
      return;
    }

    try {
      // 채팅방 생성/조회 요청
      const res = await chatApi.createOrGetRoom(post.seller.id);
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

  const auctionStatus = useMemo(() => {
    if (!isAuction || !post?.startTime || !post?.endTime) return null;

    const now = new Date().getTime();
    const start = new Date(post.startTime).getTime();
    const end = new Date(post.endTime).getTime();

    if (now < start) {
      return "PENDING"; // 경매 대기
    } else if (now >= start && now <= end) {
      return "ACTIVE"; // 경매 진행
    } else {
      return "ENDED"; // 경매 종료
    }
  }, [isAuction, post?.startTime, post?.endTime]);

  const isBidDisabled =
    auctionStatus === "PENDING" ||
    auctionStatus === "ENDED" ||
    isClosingAuction; // 종료 처리 중에도 비활성화

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
    // 경매가 아니거나, 종료 상태가 아니면 스킵
    if (!isAuction || auctionStatus !== "ENDED") {
      return;
    }

    // 이미 처리했으면 스킵
    if (hasClosedRef.current || isClosingAuction) {
      return;
    }

    // 경매 종료 API 호출
    const handleAuctionClose = async () => {
      try {
        setIsClosingAuction(true);
        hasClosedRef.current = true;

        console.log("경매 종료 처리 시작:", post.id);

        // closeAuction API 호출 (endTime 전달)
        const response = await postService.closeAuction(post.id, post.endTime);

        console.log("경매 종료 완료:", response);

        // 필요하면 상태 업데이트
        // 예: 낙찰자 정보 표시 등
        if (response.auctionStatus === "WON") {
          alert("축하합니다! 낙찰되었습니다!");
        } else if (response.auctionStatus === "LOSE") {
          alert("아쉽게도 낙찰에 실패했습니다.");
        }

        // 거래 내역 페이지로 이동하거나, 페이지 새로고침
        // navigate(`/user/${user.id}/transactions`);
      } catch (error) {
        console.error("경매 종료 처리 실패:", error);
        hasClosedRef.current = false; // 실패시 재시도 가능하도록
      } finally {
        setIsClosingAuction(false);
      }
    };

    handleAuctionClose();
  }, [auctionStatus, isAuction, post?.id, post?.endTime]);

  useEffect(() => {
    const fetchTradeHistory = async () => {
      if (!post?.categoryCode) {
        return;
      }

      if (!shouldShowTradeChart || !post?.categoryCode) {
        setTradeHistoryList([]);
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

  const prev = () =>
    setCurrent((i) =>
      images.length ? (i - 1 + images.length) % images.length : 0
    );
  const next = () =>
    setCurrent((i) => (images.length ? (i + 1) % images.length : 0));
  const go = (idx) => setCurrent(idx);

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

  let statusText = "일반 상품";
  let statusBgColor = "bg-gray-400"; // 일반 상품 기본 색상 (예시)

  if (isAuction) {
    if (auctionStatus === "PENDING") {
      statusText = "경매 대기";
      statusBgColor = "bg-gray-500";
    } else if (auctionStatus === "ACTIVE") {
      statusText = "경매 진행";
      statusBgColor = "bg-red-700"; // 진행 중
    } else if (auctionStatus === "ENDED") {
      statusText = "경매 종료";
      statusBgColor = "bg-gray-500"; // 종료
    }
  }

  // 모달 컴포넌트
  const BidModal = () => {
    if (!isBidModalOpen) return null;
    const handleSubmit = async (e) => {
      e.preventDefault();
      const amount = Number(bidInput);

      if (isNaN(amount) || amount <= post.price) {
        alert("현재가보다 높은 금액을 입력해주세요.");
        return;
      }

      try {
        // 기존 handleBid 로직 호출 (API 전송)
        await postService.placeBid(post.id, amount);

        // 성공 시 처리
        alert("입찰 성공!");
        setIsBidModalOpen(false);
        setBidInput("");
      } catch (err) {
        alert(err.response?.data?.message || "입찰 실패");
      }
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white w-[400px] rounded-2xl shadow-2xl p-6 font-presentation animate-fadeIn">
          <h3 className="text-xl font-bold mb-4 text-gray-800">입찰하기</h3>

          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-1">현재 최고가</p>
            <p className="text-2xl font-bold text-rebay-blue">
              {priceFormat(post.currentPrice)}원
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              입찰하실 금액을 입력하세요
            </label>
            <input
              type="number"
              value={bidInput}
              onChange={(e) => setBidInput(e.target.value)}
              placeholder={post.currentPrice + 1000}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-rebay-blue focus:ring-2 focus:ring-blue-100 outline-none transition-all text-lg font-bold mb-6"
              autoFocus
            />

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsBidModalOpen(false)}
                className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-600 font-bold hover:bg-gray-50 transition"
              >
                취소
              </button>
              <button
                type="submit"
                className="flex-1 py-3 rounded-xl bg-rebay-blue text-white font-bold hover:opacity-90 shadow-lg transition"
              >
                입찰확인
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <MainLayout>
      <Header />
      <div className="max-w-[1100px] mx-auto px-4 py-6 font-presentation">
        {/* 상단 버튼 줄 */}
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
                onClick={() => {
                  if (isAuction) {
                    if (
                      auctionStatus === "ENDED" ||
                      auctionStatus === "ACTIVE"
                    ) {
                      alert(
                        "경매가 진행중 이거나 종료된 상품은 수정할 수 없습니다."
                      );
                    } else {
                      navigate(`/auctions/${post.id}/edit`);
                    }
                  } else {
                    navigate(`/products/${post.id}/edit`);
                  }
                }}
                className="cursor-pointer inline-flex items-center justify-center rounded-lg border border-rebay-gray-400 px-4 py-2 hover:bg-gray-100"
              >
                수정
              </button>
              <button
                onClick={async () => {
                  if (!window.confirm("이 상품을 삭제할까요?")) return;
                  try {
                    if (isAuction) {
                      await postService.deleteAuction(post.id);
                      navigate("/products");
                    } else {
                      await postService.deletePost(post.id);
                      navigate("/products");
                    }
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

        {/* 상단 영역 */}
        <section className="grid grid-cols-12 gap-8">
          <div className="col-span-12 md:col-span-6">
            <div className="relative rounded-2xl border border-rebay-gray-400 shadow p-2 bg-gray-50">
              {/* 좋아요 버튼 */}
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

              {/* 대표 이미지 박스 */}
              <div className="w-[420px] h-[420px] rounded-xl overflow-hidden flex items-center justify-center bg-white relative mx-auto">
                {images.length > 0 ? (
                  <img
                    src={images[current]}
                    alt={post?.title || "상품 이미지"}
                    className="max-h-[420px] w-auto object-contain select-none"
                    onError={(e) =>
                      (e.currentTarget.style.visibility = "hidden")
                    }
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100" />
                )}

                {/* 이전/다음 화살표 */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prev}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full w-8 h-8 flex items-center justify-center shadow"
                      aria-label="이전 이미지"
                    >
                      ‹
                    </button>
                    <button
                      onClick={next}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full w-8 h-8 flex items-center justify-center shadow"
                      aria-label="다음 이미지"
                    >
                      ›
                    </button>
                  </>
                )}
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

              {/* 인디케이터 점 */}
              {images.length > 1 && (
                <div className="flex items-center justify-center gap-2 mt-3">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => go(idx)}
                      className={`w-2.5 h-2.5 rounded-full ${
                        current === idx ? "bg-gray-800" : "bg-gray-300"
                      }`}
                      aria-label={`이미지 ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 정보 영역 */}
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
                  {isAuction ? (
                    <div>{priceFormat(post.currentPrice)}원</div>
                  ) : (
                    <div>{priceFormat(post.price)}원</div>
                  )}
                </div>
                {isAuction && (
                  <div>
                    {auctionStatus === "ACTIVE" ? (
                      <div className="flex flex-col space-y-2 ">
                        <div className="flex justify-center items-center text-2xl shadow font-semibold bg-red-700 rounded-full text-white w-[110px] h-[40px]">
                          입찰 중
                        </div>
                        <div className="pt-2">
                          <CountdownTimer endTime={post.endTime} />
                        </div>
                      </div>
                    ) : (
                      <div>
                        {auctionStatus === "PENDING" && (
                          <div className="flex flex-col space-y-4 text-xl">
                            <div className="flex justify-center items-center text-2xl shadow font-semibold bg-black rounded-full text-white w-[110px] h-[40px]">
                              진행 예정
                            </div>
                            <div className="flex space-x-2">
                              <div className="rounded-xl px-2 bg-black text-white font-semibold">
                                {formatAuctionTime(post?.startTime)}
                              </div>
                              <div>~</div>
                              <div className="rounded-xl px-2 bg-black text-white font-semibold">
                                {formatAuctionTime(post?.endTime)}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-5 text-sm text-gray-500">
                <span>{timeAgo(post?.createdAt)}</span>
                <span className="inline-flex items-center gap-1">
                  <FiEye /> 조회 {post?.viewCount ?? 0}회
                </span>
              </div>
              {!isOwnProduct && (
                <div className="pt-1 flex gap-3">
                  {isAuction ? (
                    <button
                      onClick={() => setIsBidModalOpen(true)}
                      disabled={isBidDisabled}
                      className={`inline-flex cursor-pointer items-center justify-center rounded-lg ${statusBgColor} text-white px-7 py-3 text-[15px] shadow hover:shadow-md transition-all font-semibold 
                        ${
                          isBidDisabled
                            ? "opacity-50 cursor-not-allowed bg-gray-400"
                            : "hover:opacity-90"
                        }`}
                    >
                      {isBidDisabled ? (
                        <div>{statusText}</div>
                      ) : (
                        <div>입찰하기</div>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={handlePurchase}
                      className="cursor-pointer inline-flex items-center  justify-center rounded-lg bg-rebay-blue text-white px-7 py-3 text-[15px] shadow hover:shadow-md transition-all font-semibold hover:opacity-90"
                    >
                      구매하기
                    </button>
                  )}

                  {/* 채팅하기 버튼 */}
                  <button
                    onClick={handleStartChat}
                    className="cursor-pointer inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 px-7 py-3 text-[15px] font-semibold hover:bg-gray-50 transition"
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

        {/* 하단 영역 */}
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
                  <div className="w-14 h-14 rounded-full ">
                    <Avatar user={post?.seller} size="small" />
                  </div>
                  <div className="leading-tight">
                    <div className="font-medium">
                      {post?.seller?.username || "판매자"}
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
                <ReviewList user={post?.seller} variant="compact" />
              </div>
            </div>
          </div>
        </section>

        {shouldShowTradeChart && tradeHistoryList.length !== 0 && (
          <section className="my-6 p-2 font-presentation w-full h-auto border border-rebay-gray-400 rounded-2xl">
            <TradeChart tradeHistoryList={tradeHistoryList} />
          </section>
        )}

        <BidModal />
      </div>
      <Footer />
    </MainLayout>
  );
}
