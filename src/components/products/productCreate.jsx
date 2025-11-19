import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import postService from "../../services/post";
import s3Service from "../../services/s3";
import { FiEdit2, FiImage, FiTrash2 } from "react-icons/fi";
import MainLayout from "../layout/MainLayout";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import api from "../../services/api";

const CATEGORY_HIERARCHY = {
  // Level 1: 대분류 (Large)
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

  const [form, setForm] = useState({
    title: "",
    price: "",
    finalCategoryCode: DEFAULT_LARGE_CODE,
    imageUrl: "",
    content: "",
  });

  const [selectedLgCode, setSelectedLgCode] = useState(DEFAULT_LARGE_CODE);
  const [selectedMdCode, setSelectedMdCode] = useState("");
  const [selectedSmCode, setSelectedSmCode] = useState("");

  const [hashtagsInput, setHashtagsInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const [imagePreview, setImagePreview] = useState("");

  const titleCount = useMemo(() => form.title.length, [form.title]);
  const onChange = (e) =>
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const data = await postService.getPost(postId);

        setForm({
          title: data.title ?? "",
          price: data.price ?? "",
          imageUrl: data.imageUrl ?? "",
          content: data.content ?? "",
          finalCategoryCode: data.categoryCode ?? DEFAULT_LARGE_CODE,
        });

        if (data.imageUrl) {
          try {
            const r = await api.get(
              `/api/upload/post/image?url=${encodeURIComponent(data.imageUrl)}`
            );
            setImagePreview(r?.data?.imageUrl || data.imageUrl);
          } catch {
            setImagePreview(data.imageUrl);
          }
        }
        setHashtagsInput(
          (data.hashtags || []).map((h) => h.name ?? h).join(" ")
        );
      } catch (e) {
        console.error(e);
        setError("상품 정보를 불러오지 못했습니다.");
      }
    })();
  }, [isEdit, postId]);

  useEffect(() => {
    // 가장 깊게 선택된 코드를 최종 카테고리 코드로 설정
    const finalCode = selectedSmCode || selectedMdCode || selectedLgCode;
    setForm((s) => ({ ...s, finalCategoryCode: finalCode }));
  }, [selectedLgCode, selectedMdCode, selectedSmCode]);

  // 중분류 옵션 계산
  const mdOptions = useMemo(() => {
    const lg = CATEGORY_HIERARCHY[selectedLgCode];
    return lg?.children || {};
  }, [selectedLgCode]);

  // 소분류 옵션 계산
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

  const handleFile = async (file) => {
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(localUrl);

    try {
      setUploading(true);
      const res = await s3Service.uploadImage(file);
      const uploadedUrl = res?.imageUrl || res?.url;
      if (!uploadedUrl) {
        throw new Error("업로드 응답에 imageUrl/url이 없습니다.");
      }
      setForm((s) => ({ ...s, imageUrl: uploadedUrl }));
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message || err.message || "이미지 업로드 실패"
      );
      URL.revokeObjectURL(localUrl);
      setImagePreview("");
    } finally {
      setUploading(false);
    }
  };

  const onPickImage = (e) => handleFile(e.target.files?.[0]);

  const resetForm = () => {
    setForm({
      title: "",
      price: "",
      finalCategoryCode: DEFAULT_LARGE_CODE,
      imageUrl: "",
      content: "",
    });
    setSelectedLgCode(DEFAULT_LARGE_CODE);
    setSelectedMdCode("");
    setSelectedSmCode("");
    setHashtagsInput("");
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview("");
    setError(null);
  };

  const handleCancel = () => {
    const hasChanges =
      form.title || form.price || form.content || hashtagsInput || imagePreview;

    if (hasChanges) {
      const ok = window.confirm("작성 중인 내용이 있습니다. 취소할까요?");
      if (!ok) return;
    }

    resetForm();
    if (typeof goBack === "function") goBack();
    else navigate(isEdit ? `/products/${postId}` : "/");
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!form.finalCategoryCode) {
      setError("카테고리를 선택해주세요.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        title: form.title?.trim(),
        content: form.content?.trim(),
        price: form.price === "" ? null : Number(form.price),
        categoryCode: form.finalCategoryCode,
        imageUrl: form.imageUrl || undefined,
        hashtags: parseHashtags(hashtagsInput),
      };
      if (isEdit) {
        const updated = await postService.updatePost(postId, payload);
        resetForm();
        navigate(`/products/${postId}`);
      } else {
        const data = await postService.createPost(payload);
        onCreated?.(data);
        resetForm();
        navigate(`/products/${data.id}`);
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "등록 실패");
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async () => {
    if (!isEdit) return;
    if (!window.confirm("정말 삭제할까요?")) return;
    try {
      await postService.deletePost(postId);
      navigate("/products");
    } catch (e) {
      console.error(e);
      alert("삭제 실패");
    }
  };

  return (
    <MainLayout>
      <Header />
      <div className="w-[960px] mx-auto p-6 font-presentation">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">
            {isEdit ? "상품 수정" : "상품정보"}
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
          <section>
            <label className="block text-sm font-medium mb-2">상품이미지</label>

            {!imagePreview ? (
              <label
                className="group relative w-full min-h-[260px] rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 transition cursor-pointer"
                title="이미지를 클릭해서 선택"
              >
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onPickImage}
                />
                <div className="flex items-center gap-2 text-sm">
                  <FiImage className="text-xl opacity-80" />
                  <span className="font-medium">이미지 등록</span>
                </div>
                {uploading && (
                  <span className="text-xs mt-2">업로드 중...</span>
                )}
              </label>
            ) : (
              <div className="relative group rounded-xl border overflow-hidden bg-gray-50">
                <div className="w-full h-[520px] flex items-center justify-center">
                  <img
                    src={imagePreview}
                    alt="preview"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.src = "";
                    }}
                  />
                </div>

                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/0 via-black/0 to-black/10 opacity-0 group-hover:opacity-100 transition" />
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                  <label className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-white/90 backdrop-blur px-3 py-1.5 text-sm shadow-sm hover:bg-white cursor-pointer">
                    <FiEdit2 />
                    <span className="hidden sm:inline">
                      {uploading ? "업로드 중..." : "이미지 변경"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={onPickImage}
                      disabled={uploading}
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      if (imagePreview) URL.revokeObjectURL(imagePreview);
                      setImagePreview("");
                      setForm((s) => ({ ...s, imageUrl: "" }));
                    }}
                    className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-white/90 backdrop-blur px-3 py-1.5 text-sm shadow-sm hover:bg-white"
                    disabled={uploading}
                  >
                    <FiTrash2 />
                    <span className="hidden sm:inline">삭제</span>
                  </button>
                </div>
              </div>
            )}
          </section>

          <section>
            <label
              htmlFor="category-select"
              className="block text-sm font-semibold mb-3 text-gray-700"
            >
              카테고리 선택 (필수)
            </label>
            {/* 3단계 계층형 드롭다운 */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* 1. 대분류 선택 */}
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

              {/* 2. 중분류 선택 */}
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

              {/* 3. 소분류 선택 */}
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

          <section>
            <label className="block text-sm font-medium mb-2">설명</label>
            <textarea
              name="content"
              value={form.content}
              onChange={onChange}
              required
              rows={8}
              className="w-full rounded-lg border border-rebay-gray-400 px-3 py-2"
              placeholder={`• 브랜드, 모델명, 구매 시기, 하자 유무 등 상세 설명을 적어주세요.\n• 연락처, SNS 계정 등 개인정보 입력은 제한될 수 있어요.`}
            />
          </section>

          <section>
            <label className="block text-sm font-medium mb-2">해시태그</label>
            <input
              value={hashtagsInput}
              onChange={(e) => setHashtagsInput(e.target.value)}
              className="w-full rounded-lg border border-rebay-gray-400 px-3 py-2"
              placeholder="#아이패드, #64GB"
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

          <section className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleCancel}
              disabled={submitting || uploading}
              className="cursor-pointer px-4 py-2 rounded-lg border border-rebay-gray-400 hover:bg-gray-50 disabled:opacity-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={submitting || uploading}
              className="cursor-pointer px-5 py-2 rounded-lg bg-rebay-blue hover:opacity-90 text-white disabled:opacity-50"
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
