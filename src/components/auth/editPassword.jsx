import { FiX } from "react-icons/fi";
import useUserStore from "../../store/userStore";
import { useState } from "react";
import Input from "../ui/Input";

const EditPassword = ({ onClose }) => {
  const { updatePassword, loading, error } = useUserStore();

  const [clientError, setClientError] = useState(null);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const isPasswordMatch =
    passwordData.newPassword === passwordData.confirmPassword;
  const isNewPasswordDifferent =
    passwordData.newPassword !== passwordData.currentPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setClientError(null); // 클라이언트 에러 초기화

    if (!isPasswordMatch) {
      setClientError("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setClientError("새 비밀번호는 최소 8자 이상이어야 합니다.");
      return;
    }

    if (!isNewPasswordDifferent) {
      setClientError("새 비밀번호는 현재 비밀번호와 달라야 합니다.");
      return;
    }

    const dataToSend = {
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    };

    try {
      await updatePassword(dataToSend);
      onClose();
      alert("비밀번호가 성공적으로 변경되었습니다.");
    } catch (err) {}
  };

  const handleChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
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
                <Input
                  type="password"
                  name="currentPassword"
                  placeholder="현재 비밀번호를 입력해주세요"
                  value={passwordData.currentPassword}
                  minlength="6"
                  onChange={handleChange}
                  required
                />

                <Input
                  type="password"
                  name="newPassword"
                  placeholder="새 비밀번호를 입력해주세요"
                  value={passwordData.newPassword}
                  minlength="6"
                  onChange={handleChange}
                  required
                />

                <Input
                  type="password"
                  name="confirmPassword"
                  placeholder="새 비밀번호를 한번 더 입력해주세요"
                  value={passwordData.confirmPassword}
                  minlength="6"
                  onChange={handleChange}
                  required
                />

                <button
                  className="cursor-pointer mt-4 bg-rebay-blue w-full h-[40px] rounded-xl text-white font-bold"
                  type="submit"
                  disabled={
                    loading ||
                    !passwordData.currentPassword ||
                    !passwordData.confirmPassword
                  }
                >
                  {loading ? "저장 중..." : "저장"}
                </button>
              </form>

              {error && <p className="text-error">{error}</p>}
              {clientError && <p className="text-error">{clientError}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditPassword;
