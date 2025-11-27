import React, { useEffect, useMemo, useRef, useState } from "react";
import MainLayout from "../components/layout/MainLayout";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

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

const SamplePage = () => {
  const [selectedLgCode, setSelectedLgCode] = useState(DEFAULT_LARGE_CODE);
  const [selectedMdCode, setSelectedMdCode] = useState("");
  const [selectedSmCode, setSelectedSmCode] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const finalCode = selectedSmCode || selectedMdCode || selectedLgCode;
  }, [selectedLgCode, selectedMdCode, selectedSmCode]);

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
  };

  const handleMdChange = (e) => {
    const newMdCode = e.target.value;
    setSelectedMdCode(newMdCode);
    setSelectedSmCode(""); // 소분류 초기화
    setError(null);
  };

  const handleSmChange = (e) => {
    const newSmCode = e.target.value;
    setSelectedSmCode(newSmCode);
    setError(null);
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!finalCategoryCode) {
      setError("카테고리를 선택해주세요.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
    } catch (err) {
    } finally {
    }
  };

  return (
    <MainLayout>
      <Header />
      <div className="flex items-center justify-center w-[960px] mx-auto p-6 font-presentation">
        <form
          onSubmit={onSubmit}
          className="space-x-4 flex justify-center items-center"
        >
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
                  {Object.entries(CATEGORY_HIERARCHY).map(([code, data]) => (
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

          <section className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="cursor-pointer px-5 py-2 rounded-lg bg-rebay-blue hover:opacity-90 text-white disabled:opacity-50"
            >
              {submitting ? "검색 중 .." : "검색"}
            </button>
          </section>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>
      </div>
      <Footer />
    </MainLayout>
  );
};

export default SamplePage;
