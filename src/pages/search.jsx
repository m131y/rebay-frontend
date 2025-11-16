import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import MainLayout from "../components/layout/MainLayout";
import Product from "../components/products/product";

import useSearchStore from "../store/searchStore";

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

export default function Search() {
  const { searchPosts, results, loading } = useSearchStore();

  const [params] = useSearchParams();
  const initialKeyword = params.get("keyword") || "";
  const initialTarget = params.get("target") || "TITLE";

  const [category, setCategory] = useState("ALL");
  const [sort, setSort] = useState(SORTS.LATEST);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (initialKeyword.trim()) {
      searchPosts({
        keyword: initialKeyword,
        target: initialTarget,
        page: 0,
      });
    }
  }, [initialKeyword, initialTarget]);

  useEffect(() => {
    setPage(1);
  }, [category, sort]);

  const processed = useMemo(() => {
    let filtered = [...results];

    if (category !== "ALL") {
      filtered = filtered.filter((p) => p.category === category);
    }

    const byNum = (v) => (v == null ? 0 : Number(v));
    const byStr = (v) => (v || "").toString();

    switch (sort) {
      case SORTS.PRICE_ASC:
        filtered.sort((a, b) => byNum(a.price) - byNum(b.price));
        break;

      case SORTS.PRICE_DESC:
        filtered.sort((a, b) => byNum(b.price) - byNum(a.price));
        break;

      case SORTS.TITLE_ASC:
        filtered.sort((a, b) => byStr(a.title).localeCompare(byStr(b.title)));
        break;

      case SORTS.LATEST:
      default:
        filtered.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
    }

    return filtered;
  }, [results, category, sort]);

  const totalPages = Math.max(1, Math.ceil(processed.length / PAGE_SIZE));

  const paged = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return processed.slice(start, start + PAGE_SIZE);
  }, [processed, page]);

  return (
    <MainLayout>
      <Header />

      <main className="mt-[70px]">
        <section className="mx-auto w-full max-w-[1080px] px-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-presentation text-[22px] font-bold">
              "{initialKeyword}" 의 검색결과
            </h2>

            <div className="flex items-center gap-2">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="border rounded-lg px-3 py-1.5"
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>

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

          {loading && <div className="text-gray-500 mb-3">검색 중…</div>}

          {!loading && processed.length === 0 && (
            <div className="text-gray-500 py-10">검색 결과가 없습니다.</div>
          )}

          {!loading && processed.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {paged.map((post) => (
                <Product key={post.id} post={post} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
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
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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
}
