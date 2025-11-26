// src/pages/products.jsx
import { useEffect, useMemo, useState } from "react";
import Footer from "../components/layout/Footer";
import Header from "../components/layout/Header";
import MainLayout from "../components/layout/MainLayout";
import Product from "../components/products/product";
import postService from "../services/post"; // 가정: postService가 쿼리 매개변수를 받는 getAllProducts를 제공한다고 가정
import { useParams } from "react-router-dom";

const DEFAULT_LARGE_CODE = null;

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

const SORTS = {
  LATEST: "LATEST",
  PRICE_ASC: "PRICE_ASC",
  PRICE_DESC: "PRICE_DESC",
  TITLE_ASC: "TITLE_ASC",
};

const PRODUCT_TYPES = {
  ALL: "ALL",
  NORMAL: "POST",
  AUCTION: "AUCTION",
};

const PAGE_SIZE = 10;

const findCategoryCodes = (targetCode, hierarchy) => {
  if (!targetCode) return { lg: null, md: "", sm: "" };

  const targetCodeStr = String(targetCode);

  // 3자리, 2자리, 1자리 코드를 순회하며 찾습니다.
  for (const lgCode in hierarchy) {
    if (targetCodeStr === lgCode) {
      // 대분류 (예: 200, 300)
      return { lg: lgCode, md: "", sm: "" };
    }

    const lg = hierarchy[lgCode];
    for (const mdCode in lg.children) {
      if (targetCodeStr === mdCode) {
        // 중분류 (예: 260)
        return { lg: lgCode, md: mdCode, sm: "" };
      }

      const md = lg.children[mdCode];
      for (const smCode in md.children) {
        if (targetCodeStr === smCode) {
          // 소분류 (예: 261)
          return { lg: lgCode, md: mdCode, sm: smCode };
        }
      }
    }
  }

  // 일치하는 코드를 찾지 못했을 경우
  return { lg: null, md: "", sm: "" };
};

