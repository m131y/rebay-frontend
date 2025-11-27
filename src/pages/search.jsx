import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import MainLayout from "../components/layout/MainLayout";
import Product from "../components/products/product";

import useSearchStore from "../store/searchStore";

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

const DEFAULT_LARGE_CODE = Object.keys(CATEGORY_HIERARCHY)[0] || "";

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

  const [error, setError] = useState(null);
  const [selectedLgCode, setSelectedLgCode] = useState(DEFAULT_LARGE_CODE);
  const [selectedMdCode, setSelectedMdCode] = useState("");
  const [selectedSmCode, setSelectedSmCode] = useState("");

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

  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages, p + 1));

  const paged = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return processed.slice(start, start + PAGE_SIZE);
  }, [processed, page]);

  return (
    <MainLayout>
      <Header />

      <main className="mt-[70px] font-presentation">
        <section className="mx-auto w-full max-w-[1080px] px-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-presentation w-full text-[22px] font-bold">
              "{initialKeyword}" 의 검색결과
            </h2>

            <div className="flex flex-col justify-end items-center gap-2">
              <div className="flex items-center justify-end w-[600px] mx-auto p-3 font-presentation">
                {error && <p className="text-sm text-red-600">{error}</p>}
              </div>
              <div className="w-full flex justify-end px-3">
                <div>
                  <button
                    onClick={() => setSort(SORTS.LATEST)}
                    className={`px-3 py-1.5 rounded-lg font-presentation border border-rebay-gray-400 ${
                      sort === SORTS.LATEST ? "bg-rebay-blue text-white" : ""
                    }`}
                  >
                    최신순
                  </button>
                  <button
                    onClick={() => setSort(SORTS.PRICE_ASC)}
                    className={`px-3 py-1.5 rounded-lg font-presentation border border-rebay-gray-400 ${
                      sort === SORTS.PRICE_ASC ? "bg-rebay-blue text-white" : ""
                    }`}
                  >
                    높은 가격순
                  </button>
                  <button
                    onClick={() => setSort(SORTS.PRICE_DESC)}
                    className={`px-3 py-1.5 rounded-lg font-presentation border border-rebay-gray-400 ${
                      sort === SORTS.PRICE_DESC
                        ? "bg-rebay-blue text-white"
                        : ""
                    }`}
                  >
                    낮은 가격순
                  </button>
                  <button
                    onClick={() => setSort(SORTS.TITLE_ASC)}
                    className={`px-3 py-1.5 rounded-lg font-presentation border border-rebay-gray-400 ${
                      sort === SORTS.TITLE_ASC ? "bg-rebay-blue text-white" : ""
                    }`}
                  >
                    이름순
                  </button>
                </div>
              </div>
            </div>
          </div>

          {loading && <div className="text-gray-500 mb-3">검색 중…</div>}

          {!loading && processed.length === 0 && (
            <div className="text-gray-500 py-10">검색 결과가 없습니다.</div>
          )}

          {!loading && processed.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {paged.map((post, index) => (
                <Product key={index} post={post} type={post.productType} />
              ))}
            </div>
          )}

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
}
