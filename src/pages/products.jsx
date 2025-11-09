// src/pages/products.jsx
import { useEffect, useMemo, useState } from "react";
import Footer from "../components/layout/Footer";
import Header from "../components/layout/Header";
import MainLayout from "../components/layout/MainLayout";
import Product from "../components/products/product";
import postService from "../services/post";

/** 백엔드 enum과 매칭 */
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

const PAGE_SIZE = 10; // 백엔드 기본 size와 동일하게 사용 (컨트롤러 기본값 10)

const Products = () => {
  /** 원본 전체목록(모든 페이지) */
  const [allPosts, setAllPosts] = useState([]);
  /** UI 상태 */
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /** 필터/정렬/페이지 */
  const [category, setCategory] = useState("ALL");
  const [sort, setSort] = useState(SORTS.LATEST);
  const [page, setPage] = useState(1);

  /** 최초에 전체 페이지를 다 불러오기 (백엔드 페이지 수 모름 → 빈 배열 반환 시 종료) */
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const merged = [];
        let p = 0;

        // postService는 content만 반환하므로, 콘텐츠가 0이 될 때까지 순회
        // (백엔드 PageRequest 넘어선 페이지는 빈 content를 반환)
        // size는 백엔드 기본(10)을 쓰려면 undefined로 넘겨도 됨. 명시하려면 10 전달.
        // 여기선 명시적인 가독성을 위해 10 사용.
        // eslint-disable-next-line no-constant-condition
        while (true) {
          // NOTE: service 시그니처를 유지하기 위해 size도 같이 보냄
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

  /** 정렬/필터가 바뀌면 첫 페이지로 */
  useEffect(() => {
    setPage(1);
  }, [category, sort]);

  /** 필터+정렬 적용된 결과 (모든 페이지 대상) */
  const processed = useMemo(() => {
    let rows = allPosts;

    // 1) 카테고리
    if (category !== "ALL") {
      rows = rows.filter((r) => r?.category === category);
    }

    // 2) 정렬
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
        // createdAt이 있다면 최신순(내림차순)
        rows = [...rows].sort(
          (a, b) =>
            new Date(b?.createdAt || 0).getTime() -
            new Date(a?.createdAt || 0).getTime()
        );
        break;
    }

    return rows;
  }, [allPosts, category, sort]);

  /** 페이지네이션 (클라이언트 측) */
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
          {/* 타이틀 + 컨트롤 */}
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

          {/* 상태 */}
          {loading && <div className="text-gray-500 mb-3">불러오는 중…</div>}
          {error && <div className="text-red-600 mb-3">{error}</div>}

          {/* 목록 */}
          {!loading && processed.length === 0 ? (
            <div className="text-gray-500 py-10">표시할 상품이 없어요.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {paged.map((post) => (
                <Product key={post.id} post={post} />
              ))}
            </div>
          )}

          {/* 페이지네이션 (총 페이지가 1보다 클 때만 표시) */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={goPrev}
                disabled={page <= 1}
                className="px-3 py-1.5 rounded-lg border disabled:opacity-40"
              >
                이전
              </button>

              {/* 단순 1..N 페이지 버튼 */}
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
