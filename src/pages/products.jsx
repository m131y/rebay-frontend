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
