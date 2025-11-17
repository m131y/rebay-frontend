import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import postService from "../../services/post";
import s3Service from "../../services/s3";
import { FiEdit2, FiImage, FiTrash2 } from "react-icons/fi";
import MainLayout from "../layout/MainLayout";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import api from "../../services/api";

const CATEGORY_OPTIONS = [
  "DIGITAL_DEVICES",
  "HOME_APPLIANCES",
  "FURNITURE",
  "HOME_KITCHEN",
  "BOOKS",
  "PLANTS",
  "CLOTHES",
  "OTHER_USED_ITEMS",
];

const CATEGORY_LABELS = {
  DIGITAL_DEVICES: "가전/디지털",
  HOME_APPLIANCES: "생활가전",
  FURNITURE: "가구",
  HOME_KITCHEN: "주방/생활",
  BOOKS: "도서",
  PLANTS: "식물",
  CLOTHES: "의류",
  OTHER_USED_ITEMS: "기타 중고물품",
};

const parseHashtags = (input) =>
  (input || "")
    .replaceAll(",", " ")
    .split(" ")
    .map((s) => s.replace(/^#/, "").trim())
    .filter(Boolean);

const ProductCreate = ({
  onCreated,
  goBack,
  defaultCategory = "DIGITAL_DEVICES",
}) => {
  const navigate = useNavigate();
  const { postId } = useParams();
  const isEdit = Boolean(postId);

  const [form, setForm] = useState({
    title: "",
    price: "",
    category: defaultCategory,
    imageUrl: "",
    content: "",
  });

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
          category: data.category ?? defaultCategory,
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

  const [catOpen, setCatOpen] = useState(false);
  const catRef = useRef(null);
  const toggleCat = () => setCatOpen((v) => !v);
  const closeCat = () => setCatOpen(false);
  const catLabel = CATEGORY_LABELS[form.category] || form.category;

  useEffect(() => {
    if (!catOpen) return;
    const handleOutside = (e) => {
      if (!catRef.current) return;
      if (!catRef.current.contains(e.target)) closeCat();
    };
    const handleEsc = (e) => {
      if (e.key === "Escape") closeCat();
    };
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [catOpen]);

  const resetForm = () => {
    setForm({
      title: "",
      price: "",
      category: defaultCategory,
      imageUrl: "",
      content: "",
    });
    setHashtagsInput("");
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview("");
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
    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        title: form.title?.trim(),
        content: form.content?.trim(),
        price: form.price === "" ? null : Number(form.price),
        category: form.category,
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

          <section ref={catRef}>
            <label className="block text-sm font-medium mb-2">카테고리</label>

            <button
              type="button"
              onClick={toggleCat}
              onKeyDown={(e) =>
                e.key === "Enter" || e.key === " " ? toggleCat() : null
              }
              className="w-full flex items-center justify-between rounded-lg border border-rebay-gray-400 px-4 py-2 text-left hover:bg-gray-50"
              aria-expanded={catOpen}
              aria-controls="category-panel"
            >
              <span className="text-sm">{catLabel}</span>
              <svg
                className={`w-4 h-4 transition-transform ${
                  catOpen ? "rotate-180" : ""
                }`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.188l3.71-3.957a.75.75 0 111.1 1.022l-4.25 4.53a.75.75 0 01-1.1 0l-4.25-4.53a.75.75 0 01.02-1.06z" />
              </svg>
            </button>

            {catOpen && (
              <div
                id="category-panel"
                className="mt-2 border border-rebay-gray-400 rounded-lg overflow-hidden"
              >
                <div className="max-h-60 overflow-y-auto">
                  {CATEGORY_OPTIONS.map((c) => {
                    const active = form.category === c;
                    return (
                      <button
                        type="button"
                        key={c}
                        onClick={() => {
                          setForm((s) => ({ ...s, category: c }));
                          closeCat();
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                          active ? "bg-gray-100 font-medium" : ""
                        }`}
                      >
                        {CATEGORY_LABELS[c] || c}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
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
