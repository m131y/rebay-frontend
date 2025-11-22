// src/components/products/ProductCreate.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import postService from "../../services/post";
import s3Service from "../../services/s3";
import { FiImage, FiX } from "react-icons/fi";
import MainLayout from "../layout/MainLayout";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import api from "../../services/api";
import useStatisticsStore from "../../store/statisticsStore";
import Trade from "./Trade";
import aiService from "../../services/ai";
import { FiCpu } from "react-icons/fi";

/** ========== 카테고리 계층 ========== */
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

  300: { name: "생활가전", children: {} },
  400: { name: "가구/인테리어", children: {} },
  500: { name: "생활/주방", children: {} },
  600: { name: "도서", children: {} },
  700: { name: "식물/반려동물", children: {} },
  800: { name: "의류/잡화", children: {} },
  900: { name: "기타 중고 물품", children: {} },
};

const DEFAULT_LARGE_CODE = Object.keys(CATEGORY_HIERARCHY)[0] || "";

/** 해시태그 유틸 */
const parseHashtags = (input) =>
  (input || "")
    .replaceAll(",", " ")
    .split(" ")
    .map((s) => s.replace(/^#/, "").trim())
    .filter(Boolean);

const ProductCreate = ({ onCreated, goBack }) => {
  const navigate = useNavigate();
  const { postId } = useParams();
  const isEdit = Boolean(postId);
  const { getTradeHistory } = useStatisticsStore();

  /** ========== 기본 Form 상태 ========== */
  const [form, setForm] = useState({
    title: "",
    price: "",
    finalCategoryCode: DEFAULT_LARGE_CODE,
    content: "",
  });

  /** ========== 이미지 배열 상태 (다중 업로드) ========== */
  // images: { id, preview, url, file? }[]
  const [images, setImages] = useState([]);
  const dragIndexRef = useRef(null);

  /** 카테고리 */
  const [selectedLgCode, setSelectedLgCode] = useState(DEFAULT_LARGE_CODE);
  const [selectedMdCode, setSelectedMdCode] = useState("");
  const [selectedSmCode, setSelectedSmCode] = useState("");

  // 시세
  const [tradeHistory, setTradeHistory] = useState([]);
  const [showTradeHistory, setShowTradeHistory] = useState(false);
  const [avgPrice, setAvgPrice] = useState(0);

  /** 기타 상태 */
  const [hashtagsInput, setHashtagsInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  // AI 분석용
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [fileForAi, setFileForAi] = useState(null); // 분석할 원본 파일 저장

  const titleCount = useMemo(() => form.title.length, [form.title]);

  const onChange = (e) =>
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  /** 🔥 EDIT 모드: 기존 상품 로딩 */
  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const data = await postService.getPost(postId);

        setForm({
          title: data.title ?? "",
          price: data.price ?? "",
          content: data.content ?? "",
          finalCategoryCode: data.categoryCode ?? DEFAULT_LARGE_CODE,
        });

        /** 이미지 여러 장 로딩 */
        const urlList =
          Array.isArray(data.imageUrls) && data.imageUrls.length
            ? data.imageUrls
            : data.imageUrl
            ? [data.imageUrl]
            : [];

        const resolved = await Promise.all(
          urlList.map(async (orig) => {
            const isAbs = /^https?:\/\//.test(orig);

            if (isAbs) {
              return {
                id: crypto.randomUUID(),
                preview: orig,
                url: orig,
              };
            }

            try {
              const r = await api.get(
                `/api/upload/post/image?url=${encodeURIComponent(orig)}`
              );
              return {
                id: crypto.randomUUID(),
                preview: r?.data?.imageUrl || orig,
                url: orig,
              };
            } catch {
              return {
                id: crypto.randomUUID(),
                preview: orig,
                url: orig,
              };
            }
          })
        );

        setImages(resolved);

        setHashtagsInput(
          (data.hashtags || []).map((h) => h.name ?? h).join(" ")
        );
      } catch (e) {
        console.error(e);
        setError("상품 정보를 불러오지 못했습니다.");
      }
    })();
  }, [isEdit, postId]);

  /** 카테고리 final */
  useEffect(() => {
    const final = selectedSmCode || selectedMdCode || selectedLgCode;
    setForm((s) => ({ ...s, finalCategoryCode: final }));
  }, [selectedLgCode, selectedMdCode, selectedSmCode]);

  const mdOptions = useMemo(() => {
    const lg = CATEGORY_HIERARCHY[selectedLgCode];
    return lg?.children || {};
  }, [selectedLgCode]);

  const smOptions = useMemo(() => {
    const md = mdOptions[selectedMdCode];
    return md?.children || {};
  }, [selectedMdCode, mdOptions]);

  // 대분류 변경 핸들러
  const handleLgChange = (e) => {
    const newLgCode = e.target.value;
    setSelectedLgCode(newLgCode);
    setSelectedMdCode(""); // 중분류 초기화
    setSelectedSmCode(""); // 소분류 초기화
    setError(null);
  };
  // 중분류 변경 핸들러
  const handleMdChange = (e) => {
    const newMdCode = e.target.value;
    setSelectedMdCode(newMdCode);
    setSelectedSmCode(""); // 소분류 초기화
    setError(null);
  };
  // 소분류 변경 핸들러
  const handleSmChange = (e) => {
    const newSmCode = e.target.value;
    setSelectedSmCode(newSmCode);
    setError(null);
  };

  const handleTradeHistory = async () => {
    setTradeHistory(await getTradeHistory(form.finalCategoryCode));
    setShowTradeHistory(true);
  };

  useEffect(() => {
    const totalPriceSum = tradeHistory.reduce((sum, history) => {
      const price = Number(history.price);
      return sum + (isNaN(price) ? 0 : price);
    }, 0);

    const avg = totalPriceSum / tradeHistory.length;
    setAvgPrice(Math.round(avg));
  }, [tradeHistory]);

  const recommendPrice = () => {
    setForm((s) => ({ ...s, price: avgPrice }));
  };

  /** ───────────────────────────────
   *  🔥 이미지 업로드 (MULTI)
   * ─────────────────────────────── */
  const onPickImage = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    handleFiles(files);
  };

  const handleFiles = async (files) => {
    // 첫 번째 파일을 AI 분석용으로 저장
    if (files[0]) {
      setFileForAi(files[0]);
    }

    const localItems = files.map((file) => ({
      id: crypto.randomUUID(),
      preview: URL.createObjectURL(file),
      file,
      url: null,
    }));

    setImages((prev) => [...prev, ...localItems]);

    try {
      setUploading(true);

      for (const item of localItems) {
        const res = await s3Service.uploadImage(item.file);
        const uploadedUrl = res?.imageUrl || res?.url;

        setImages((prev) =>
          prev.map((p) =>
            p.id === item.id ? { ...p, url: uploadedUrl, file: undefined } : p
          )
        );
      }
    } catch (err) {
      console.error("업로드 실패:", err);
      // 업로드 실패한 로컬 이미지 제거
      setImages((prev) =>
        prev.filter((p) => !localItems.some((li) => li.id === p.id))
      );
    } finally {
      setUploading(false);
    }
  };

  /** 대표 설정 */
  const makeCover = (idx) =>
    setImages((prev) => {
      const arr = [...prev];
      const [x] = arr.splice(idx, 1);
      arr.unshift(x);
      return arr;
    });

  /** 삭제 */
  const removeImage = (idx) =>
    setImages((prev) => {
      const arr = [...prev];
      const [rm] = arr.splice(idx, 1);
      if (rm.preview?.startsWith("blob:")) URL.revokeObjectURL(rm.preview);
      return arr;
    });

  /** 드래그 이동 */
  const onDragStart = (idx) => () => {
    dragIndexRef.current = idx;
  };

  const onDragOver = (e) => e.preventDefault();

  const onDrop = (idx) => (e) => {
    e.preventDefault();
    const from = dragIndexRef.current;
    if (from == null || from === idx) return;

    setImages((prev) => {
      const arr = [...prev];
      const [moved] = arr.splice(from, 1);
      arr.splice(idx, 0, moved);
      return arr;
    });

    dragIndexRef.current = null;
  };

  // AI 분석 핸들러
  const handleAiAnalysis = async () => {
    if (!fileForAi) {
      alert("먼저 상품 이미지를 등록해주세요.");
      return;
    }

    const confirmed = window.confirm(
      "AI가 이미지를 분석하여 제목, 내용, 카테고리를 자동으로 작성합니다.\n기존 내용은 덮어씌워집니다. 진행하시겠습니까?"
    );
    if (!confirmed) return;

    setIsAnalyzing(true);
    try {
      const data = await aiService.analyzeImage(fileForAi);

      // 텍스트 데이터 적용
      setForm((prev) => ({
        ...prev,
        title: data.title || prev.title,
        content: data.content || prev.content,
        finalCategoryCode: data.categoryCode || prev.finalCategoryCode,
      }));

      // 카테고리 드롭다운 자동 선택 로직
      if (data.categoryCode) {
        const targetCode = String(data.categoryCode);
        let foundLg = "",
          foundMd = "",
          foundSm = "";

        outerLoop: for (const [lgKey, lgVal] of Object.entries(
          CATEGORY_HIERARCHY
        )) {
          if (lgKey === targetCode) {
            foundLg = lgKey;
            break;
          }

          const mdChildren = lgVal.children || {};
          for (const [mdKey, mdVal] of Object.entries(mdChildren)) {
            if (mdKey === targetCode) {
              foundLg = lgKey;
              foundMd = mdKey;
              break outerLoop;
            }

            const smChildren = mdVal.children || {};
            for (const [smKey] of Object.entries(smChildren)) {
              if (smKey === targetCode) {
                foundLg = lgKey;
                foundMd = mdKey;
                foundSm = smKey;
                break outerLoop;
              }
            }
          }
        }

        if (foundLg) setSelectedLgCode(foundLg);
        setSelectedMdCode(foundMd || "");
        setSelectedSmCode(foundSm || "");
      }

      alert("AI 분석이 완료되었습니다!");
    } catch (err) {
      console.error(err);
      alert("AI 분석에 실패했습니다.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  /** ───────────────────────────────
   *  🔥 onSubmit (백엔드 Request 구조에 맞게)
   * ─────────────────────────────── */
  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.finalCategoryCode) {
      setError("카테고리를 선택해주세요.");
      return;
    }

    const imgUrls = images.map((img) => img.url).filter(Boolean);

    const payload = {
      title: form.title.trim(),
      content: form.content.trim(),
      price: Number(form.price),
      categoryCode: form.finalCategoryCode,
      imageUrl: imgUrls[0] || null,
      imageUrls: imgUrls,
      hashtags: parseHashtags(hashtagsInput),
    };

    setSubmitting(true);

    try {
      if (isEdit) {
        await postService.updatePost(postId, payload);
        navigate(`/products/${postId}`);
      } else {
        const data = await postService.createPost(payload);
        navigate(`/products/${data.id}`);
      }
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "등록 실패");
    } finally {
      setSubmitting(false);
    }
  };

  /** 취소 */
  const handleCancel = () => {
    if (
      form.title ||
      form.price ||
      form.content ||
      hashtagsInput ||
      images.length > 0
    ) {
      if (!window.confirm("작성 중인 내용이 있습니다. 취소할까요?")) return;
    }

    navigate(isEdit ? `/products/${postId}` : "/");
  };

  /** UI */
  return (
    <MainLayout>
      <Header />
      <div className="w-[960px] mx-auto p-6 font-presentation">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">
            {isEdit ? "상품 수정" : "상품등록"}
          </h2>

          {goBack && (
            <button
              onClick={goBack}
              className="px-3 py-1.5 rounded-lg border hover:bg-gray-50"
            >
              목록
            </button>
          )}
        </div>

        <form onSubmit={onSubmit} className="space-y-8">
          {/* 이미지 업로드 */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">상품이미지</label>

              {/* AI 버튼 */}
              <button
                type="button"
                onClick={handleAiAnalysis}
                disabled={isAnalyzing || !fileForAi}
                className={`
                  flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all shadow-sm
                  ${
                    isAnalyzing || !fileForAi
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-indigo-500 to-purple-600 hover:shadow-md hover:-translate-y-0.5"
                  }
                `}
              >
                <FiCpu
                  size={14}
                  className={isAnalyzing ? "animate-spin" : ""}
                />
                {isAnalyzing ? "AI 분석 중..." : "✨ AI 자동 채우기"}
              </button>
            </div>

            <label className="group relative w-full min-h-[260px] rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 transition cursor-pointer">
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={onPickImage}
              />
              <div className="flex items-center gap-2 text-sm">
                <FiImage className="text-xl opacity-80" />
                <span className="font-medium">이미지 등록</span>
                {uploading && <span className="text-xs">· 업로드 중...</span>}
              </div>
            </label>

            {images.length > 0 && (
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {images.map((img, idx) => (
                  <div
                    key={img.id}
                    className="group relative border border-rebay-gray-400 rounded-lg overflow-hidden bg-gray-50 cursor-grab active:cursor-grabbing"
                    draggable
                    onDragStart={onDragStart(idx)}
                    onDragOver={onDragOver}
                    onDrop={onDrop(idx)}
                  >
                    {idx === 0 && (
                      <span className="absolute left-2 top-2 z-10 inline-flex items-center px-2 py-1 rounded-md text-[11px] font-semibold bg-black/60 text-white shadow">
                        대표이미지
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(idx);
                      }}
                      className="absolute right-2 top-2 z-10 opacity-0 group-hover:opacity-100 transition bg-black/70 text-white rounded-full w-6 h-6 flex items-center justify-center"
                    >
                      <FiX size={14} />
                    </button>

                    <img
                      src={img.preview || img.url}
                      alt={idx}
                      className="w-full h-40 object-cover pointer-events-none select-none"
                      onClick={() => makeCover(idx)}
                    />
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* 아래는 카테고리 ~ 등록 부분 그 원본 그대로 유지 */}

          {/* 카테고리 선택 */}
          <section>
            <label
              htmlFor="category-select"
              className="block text-sm font-semibold mb-3 "
            >
              카테고리 선택 (필수)
            </label>

            <div className="flex flex-col sm:flex-row gap-3">
              {/* 대분류 */}
              <div className="relative flex-1">
                <select
                  name="largeCategory"
                  value={selectedLgCode}
                  onChange={handleLgChange}
                  required
                  className="w-full rounded-xl border border-rebay-gray-400 px-4 appearance-none py-2.5 pr-10 bg-white text-base focus:outline-none focus:ring-1 focus:ring-sky-500 transition"
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

              {/* 중분류 */}
              <div className="relative flex-1">
                <select
                  name="mediumCategory"
                  value={selectedMdCode}
                  onChange={handleMdChange}
                  disabled={Object.keys(mdOptions).length === 0}
                  className={`w-full rounded-xl border px-4 appearance-none py-2.5 pr-10 bg-white text-base transition ${
                    Object.keys(mdOptions).length === 0
                      ? "border-gray-200 text-gray-400"
                      : "border-rebay-gray-400 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  }`}
                >
                  <option value="">
                    {Object.keys(mdOptions).length === 0
                      ? "하위 없음"
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

              {/* 소분류 */}
              <div className="relative flex-1">
                <select
                  name="smallCategory"
                  value={selectedSmCode}
                  onChange={handleSmChange}
                  disabled={Object.keys(smOptions).length === 0}
                  className={`w-full rounded-xl border px-4 appearance-none py-2.5 pr-10 bg-white text-base transition ${
                    Object.keys(smOptions).length === 0
                      ? "border-gray-200 text-gray-400"
                      : "border-rebay-gray-400 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  }`}
                >
                  <option value="">
                    {Object.keys(smOptions).length === 0
                      ? "하위 없음"
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
              <button
                type="button"
                onClick={handleTradeHistory}
                className="cursor-pointer flex bg-rebay-blue w-[100px] rounded-xl text-white font-bold justify-center items-center"
              >
                <div>시세확인</div>
              </button>
            </div>
          </section>

          {/* 시세 제안 창 */}
          <section className="relative">
            {showTradeHistory && (
              <div className="flex flex-col mb-5 absolute z-10 top-full right-0 mt-2 w-[300px]">
                <div className="flex flex-col space-y-1 bg-white rounded-xl shadow-md transition-all border border-rebay-gray-400 h-auto p-3">
                  <div className="flex justify-between p-1 font-bold text-lg">
                    <div>평균 거래 시세</div>
                    <div>
                      <FiX
                        className="cursor-pointer"
                        onClick={() => setShowTradeHistory(false)}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between p-1 rounded-md bg-rebay-gray-100 text-rebay-gray-600">
                    <label className="ml-1 ">총 거래 건수</label>
                    <div className="mr-1">{tradeHistory.length}건</div>
                  </div>
                  {tradeHistory.length > 0 ? (
                    <div className="flex flex-col p-1 h-[70px] justify-center text-white rounded-sm text-[10px] bg-rebay-blue">
                      <label className="ml-1">평균 가격</label>
                      <div className=" flex justify-between">
                        <div className="text-2xl ml-1 font-bold">
                          {avgPrice.toLocaleString("ko-KR")} 원
                        </div>
                        <button
                          type="button"
                          onClick={recommendPrice}
                          className="cursor-pointer text-xs border border-white bg-white/20 text-white rounded-full h-[30px] w-[70px] mr-2"
                        >
                          평균가격 선택
                        </button>
                      </div>
                      <div className="text-[10px] ml-1">*최근 판매가 기준</div>
                    </div>
                  ) : (
                    <div className="flex flex-col p-1 h-[70px] justify-center text-white rounded-sm bg-rebay-blue">
                      <div className=" flex justify-between items-center">
                        <div className="text-4xl ml-3 font-bold">텅</div>
                        <button
                          type="button"
                          className="cursor-pointer text-xs border border-white bg-white/20 text-white rounded-full h-[30px] w-[70px] mr-2"
                        >
                          평균가격 선택
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="p-1">
                    <label>거래내역</label>
                    {tradeHistory.length > 0 ? (
                      <div className="text-xs text-rebay-gray-600 h-full max-h-[80px] overflow-y-scroll border p-1 rounded-sm border-gray-300  bg-gray-100 ">
                        {tradeHistory.map((history) => (
                          <Trade history={history} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-rebay-gray-600 h-full max-h-[80px] border p-1 rounded-sm border-gray-300  bg-gray-100 ">
                        거래 내역이 없어요
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* 상품명 */}
          <section>
            <label className="block text-sm font-medium mb-2">상품명</label>
            <div className="relative">
              <input
                name="title"
                value={form.title}
                onChange={onChange}
                required
                maxLength={40}
                className="w-full rounded-lg border border-rebay-gray-400 px-3 py-2"
                placeholder="상품명을 입력해 주세요."
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                {titleCount}/40
              </span>
            </div>
          </section>

          {/* 가격 */}
          <section>
            <label className="block text-sm font-medium mb-2">가격(원)</label>
            <input
              name="price"
              type="number"
              min="0"
              step="1"
              value={form.price}
              onChange={onChange}
              required
              className="w-[240px] rounded-lg border border-rebay-gray-400 px-3 py-2"
              placeholder="예) 420000"
            />
          </section>

          {/* 설명 */}
          <section>
            <label className="block text-sm font-medium mb-2">설명</label>
            <textarea
              name="content"
              value={form.content}
              onChange={onChange}
              required
              rows={8}
              className="w-full rounded-lg border border-rebay-gray-400 px-3 py-2"
              placeholder={`• 브랜드, 모델명, 구매 시기, 하자 유무 등\n• 연락처 등 개인정보는 제한될 수 있어요.`}
            />
          </section>

          {/* 해시태그 */}
          <section>
            <label className="block text-sm font-medium mb-2">해시태그</label>
            <input
              value={hashtagsInput}
              onChange={(e) => setHashtagsInput(e.target.value)}
              className="w-full rounded-lg border border-rebay-gray-400 px-3 py-2"
              placeholder="#아이패드 #64GB"
            />

            <div className="flex flex-wrap gap-2 mt-2">
              {parseHashtags(hashtagsInput).map((t) => (
                <span
                  key={t}
                  className="px-2 py-1 rounded-full text-xs bg-gray-100"
                >
                  #{t}
                </span>
              ))}
            </div>
          </section>

          {/* 제출 */}
          <section className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleCancel}
              disabled={submitting || uploading}
              className="cursor-pointer px-4 py-2 rounded-lg border border-rebay-gray-400 hover:bg-gray-50"
            >
              취소
            </button>

            <button
              type="submit"
              disabled={submitting || uploading}
              className="cursor-pointer px-5 py-2 rounded-lg bg-rebay-blue text-white hover:opacity-90"
            >
              {isEdit
                ? submitting
                  ? "수정 중..."
                  : "수정하기"
                : submitting
                ? "등록 중..."
                : "등록하기"}
            </button>
          </section>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>
      </div>
      <Footer />
    </MainLayout>
  );
};

export default ProductCreate;
