import React, { useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const images = [
  "/banner/banner1.png",
  "/banner/banner2.png",
  "/banner/banner3.png",
];

function ImageSlider() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);

    return () => clearInterval(intervalId);
  }, [images.length]);

  const goToPrev = () => {
    setCurrentImageIndex(
      (prevIndex) => (prevIndex - 1 + images.length) % images.length
    );
  };

  const goToNext = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  return (
    <div className="w-full relative">
      <div
        className="
          w-full h-[300px] rounded-[7.2px] 
          overflow-hidden  
          relative         
      "
      >
        <div
          className="
            flex h-full 
            transition-transform duration-500 ease-in-out /* 슬라이드 애니메이션 */
          "
          style={{
            transform: `translateX(-${currentImageIndex * 100}%)`,
          }}
        >
          {images.map((image, index) => (
            <div
              key={index}
              className="
                min-w-full h-full 
                flex justify-center items-center 
                bg-cover bg-center /* 배경 이미지 설정 */
              "
              style={{
                backgroundImage: `url('${image}')`,
              }}
            ></div>
          ))}
        </div>
      </div>

      <button
        onClick={goToPrev}
        className="
        cursor-pointer
          absolute top-1/2 left-4 -translate-y-1/2 
          text-white p-2 text-xl /* text-xl로 아이콘 크기 조정 */
          focus:outline-none hover:bg-opacity-75 transition z-10 /* z-10 추가하여 다른 요소 위에 보이도록 */
        "
      >
        <FaChevronLeft />
      </button>
      <button
        onClick={goToNext}
        className="
        cursor-pointer
          absolute top-1/2 right-4 -translate-y-1/2 
           text-white p-2 text-xl
          focus:outline-none hover:bg-opacity-75 transition z-10
        "
      >
        <FaChevronRight />
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImageIndex(index)}
            className={`
                cursor-pointer
              w-3 h-3 rounded-full 
              ${index === currentImageIndex ? "bg-white" : "bg-gray-400"}
              hover:bg-white transition-colors
            `}
          ></button>
        ))}
      </div>
    </div>
  );
}

export default ImageSlider;
