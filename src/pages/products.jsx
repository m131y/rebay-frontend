import { useEffect, useMemo, useState } from "react";
import Footer from "../components/layout/Footer";
import Header from "../components/layout/Header";
import MainLayout from "../components/layout/MainLayout";
import Product from "../components/products/product";
import postService from "../services/post";

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

const DEFAULT_LARGE_CODE = Object.keys(CATEGORY_HIERARCHY)[0] || "";

const SORTS = {
  LATEST: "LATEST",
  PRICE_ASC: "PRICE_ASC",
  PRICE_DESC: "PRICE_DESC",
  TITLE_ASC: "TITLE_ASC",
};

const PAGE_SIZE = 10;

const Products = () => {
  const [allPosts, setAllPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedLgCode, setSelectedLgCode] = useState(DEFAULT_LARGE_CODE);
  const [selectedMdCode, setSelectedMdCode] = useState("");
  const [selectedSmCode, setSelectedSmCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [sort, setSort] = useState(SORTS.LATEST);
  const [page, setPage] = useState(1);

  const [finalCode, setFinalCode] = useState("ALL");

  const mdOptions = useMemo(() => {
    const lg = CATEGORY_HIERARCHY[selectedLgCode];
    return lg?.children || {};
  }, [selectedLgCode]);

  const smOptions = useMemo(() => {
    const md = mdOptions[selectedMdCode];
    return md?.children || {};
  }, [selectedMdCode, mdOptions]);

  const handleLgChange = (e) => {
    const newLgCode = e.target.value;
    setSelectedLgCode(newLgCode);
    setSelectedMdCode(""); // 중분류 초기화
    setSelectedSmCode(""); // 소분류 초기화
    setError(null);
    setFinalCode(newLgCode);
  };

  const handleMdChange = (e) => {
    const newMdCode = e.target.value;
    setSelectedMdCode(newMdCode);
    setSelectedSmCode(""); // 소분류 초기화
    setError(null);
    setFinalCode(newMdCode || selectedLgCode);
  };

  const handleSmChange = (e) => {
    const newSmCode = e.target.value;
    setSelectedSmCode(newSmCode);
    setError(null);
    setFinalCode(newSmCode || selectedMdCode || selectedLgCode);
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const merged = [];
        let p = 0;

        while (true) {
          const content = await postService.getAllPosts(p, PAGE_SIZE);
          if (!content || content.length === 0) break;
          merged.push(...content);
          p += 1;
        }

        setAllPosts(merged);
      } catch (e) {
        setError(e?.response?.data?.message || e.message || "불러오기 실패");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [finalCode, sort]);

  const processed = useMemo(() => {
    let rows = allPosts;

    if (finalCode && finalCode !== "ALL") {
      rows = rows.filter((r) => {
        const postCategoryCode = r?.categoryCode?.toString();

        if (!postCategoryCode) return false;

        return postCategoryCode.startsWith(finalCode);
      });
    }

    const safeNum = (v) => (v == null ? Number.NEGATIVE_INFINITY : Number(v));
    const safeStr = (s) => (s || "").toString();

    switch (sort) {
      case SORTS.PRICE_ASC:
        rows = [...rows].sort((a, b) => safeNum(a?.price) - safeNum(b?.price));
        break;
      case SORTS.PRICE_DESC:
        rows = [...rows].sort((a, b) => safeNum(b?.price) - safeNum(a?.price));
        break;
      case SORTS.TITLE_ASC:
        rows = [...rows].sort((a, b) =>
          safeStr(a?.title).localeCompare(safeStr(b?.title))
        );
        break;
      case SORTS.LATEST:
      default:
        rows = [...rows].sort(
          (a, b) =>
            new Date(b?.createdAt || 0).getTime() -
            new Date(a?.createdAt || 0).getTime()
        );
        break;
    }

    return rows;
  }, [allPosts, finalCode, sort]);

  const totalPages = Math.max(1, Math.ceil(processed.length / PAGE_SIZE));
  const paged = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return processed.slice(start, start + PAGE_SIZE);
  }, [processed, page]);

  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages, p + 1));

  return (
    <MainLayout>
      <Header />
      <main className="my-[70px] font-presentation">
        <section className="mx-auto w-full max-w-[1080px] px-3">
          <div
            className="flex items-start
           justify-between mb-4"
          >
            <h2 className="font-presentation py-6 text-[22px] font-bold">
              상품보기
            </h2>
            <div className="flex flex-col justify-end items-center gap-2">
              <div className="flex items-center justify-end w-[960px] mx-auto p-3 font-presentation">
                <section className="flex items-center justify-center">
                  <div className="flex flex-row items-center justify-center gap-3">
                    <div className="relative flex-1">
                      <select
                        name="largeCategory"
                        value={selectedLgCode}
                        onChange={handleLgChange}
                        required
                        className="w-full rounded-xl border border-gray-300 px-4 appearance-none py-2.5 pr-10 bg-white text-base focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition"
                      >
                        {Object.entries(CATEGORY_HIERARCHY).map(
                          ([code, data]) => (
                            <option key={code} value={code}>
                              {data.name}
                            </option>
                          )
                        )}
                      </select>
                      <svg
                        className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
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
                    <div className="relative flex-1">
                      <select
                        name="mediumCategory"
                        value={selectedMdCode}
                        onChange={handleMdChange}
                        disabled={Object.keys(mdOptions).length === 0}
                        className={`w-full rounded-xl border px-4 appearance-none py-2.5 pr-10 bg-white text-base transition ${
                          Object.keys(mdOptions).length === 0
                            ? "border-gray-200 text-gray-400"
                            : "border-gray-300 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                        }`}
                      >
                        <option value="">
                          {Object.keys(mdOptions).length === 0
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
                        className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
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
                    <div className="relative flex-1">
                      <select
                        name="smallCategory"
                        value={selectedSmCode}
                        onChange={handleSmChange}
                        disabled={Object.keys(smOptions).length === 0}
                        className={`w-full rounded-xl border px-4 appearance-none py-2.5 pr-10 bg-white text-base transition ${
                          Object.keys(smOptions).length === 0
                            ? "border-gray-200 text-gray-400"
                            : "border-gray-300 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                        }`}
                      >
                        <option value="">
                          {Object.keys(smOptions).length === 0
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
                        className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
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
                </section>
                {error && <p className="text-sm text-red-600">{error}</p>}
              </div>
              <div className="w-full flex justify-end px-3">
                <div>
                  <button
                    onClick={() => setSort(SORTS.LATEST)}
                    className={`px-3 py-1.5 rounded-lg border border-rebay-gray-400 ${
                      sort === SORTS.LATEST ? "bg-rebay-blue text-white" : ""
                    }`}
                  >
                    최신
                  </button>
                  <button
                    onClick={() => setSort(SORTS.PRICE_ASC)}
                    className={`px-3 py-1.5 rounded-lg border border-rebay-gray-400 ${
                      sort === SORTS.PRICE_ASC ? "bg-rebay-blue text-white" : ""
                    }`}
                  >
                    가격 오름차순
                  </button>
                  <button
                    onClick={() => setSort(SORTS.PRICE_DESC)}
                    className={`px-3 py-1.5 rounded-lg border border-rebay-gray-400 ${
                      sort === SORTS.PRICE_DESC
                        ? "bg-rebay-blue text-white"
                        : ""
                    }`}
                  >
                    가격 내림차순
                  </button>
                  <button
                    onClick={() => setSort(SORTS.TITLE_ASC)}
                    className={`px-3 py-1.5 rounded-lg border border-rebay-gray-400 ${
                      sort === SORTS.TITLE_ASC ? "bg-rebay-blue text-white" : ""
                    }`}
                  >
                    이름순
                  </button>
                </div>
              </div>
            </div>
          </div>

          {loading && <div className="text-gray-500 mb-3">불러오는 중…</div>}
          {error && <div className="text-red-600 mb-3">{error}</div>}

          {!loading && processed.length === 0 ? (
            <div className="text-gray-500 py-10">표시할 상품이 없어요.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {paged.map((post) => (
                <Product key={post.id} post={post} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={goPrev}
                disabled={page <= 1}
                className="px-3 py-1.5 rounded-lg border border-rebay-gray-400 disabled:opacity-40"
              >
                이전
              </button>

              {Array.from({ length: totalPages }).map((_, i) => {
                const n = i + 1;
                return (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`px-3 py-1.5 rounded-lg border border-rebay-gray-400 ${
                      n === page ? "bg-blue-600 text-white" : ""
                    }`}
                  >
                    {n}
                  </button>
                );
              })}

              <button
                onClick={goNext}
                disabled={page >= totalPages}
                className="px-3 py-1.5 rounded-lg border border-rebay-gray-400 disabled:opacity-40"
              >
                다음
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
