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
import { format } from "date-fns"; // date-fns 라이브러리 추가

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
          262: { name: "아이폰14" },
          263: { name: "아이폰15" },
        },
      },
    },
  },
  300: {
    name: "의류/잡화",
    children: {
      310: { name: "여성 의류", children: {} },
      320: { name: "남성 의류", children: {} },
    },
  },
  400: {
    name: "도서/문구",
    children: {
      410: { name: "전공 도서", children: {} },
      420: { name: "일반 도서", children: {} },
    },
  },
};

const parseHashtags = (tagString) => {
  if (!tagString) return [];
  return tagString
    .split("#")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
};

// 가격을 포맷하는 함수
const priceFormat = (v) =>
  v == null
    ? ""
    : new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(
        Number(v)
      );

// ====================================================================

const ProductCreate = () => {
  const navigate = useNavigate();
  const { productId } = useParams();
  const isEdit = !!productId; // 수정 모드인지 확인

  // 상태 관리
  const [productType, setProductType] = useState("POST"); // POST 또는 AUCTION
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryLargeCode, setCategoryLargeCode] = useState(200);
  const [categoryCode, setCategoryCode] = useState(""); // 중분류 또는 소분류 코드를 저장
  const [price, setPrice] = useState(0); // POST용
  const [startPrice, setStartPrice] = useState(0); // AUCTION용
  const [startTime, setStartTime] = useState(""); // AUCTION 시작 시간 (YYYY-MM-DDThh:mm)
  const [endTime, setEndTime] = useState(""); // AUCTION 종료 시간 (YYYY-MM-DDThh:mm)
  const [images, setImages] = useState([]); // File 객체들
  const [existingImages, setExistingImages] = useState([]); // 수정 모드에서 기존 이미지 URL
  const [hashtagsInput, setHashtagsInput] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  // AI 추천 기능
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPrice, setAiPrice] = useState(null);

  // 기존 상품 데이터 불러오기 (수정 모드일 때)
  useEffect(() => {
    if (isEdit) {
      const fetchProduct = async () => {
        try {
          const res = await api.get(`/api/products/${productId}`);
          const product = res.data.productData;
          setProductType(res.data.productType);
          setTitle(product.title);
          setContent(product.content);
          setCategoryLargeCode(Math.floor(product.categoryCode / 100) * 100);
          setCategoryCode(product.categoryCode);

          if (res.data.productType === "POST") {
            setPrice(product.price || 0);
          } else if (res.data.productType === "AUCTION") {
            setStartPrice(product.price || 0); // startPrice는 공통 price 필드에 저장됨
            setStartTime(
              format(new Date(product.startTime), "yyyy-MM-dd'T'HH:mm")
            );
            setEndTime(format(new Date(product.endTime), "yyyy-MM-dd'T'HH:mm"));
          }

          setExistingImages(product.imageUrls || []);
          setHashtagsInput(
            (product.hashtags || []).map((h) => `#${h.name}`).join(" ")
          );
        } catch (err) {
          console.error("상품 데이터 로드 실패:", err);
          setError("상품 데이터를 불러오는 데 실패했습니다.");
        }
      };
      fetchProduct();
    }
  }, [isEdit, productId]);

  // 카테고리 옵션 계산
  const categoryOptions = useMemo(() => {
    const largeCategory = CATEGORY_HIERARCHY[categoryLargeCode];
    if (!largeCategory) return [];

    const options = [];
    // 중분류 (10의 자리) 추가
    for (const code in largeCategory.children) {
      const subCategory = largeCategory.children[code];
      options.push({
        code: parseInt(code),
        name: subCategory.name,
      });

      // 소분류 (1의 자리) 추가
      for (const minorCode in subCategory.children) {
        options.push({
          code: parseInt(minorCode),
          name: `> ${subCategory.children[minorCode].name}`,
        });
      }
    }
    return options;
  }, [categoryLargeCode]);

  // 이미지 파일 핸들러
  const handleImageChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setImages((prev) => [...prev, ...newFiles].slice(0, 5)); // 최대 5개 제한
  };

  // 이미지 삭제 핸들러
  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };
  const handleRemoveExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  // AI 가격 추천 요청
  const handleAiPriceRequest = async () => {
    if (!title || !categoryCode) {
      setError("제목과 카테고리를 먼저 선택해주세요.");
      return;
    }
    setAiLoading(true);
    setAiPrice(null);
    setError(null);

    try {
      const response = await aiService.getPredictedPrice({
        title,
        categoryCode,
      });
      if (response.data && response.data.predictedPrice) {
        setAiPrice(response.data.predictedPrice);
      } else {
        setError("AI 가격 추천에 실패했습니다. 다시 시도해 주세요.");
      }
    } catch (e) {
      console.error("AI 가격 추천 오류:", e);
      setError("AI 가격 추천 중 오류가 발생했습니다.");
    } finally {
      setAiLoading(false);
    }
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting || uploading) return;

    if (
      !title ||
      !content ||
      !categoryCode ||
      images.length + existingImages.length === 0
    ) {
      setError("모든 필수 필드(제목, 내용, 카테고리, 이미지)를 채워주세요.");
      return;
    }

    if (productType === "POST" && price <= 0) {
      setError("판매 가격은 0원보다 커야 합니다.");
      return;
    }

    if (productType === "AUCTION") {
      if (startPrice <= 0) {
        setError("경매 시작 가격은 0원보다 커야 합니다.");
        return;
      }

      if (!startTime || !endTime) {
        setError("경매 시작 시간과 종료 시간을 설정해주세요.");
        return;
      }

      const now = new Date();
      const start = new Date(startTime);
      const end = new Date(endTime);
      const minDurationMs = 5 * 60 * 1000; // 5분 (밀리초)

      // 1. 시작 시간이 현재 시각 이전인지 검증
      if (start.getTime() <= now.getTime()) {
        setError("경매 시작 시간은 현재 시각보다 늦어야 합니다.");
        return;
      }

      // 2. 종료 시간이 시작 시간보다 최소 5분 이후인지 검증
      if (end.getTime() <= start.getTime() + minDurationMs) {
        setError("경매 종료 시간은 시작 시간보다 최소 5분 이후여야 합니다.");
        return;
      }
    }

    setSubmitting(true);
    setError(null);

    try {
      // 1. 이미지 업로드
      setUploading(true);
      const newImageKeys = await s3Service.uploadPostImages(images);
      setUploading(false);

      // 2. 최종 이미지 키 리스트 구성 (기존 이미지 + 새로 업로드된 이미지)
      const allImageKeys = [...existingImages, ...newImageKeys];
      const thumbnailImageKey = allImageKeys[0] || ""; // 첫 번째 이미지를 썸네일로 사용

      // 3. 데이터 준비
      const hashtags = parseHashtags(hashtagsInput);

      const commonData = {
        title,
        content,
        categoryCode,
        imageUrls: allImageKeys,
        thumbnailImageUrl: thumbnailImageKey,
        hashtags,
      };

      let finalData;
      let serviceCall;

      if (productType === "POST") {
        finalData = {
          ...commonData,
          price: price,
        };
        serviceCall = isEdit
          ? postService.updatePost(productId, finalData)
          : postService.createPost(finalData);
      } else if (productType === "AUCTION") {
        finalData = {
          ...commonData,
          startPrice: startPrice, // 백엔드에서 price 필드로 처리될 수 있음
          startTime: new Date(startTime).toISOString(),
          endTime: new Date(endTime).toISOString(),
        };
        // 경매 상품 생성/수정 API는 백엔드 구현에 따라 다를 수 있습니다.
        // 여기서는 임시로 postService를 사용하며, 실제로는 auctionService를 사용해야 합니다.
        serviceCall = isEdit
          ? api.put(`/api/auction/${productId}`, finalData)
          : api.post("/api/auction", finalData);
      }

      // 4. 상품 등록/수정 요청
      const response = await serviceCall;
      useStatisticsStore.getState().incrementItemCount();
      navigate(`/products/${response.data.id}`);
    } catch (e) {
      console.error("상품 등록/수정 실패:", e.response?.data || e);
      setError(
        "상품 등록/수정 중 오류가 발생했습니다. 모든 필드를 다시 확인해주세요."
      );
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <MainLayout>
      <Header />
      <div className="flex justify-center p-4">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-2xl bg-white p-6 rounded-xl shadow-lg font-presentation"
        >
          <h1 className="text-2xl font-bold mb-6 text-gray-800">
            {isEdit ? "상품 수정" : "새 상품 등록"}
          </h1>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* 판매 유형 선택 (수정 모드에서는 비활성화) */}
          <section className="mb-6 border-b pb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              판매 유형
            </label>
            <div className="flex gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="productType"
                  value="POST"
                  checked={productType === "POST"}
                  onChange={() => setProductType("POST")}
                  disabled={isEdit}
                  className="form-radio h-4 w-4 text-rebay-blue"
                />
                <span>일반 판매</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="productType"
                  value="AUCTION"
                  checked={productType === "AUCTION"}
                  onChange={() => setProductType("AUCTION")}
                  disabled={isEdit}
                  className="form-radio h-4 w-4 text-rebay-blue"
                />
                <span>경매</span>
              </label>
            </div>
            {isEdit && (
              <p className="text-xs text-gray-500 mt-2">
                *상품 유형은 수정할 수 없습니다.
              </p>
            )}
          </section>

          {/* 제목 */}
          <section className="mb-6">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              제목
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full rounded-lg border border-rebay-gray-400 px-3 py-2 focus:ring-rebay-blue focus:border-rebay-blue"
              placeholder="상품 제목을 입력해주세요"
            />
          </section>

          {/* 카테고리 */}
          <section className="mb-6 flex gap-4">
            <div className="w-1/2">
              <label
                htmlFor="largeCategory"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                대분류
              </label>
              <select
                id="largeCategory"
                value={categoryLargeCode}
                onChange={(e) => {
                  setCategoryLargeCode(parseInt(e.target.value));
                  setCategoryCode("");
                }}
                required
                className="w-full rounded-lg border border-rebay-gray-400 px-3 py-2 bg-white focus:ring-rebay-blue focus:border-rebay-blue"
              >
                {Object.keys(CATEGORY_HIERARCHY).map((code) => (
                  <option key={code} value={code}>
                    {CATEGORY_HIERARCHY[code].name}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-1/2">
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                세부 카테고리
              </label>
              <select
                id="category"
                value={categoryCode}
                onChange={(e) => setCategoryCode(parseInt(e.target.value))}
                required
                className="w-full rounded-lg border border-rebay-gray-400 px-3 py-2 bg-white focus:ring-rebay-blue focus:border-rebay-blue"
                disabled={!categoryLargeCode}
              >
                <option value="" disabled>
                  카테고리 선택
                </option>
                {categoryOptions.map((option) => (
                  <option key={option.code} value={option.code}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>
          </section>

          {/* 가격 또는 경매 설정 */}
          <section className="mb-6 p-4 border rounded-xl bg-gray-50">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">
              {productType === "POST" ? "판매 가격" : "경매 설정"}
            </h3>

            {productType === "POST" ? (
              // 일반 판매 가격 입력
              <div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(parseInt(e.target.value) || 0)}
                    required
                    min="1"
                    className="flex-grow rounded-lg border border-rebay-gray-400 px-3 py-2 text-xl font-bold focus:ring-rebay-blue focus:border-rebay-blue"
                    placeholder="판매 가격 (원)"
                  />
                  <span className="text-xl font-bold">원</span>
                </div>
                {/* AI 가격 추천 섹션 */}
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={handleAiPriceRequest}
                    disabled={aiLoading}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rebay-blue/10 text-rebay-blue hover:bg-rebay-blue/20 transition disabled:opacity-50"
                  >
                    <FiCpu className="h-4 w-4" />
                    {aiLoading ? "AI 추천 가격 계산 중..." : "AI 가격 추천받기"}
                  </button>
                  {aiPrice !== null && (
                    <div className="mt-2 text-sm text-gray-600">
                      AI 추천 가격:{" "}
                      <span className="font-bold text-rebay-blue">
                        {priceFormat(aiPrice)}원
                      </span>{" "}
                      (참고용)
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // 경매 설정 입력
              <div className="space-y-4">
                {/* 시작 가격 */}
                <div className="flex items-center gap-3">
                  <label className="block text-sm font-medium text-gray-700 w-20">
                    시작 가격
                  </label>
                  <input
                    type="number"
                    value={startPrice}
                    onChange={(e) =>
                      setStartPrice(parseInt(e.target.value) || 0)
                    }
                    required
                    min="1"
                    className="flex-grow rounded-lg border border-rebay-gray-400 px-3 py-2 font-bold focus:ring-rebay-blue focus:border-rebay-blue"
                    placeholder="경매 시작 가격 (원)"
                  />
                  <span className="font-bold">원</span>
                </div>

                {/* 시작 시간 */}
                <div className="flex items-center gap-3">
                  <label className="block text-sm font-medium text-gray-700 w-20">
                    시작 시간
                  </label>
                  <input
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                    className="flex-grow rounded-lg border border-rebay-gray-400 px-3 py-2 bg-white focus:ring-rebay-blue focus:border-rebay-blue"
                  />
                </div>

                {/* 종료 시간 */}
                <div className="flex items-center gap-3">
                  <label className="block text-sm font-medium text-gray-700 w-20">
                    종료 시간
                  </label>
                  <input
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                    className="flex-grow rounded-lg border border-rebay-gray-400 px-3 py-2 bg-white focus:ring-rebay-blue focus:border-rebay-blue"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  *시작 시간은 현재 시각 이후여야 하며, 종료 시간은 시작
                  시간보다 최소 5분 이후여야 합니다.
                </p>
              </div>
            )}
          </section>

          {/* 내용 */}
          <section className="mb-6">
            <label
              htmlFor="content"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              상세 내용
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows="6"
              className="w-full rounded-lg border border-rebay-gray-400 px-3 py-2 focus:ring-rebay-blue focus:border-rebay-blue"
              placeholder="상품의 상태, 특징, 거래 조건 등을 상세히 작성해주세요."
            />
          </section>

          {/* 이미지 첨부 */}
          <section className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              이미지 첨부 (최대 5개)
            </label>
            <div className="flex flex-wrap gap-4">
              {/* 기존 이미지 미리보기 (수정 모드) */}
              {existingImages.map((url, index) => (
                <div
                  key={`existing-${index}`}
                  className="relative w-24 h-24 border rounded-lg overflow-hidden"
                >
                  <img
                    src={url}
                    alt={`기존 이미지 ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveExistingImage(index)}
                    className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                    aria-label="기존 이미지 삭제"
                  >
                    <FiX className="w-3 h-3" />
                  </button>
                  <span className="absolute bottom-0 left-0 text-xs text-white bg-black/50 px-1">
                    기존
                  </span>
                </div>
              ))}

              {/* 새 이미지 미리보기 */}
              {images.map((file, index) => (
                <div
                  key={`new-${index}`}
                  className="relative w-24 h-24 border rounded-lg overflow-hidden"
                >
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`새 이미지 ${index + 1}`}
                    className="w-full h-full object-cover"
                    onLoad={() => URL.revokeObjectURL(file)} // 메모리 해제
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                    aria-label="새 이미지 삭제"
                  >
                    <FiX className="w-3 h-3" />
                  </button>
                </div>
              ))}

              {/* 이미지 업로드 버튼 */}
              {images.length + existingImages.length < 5 && (
                <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50">
                  <FiImage className="w-6 h-6 text-gray-400" />
                  <span className="text-sm text-gray-500 mt-1">추가</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={images.length + existingImages.length >= 5}
                  />
                </label>
              )}
            </div>
            {uploading && (
              <p className="mt-2 text-sm text-blue-600">
                이미지 업로드 중... 잠시만 기다려주세요.
              </p>
            )}
          </section>

          {/* 해시태그 */}
          <section className="mb-8">
            <label
              htmlFor="hashtags"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              해시태그 (띄어쓰기로 구분)
            </label>
            <input
              type="text"
              id="hashtags"
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
              className="cursor-pointer px-4 py-2 rounded-lg border border-rebay-gray-400 hover:bg-gray-50 disabled:opacity-50 transition"
            >
              취소
            </button>

            <button
              type="submit"
              disabled={submitting || uploading}
              className="cursor-pointer px-5 py-2 rounded-lg bg-rebay-blue text-white hover:opacity-90 disabled:opacity-50 transition"
            >
              {isEdit
                ? submitting || uploading
                  ? "수정 중..."
                  : "수정하기"
                : submitting || uploading
                ? "등록 중..."
                : "등록하기"}
            </button>
          </section>

          {error && <p className="mt-4 text-red-500 text-center">{error}</p>}
        </form>
      </div>
      <Footer />
    </MainLayout>
  );
};

export default ProductCreate;
