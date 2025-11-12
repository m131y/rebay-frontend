import { useEffect, useMemo, useState } from "react";
import Footer from "../components/layout/Footer";
import Header from "../components/layout/Header";
import MainLayout from "../components/layout/MainLayout";
import Product from "../components/products/product";
import postService from "../services/post";

const CATEGORY_OPTIONS = [
  { value: "ALL", label: "전체" },
  { value: "DIGITAL_DEVICES", label: "가전/디지털" },
  { value: "HOME_APPLIANCES", label: "생활가전" },
  { value: "FURNITURE", label: "가구" },
  { value: "HOME_KITCHEN", label: "주방/생활" },
  { value: "BOOKS", label: "도서" },
  { value: "PLANTS", label: "식물" },
  { value: "CLOTHES", label: "의류" },
  { value: "OTHER_USED_ITEMS", label: "기타 중고물품" },
];

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

  const [category, setCategory] = useState("ALL");
  const [sort, setSort] = useState(SORTS.LATEST);
  const [page, setPage] = useState(1);

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
  }, [category, sort]);

  const processed = useMemo(() => {
    let rows = allPosts;

    if (category !== "ALL") {
      rows = rows.filter((r) => r?.category === category);
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
  }, [allPosts, category, sort]);

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
      <main className="mt-[70px]">
        <section className="mx-auto w-full max-w-[1080px] px-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-presentation text-[22px] font-bold">
              상품보기
            </h2>
            <div className="flex items-center gap-2">
              {/* 카테고리 */}
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="border rounded-lg px-3 py-1.5"
                aria-label="카테고리 선택"
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>

              {/* 정렬 */}
              <button
                onClick={() => setSort(SORTS.LATEST)}
                className={`px-3 py-1.5 rounded-lg border ${
                  sort === SORTS.LATEST ? "bg-blue-600 text-white" : ""
                }`}
              >
                최신
              </button>
              <button
                onClick={() => setSort(SORTS.PRICE_ASC)}
                className={`px-3 py-1.5 rounded-lg border ${
                  sort === SORTS.PRICE_ASC ? "bg-blue-600 text-white" : ""
                }`}
              >
                가격 오름차순
              </button>
              <button
                onClick={() => setSort(SORTS.PRICE_DESC)}
                className={`px-3 py-1.5 rounded-lg border ${
                  sort === SORTS.PRICE_DESC ? "bg-blue-600 text-white" : ""
                }`}
              >
                가격 내림차순
              </button>
              <button
                onClick={() => setSort(SORTS.TITLE_ASC)}
                className={`px-3 py-1.5 rounded-lg border ${
                  sort === SORTS.TITLE_ASC ? "bg-blue-600 text-white" : ""
                }`}
              >
                이름순
              </button>
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
                className="px-3 py-1.5 rounded-lg border disabled:opacity-40"
              >
                이전
              </button>

              {Array.from({ length: totalPages }).map((_, i) => {
                const n = i + 1;
                return (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`px-3 py-1.5 rounded-lg border ${
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
                className="px-3 py-1.5 rounded-lg border disabled:opacity-40"
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
