import { FiX } from "react-icons/fi";
import Avatar from "../ui/Avatar";
import Input from "../ui/Input";

const FileUpload = ({ onClose }) => {
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
                //   onSubmit={handleSubmit}
              >
                <Avatar />
                <button
                  className="cursor-pointer mt-4 bg-rebay-blue w-full h-[40px] rounded-xl text-white font-bold"
                  type="submit"
                  //   disabled={
                  //     loading ||
                  //     !passwordData.currentPassword ||
                  //     !passwordData.confirmPassword
                  //   }
                >
                  {/* {loading ? "저장 중..." : "저장"} */}
                  저장
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