const Products = () => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const initialCategory = urlParams.get("category");

  const {
    lg: initialLgCode,
    md: initialMdCode,
    sm: initialSmCode,
  } = useMemo(() => {
    return findCategoryCodes(initialCategory, CATEGORY_HIERARCHY);
  }, [initialCategory]);

  const [posts, setPosts] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedType, setSelectedType] = useState(PRODUCT_TYPES.ALL);
  const [selectedLgCode, setSelectedLgCode] = useState(initialLgCode);
  const [selectedMdCode, setSelectedMdCode] = useState(initialMdCode);
  const [selectedSmCode, setSelectedSmCode] = useState(initialSmCode);
  const [sort, setSort] = useState(SORTS.LATEST);
  const [page, setPage] = useState(1);
  const [excludeSold, setExcludeSold] = useState(true);

  const [lastFilterState, setLastFilterState] = useState({
    finalCode: initialCategory ? initialCategory : DEFAULT_LARGE_CODE,
    sort: SORTS.LATEST,
    excludeSold: true,
    selectedType: PRODUCT_TYPES.ALL,
  });
  const finalCode = useMemo(
    () => selectedSmCode || selectedMdCode || selectedLgCode,
    [selectedSmCode, selectedMdCode, selectedLgCode]
  );

  // 현재 선택된 대분류에 따른 중분류 옵션 계산
  const mdOptions = useMemo(() => {
    const lg = CATEGORY_HIERARCHY[selectedLgCode];
    return lg?.children || {};
  }, [selectedLgCode]);

  // 현재 선택된 중분류에 따른 소분류 옵션 계산
  const smOptions = useMemo(() => {
    const md = mdOptions[selectedMdCode];
    return md?.children || {};
  }, [selectedMdCode, mdOptions]);

  // 대분류 변경 핸들러
  const handleLgChange = (e) => {
    const newLgCode =
      e.target.value === "null" ? DEFAULT_LARGE_CODE : e.target.value;
    setSelectedLgCode(newLgCode);
    setSelectedMdCode("");
    setSelectedSmCode("");
  };
  // 중분류 변경 핸들러
  const handleMdChange = (e) => {
    const newMdCode = e.target.value;
    setSelectedMdCode(newMdCode);
    setSelectedSmCode("");
  };

  // 소분류 변경 핸들러
  const handleSmChange = (e) => {
    const newSmCode = e.target.value;
    setSelectedSmCode(newSmCode);
  };

  useEffect(() => {
    // 현재 필터 상태
    const currentFilterState = { finalCode, sort, excludeSold, selectedType };

    // 필터 상태가 변경되었는지 확인
    const filterChanged =
      currentFilterState.finalCode !== lastFilterState.finalCode ||
      currentFilterState.sort !== lastFilterState.sort ||
      currentFilterState.excludeSold !== lastFilterState.excludeSold ||
      currentFilterState.selectedType !== lastFilterState.selectedType;

    let targetPage = page;

    if (filterChanged) {
      setPage(1);
      targetPage = 1;
      setLastFilterState(currentFilterState);
    }

    const fetchIntegratedProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = {
          page: targetPage - 1,
          size: PAGE_SIZE,
          sort: sort,
          categoryCode:
            finalCode !== DEFAULT_LARGE_CODE ? finalCode : undefined,
          excludeSold: excludeSold,
          productType:
            selectedType === PRODUCT_TYPES.ALL ? undefined : selectedType,
        };

        const response = await postService.getAllProducts(params);

        const mappedProducts = response.content.map((item) => ({
          id: item.productId,
          title: item.title,
          content: item.content,
          categoryCode: item.categoryCode,
          price: item.price,
          imageUrl: item.thumbnailImageUrl,
          status: item.status,
          type: item.productType,
          createdAt: item.createdAt,
          ...item,
        }));

        if (response && response.content) {
          setPosts(mappedProducts);
          setTotalPages(response.totalPages || 1);
          setTotalElements(response.totalElements || 0);
        } else {
          setPosts([]);
          setTotalPages(1);
          setTotalElements(0);
        }
      } catch (e) {
        console.error("Failed to fetch integrated products:", e);
        setError(
          "상품 목록을 불러오는 데 실패했습니다. 잠시 후 다시 시도해 주세요."
        );
        setPosts([]);
        setTotalPages(1);
        setTotalElements(0);
      } finally {
        setLoading(false);
      }
    };

    fetchIntegratedProducts();
  }, [page, finalCode, sort, excludeSold, selectedType]);
  // 페이지 이동 함수
  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages, p + 1));

  return (
    <MainLayout>
      <Header />
      <main className="my-[70px] font-presentation flex-grow">
        <section className="mx-auto w-full max-w-[1080px] px-4 sm:px-3">
          <div className="flex flex-col md:flex-row items-start justify-between mb-8 w-full">
            <div className="flex flex-col gap-1 w-full md:w-auto">
              <h2 className="py-4 text-3xl font-bold text-gray-800">
                상품 둘러보기
              </h2>

              <div className="flex flex-wrap gap-2 mb-4">
                {/* 전체 버튼 */}
                <button
                  onClick={() => setSelectedType(PRODUCT_TYPES.ALL)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors shadow-sm ${
                    selectedType === PRODUCT_TYPES.ALL
                      ? "bg-rebay-blue text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  전체
                </button>
                {/* 일반 상품 버튼 */}
                <button
                  onClick={() => setSelectedType(PRODUCT_TYPES.NORMAL)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors shadow-sm ${
                    selectedType === PRODUCT_TYPES.NORMAL
                      ? "bg-rebay-blue text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  일반 상품
                </button>
                {/* 경매 상품 버튼 */}
                <button
                  onClick={() => setSelectedType(PRODUCT_TYPES.AUCTION)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors shadow-sm ${
                    selectedType === PRODUCT_TYPES.AUCTION
                      ? "bg-red-700 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  경매 상품
                </button>
              </div>

              {/* 판매 완료 상품 포함/제외 체크박스 */}
              <label className="flex items-center gap-2 text-sm text-gray-600 ml-1">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  checked={!excludeSold}
                  onChange={(e) => setExcludeSold(!e.target.checked)}
                />
                <span>판매 완료 상품 포함</span>
              </label>
            </div>
            {/* 카테고리 */}
            <div className="flex flex-col gap-3 w-full md:w-auto mt-4 md:mt-0">
              <div className="flex flex-wrap gap-3 items-center justify-start md:justify-end">
                {/* 대분류 */}
                <div className="relative flex-1 min-w-[120px]">
                  <select
                    name="largeCategory"
                    value={selectedLgCode === null ? "null" : selectedLgCode}
                    onChange={handleLgChange}
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 appearance-none py-2 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                  >
                    <option value={"null"}>전체 카테고리</option>
                    {Object.entries(CATEGORY_HIERARCHY).map(([code, data]) => (
                      <option key={code} value={code}>
                        {data.name}
                      </option>
                    ))}
                  </select>
                  <svg
                    className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>

                {/* 중분류 */}
                <div className="relative flex-1 min-w-[120px]">
                  <select
                    name="mediumCategory"
                    value={selectedMdCode}
                    onChange={handleMdChange}
                    disabled={
                      Object.keys(mdOptions).length === 0 ||
                      selectedLgCode === DEFAULT_LARGE_CODE
                    }
                    className={`w-full rounded-lg border px-4 appearance-none py-2 text-base transition ${
                      Object.keys(mdOptions).length === 0 ||
                      selectedLgCode === DEFAULT_LARGE_CODE
                        ? "border-gray-200 text-gray-400 cursor-not-allowed"
                        : "border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    }`}
                  >
                    <option value="">
                      {selectedLgCode === DEFAULT_LARGE_CODE
                        ? "대분류를 먼저 선택"
                        : Object.keys(mdOptions).length === 0
                        ? "하위 카테고리 없음"
                        : "중분류 선택"}
                    </option>
                    {Object.entries(mdOptions).map(([code, data]) => (
                      <option key={code} value={code}>
                        {data.name}
                      </option>
                    ))}
                  </select>
                  <svg
                    className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>

                {/* 소분류 */}
                <div className="relative flex-1 min-w-[120px]">
                  <select
                    name="smallCategory"
                    value={selectedSmCode}
                    onChange={handleSmChange}
                    disabled={
                      Object.keys(smOptions).length === 0 ||
                      selectedMdCode === "" ||
                      selectedLgCode === DEFAULT_LARGE_CODE
                    }
                    className={`w-full rounded-lg border px-4 appearance-none py-2 text-base transition ${
                      Object.keys(smOptions).length === 0 ||
                      selectedMdCode === "" ||
                      selectedLgCode === DEFAULT_LARGE_CODE
                        ? "border-gray-200 text-gray-400 cursor-not-allowed"
                        : "border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    }`}
                  >
                    <option value="">
                      {selectedMdCode === "" ||
                      selectedLgCode === DEFAULT_LARGE_CODE
                        ? "중분류를 먼저 선택"
                        : Object.keys(smOptions).length === 0
                        ? "하위 카테고리 없음"
                        : "소분류 선택"}
                    </option>
                    {Object.entries(smOptions).map(([code, data]) => (
                      <option key={code} value={code}>
                        {data.name}
                      </option>
                    ))}
                  </select>
                  <svg
                    className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>

              {/* 정렬 버튼 */}
              <div className="w-full flex justify-start md:justify-end flex-wrap gap-2 text-sm">
                <span className="font-medium text-gray-700 hidden md:inline-block py-1.5">
                  정렬:
                </span>

                <button
                  onClick={() => setSort(SORTS.LATEST)}
                  className={`px-3 py-1.5 rounded-lg border transition-colors ${
                    sort === SORTS.LATEST
                      ? "bg-rebay-blue text-white border-blue-600"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  최신순
                </button>
                <button
                  onClick={() => setSort(SORTS.PRICE_DESC)}
                  className={`px-3 py-1.5 rounded-lg border transition-colors ${
                    sort === SORTS.PRICE_DESC
                      ? "bg-rebay-blue text-white border-blue-600"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  높은 가격순
                </button>
                <button
                  onClick={() => setSort(SORTS.PRICE_ASC)}
                  className={`px-3 py-1.5 rounded-lg border transition-colors ${
                    sort === SORTS.PRICE_ASC
                      ? "bg-rebay-blue text-white border-blue-600"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  낮은 가격순
                </button>
              </div>
            </div>
          </div>

          <div className="text-gray-500 mb-4 text-sm font-medium">
            총 {totalElements}개의 상품 중 {posts.length}개 표시 중 (페이지:{" "}
            {page} / {totalPages})
          </div>

          {loading && (
            <div className="text-gray-500 py-10 flex justify-center items-center">
              <svg
                className="animate-spin h-5 w-5 text-blue-500 mr-3"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              데이터를 불러오는 중입니다...
            </div>
          )}

          {error && (
            <div className="text-red-600 p-4 bg-red-50 border border-red-300 rounded-lg mb-4">
              {error}
            </div>
          )}

          {!loading && posts.length === 0 && !error ? (
            <div className="text-gray-500 py-20 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
              <p className="text-xl font-semibold">
                선택하신 조건에 맞는 상품이 없어요.
              </p>
              <p className="mt-2 text-sm">필터링 조건을 변경해 보세요!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {/* 서버에서 받은 posts를 바로 사용 */}
              {posts.map((post, index) => (
                <Product
                  key={index}
                  id={post.id}
                  post={post}
                  type={post.type}
                />
              ))}
            </div>
          )}

          {/* 페이지네이션 UI */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={goPrev}
                disabled={page <= 1}
                className="px-4 py-2 rounded-xl bg-gray-100 border border-gray-300 font-medium text-gray-700 disabled:opacity-40 hover:bg-gray-200 transition duration-150 shadow-sm"
              >
                &lt; 이전
              </button>

              {/* 페이지 번호 버튼 */}
              {Array.from({ length: totalPages }).map((_, i) => {
                const n = i + 1;
                // 현재 페이지 주변 5개만 표시 (n-2 ~ n+2)
                if (n >= page - 2 && n <= page + 2 && n <= totalPages) {
                  return (
                    <button
                      key={n}
                      onClick={() => setPage(n)}
                      className={`w-10 h-10 rounded-full font-bold transition duration-150 ${
                        n === page
                          ? "bg-rebay-blue text-white shadow-lg shadow-blue-300/50"
                          : "text-gray-700 hover:bg-blue-100"
                      }`}
                    >
                      {n}
                    </button>
                  );
                }
                return null;
              })}

              <button
                onClick={goNext}
                disabled={page >= totalPages}
                className="px-4 py-2 rounded-xl bg-gray-100 border border-gray-300 font-medium text-gray-700 disabled:opacity-40 hover:bg-gray-200 transition duration-150 shadow-sm"
              >
                다음 &gt;
              </button>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </MainLayout>
  );
};

export default Products;
