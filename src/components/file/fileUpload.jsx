import { FiImage, FiX } from "react-icons/fi";
import Avatar from "../ui/Avatar";
import { useRef, useState } from "react";
import s3Service from "../../services/s3";

const FileUpload = ({ user, onClose }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef(null);

  const removeImage = () => {
    setSelectedImage(null);
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];

    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    if (file.size > 5 * 1024 * 1024) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const size = Math.min(img.width, img.height);
        canvas.width = size;
        canvas.height = size;

        const ctx = canvas.getContext("2d");

        const x = (img.width - size) / 2;
        const y = (img.height - size) / 2;

        ctx.drawImage(img, x, y, size, size, 0, 0, size, size);

        canvas.toBlob(
          (blob) => {
            setSelectedImage(blob);
            setPreviewImage(canvas.toDataURL("image/jpeg"));
          },
          "image/jpeg",
          0.9
        );
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedImage || isUploading) return;

    setIsUploading(true);

    try {
      let imageUrl = null;

      // 1. S3에 이미지 업로드
      const response = await s3Service.uploadProfileImage(selectedImage);
      imageUrl = response.url;

      onClose(imageUrl);
    } catch (err) {
      console.error("Image upload failed:", err);

      onClose(null);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <div className="w-[350px]">
        <div className="">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl ">
            <div className="flex justify-end pt-4 pr-4">
              <FiX onClick={onClose} className="cursor-pointer" />
            </div>
            <div className="px-12 py-5">
              <form
                className="font-presentation flex flex-col gap-[15px]"
                onSubmit={handleSubmit}
              >
                <div className="relative w-full mx-auto">
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="w-full rounded-full object-cover"
                    />
                  ) : (
                    <div>
                      <div className="absolute size-[260px]"></div>
                      <Avatar user={user} />
                    </div>
                  )}
                  <button
                    type="button"
                    className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
                    onClick={removeImage}
                  >
                    <FiX size={20} />
                  </button>
                </div>

                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageSelect}
                  />
                  <button
                    type="button"
                    className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <FiImage size={20} />
                    <span>Add Photo</span>
                  </button>
                </div>
                <button
                  className="cursor-pointer mt-4 bg-rebay-blue hover:bg-blue-900 w-full h-[45px] rounded-xl text-white font-bold disabled:opacity-50 transition-colors shadow-lg"
                  type="submit"
                  disabled={!selectedImage || isUploading}
                >
                  {isUploading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent border-solid rounded-full animate-spin mr-2"></div>
                      <span>저장 중...</span>
                    </div>
                  ) : (
                    "저장"
                  )}
                </button>
              </form>

              {/* {error && <p className="text-error">{error}</p>} */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
