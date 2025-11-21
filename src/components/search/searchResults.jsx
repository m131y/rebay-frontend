import useSearchStore from "../../store/searchStore";
import Product from "../products/product";

export default function SearchResults({ loading }) {
  const { results, error } = useSearchStore();

  if (loading)
    return <div className="text-center py-6 text-gray-600">검색 중...</div>;

  if (error)
    return <div className="text-center text-red-500 py-4">{error}</div>;

  if (!results.length)
    return (
      <div className="text-center text-gray-400 py-6">
        검색 결과가 없습니다.
      </div>
    );

  return (
    <main className="mt-[70px]">
      <section className="mx-auto w-full max-w-[1080px] px-3">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-presentation text-[22px] font-bold">상품보기</h2>
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
            {results.map((post) => (
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
  );
}
