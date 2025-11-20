import { useCallback, useState } from "react";
import useUserStore from "../../store/userStore";
import { FiX } from "react-icons/fi";
import Input from "../ui/Input";
import { useNavigate } from "react-router-dom";

const FindPassword = ({ OnClose }) => {
  const navigate = useNavigate();
  const { findPassword, resetPassword, loading, error } = useUserStore();
  const [loginIdForm, setLoginIdForm] = useState({ emailOrUsername: "" });
  const [actualFullName, setActualFullName] = useState(null);
  const [loginData, setLoginData] = useState(null);
  const [authForm, setAuthForm] = useState({
    enteredFullName: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isIdSubmitted, setIsIdSubmitted] = useState(false);
  const [isVerified, setIsVerified] = useState(false); // fullName 인증 성공 여부

  const isEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const handleIdSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      const data = isEmail(loginIdForm.emailOrUsername)
        ? { email: loginIdForm.emailOrUsername }
        : { username: loginIdForm.emailOrUsername };

      try {
        const nameFromBackend = await findPassword(data);

        setActualFullName(nameFromBackend);
        setLoginData(data);
        setIsIdSubmitted(true); // 2단계 UI로 전환
        // 이전 단계의 입력값 초기화
        setAuthForm((prev) => ({ ...prev, enteredFullName: "" }));
      } catch (err) {
        console.error(err);
        setActualFullName(null);
        setIsIdSubmitted(false);
      }
    },
    [loginIdForm.emailOrUsername, findPassword]
  );

  const handleVerification = useCallback(
    (e) => {
      e.preventDefault();

      if (authForm.enteredFullName === actualFullName) {
        setIsVerified(true);

        setAuthForm((prev) => ({
          ...prev,
          newPassword: "",
          confirmPassword: "",
        }));
      } else {
        setIsVerified(false);
      }
    },
    [authForm.enteredFullName, actualFullName]
  );

  const handleResetPassword = useCallback(
    async (e) => {
      e.preventDefault();

      const { newPassword, confirmPassword } = authForm;

      if (newPassword !== confirmPassword) {
        return;
      }

      if (newPassword.length < 6) {
        return;
      }

      const dataToSend = {
        ...loginData,
        password: newPassword,
      };

      try {
        await resetPassword(dataToSend);
        alert("비밀번호가 성공적으로 변경되었습니다.");
        OnClose();
      } catch (err) {
        console.error(err);
      }
    },
    [authForm.newPassword, authForm.confirmPassword, loginData, resetPassword]
  );

  const handleIdChange = (e) => {
    setLoginIdForm({
      ...loginIdForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleAuthChange = (e) => {
    setAuthForm({
      ...authForm,
      [e.target.name]: e.target.value,
    });
  };

  const maskFullName = (name) => {
    try {
      if (!name || name.length >= 2) {
        const firstChar = name.slice(0, 1);
        const lastChar = name.slice(-1);
        const maskedLength = name.length - 2;
        const middleMask = "*".repeat(maskedLength);

        return firstChar + middleMask + lastChar;
      }
    } catch (err) {
      console.error(err);
    }
  };

  const maskedName = actualFullName ? maskFullName(actualFullName) : null;

  return (
    <div>
      <div className="font-presentation w-[350px]">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl transition-all duration-300 border border-gray-100">
          <div className="flex justify-end pt-4 pr-4">
            <FiX
              onClick={OnClose}
              className="cursor-pointer text-gray-500 hover:text-gray-800 transition"
              size={20}
            />
          </div>

          <div className="px-10 py-6">
            <h2 className="text-xl font-extrabold text-gray-800 mb-6 text-center">
              {!isIdSubmitted
                ? "로그인 ID를 입력해주세요."
                : isVerified
                ? "새 비밀번호를 설정해주세요."
                : "본인 확인을 위해 전체 이름을 입력해주세요."}
            </h2>

            <form
              className="flex flex-col gap-[15px]"
              onSubmit={
                !isIdSubmitted
                  ? handleIdSubmit
                  : isVerified
                  ? handleResetPassword
                  : handleVerification
              }
            >
              {/* ID 입력 폼 */}
              {!isIdSubmitted && (
                <Input
                  type="text"
                  name="emailOrUsername"
                  placeholder="Email address or Username"
                  value={loginIdForm.emailOrUsername}
                  onChange={handleIdChange}
                  required
                />
              )}

              {/* fullName 인증 폼 */}
              {isIdSubmitted && !isVerified && (
                <>
                  <div className="flex items-center justify-between text-sm font-semibold p-2 bg-gray-100 rounded-lg">
                    <label className="text-gray-500">확인 이름:</label>
                    <label className="text-lg font-mono text-rebay-blue">
                      {maskedName}
                    </label>
                  </div>
                  <Input
                    type="text"
                    name="enteredFullName"
                    placeholder="마스킹 처리 전 전체 이름 입력"
                    value={authForm.enteredFullName}
                    onChange={handleAuthChange}
                    required
                  />
                </>
              )}

              {/* 비밀번호 재설정 폼 */}
              {isVerified && (
                <>
                  <Input
                    type="password"
                    name="newPassword"
                    placeholder="새 비밀번호 (최소 6자)"
                    value={authForm.newPassword}
                    onChange={handleAuthChange}
                    required
                  />
                  <Input
                    type="password"
                    name="confirmPassword"
                    placeholder="새 비밀번호 확인"
                    value={authForm.confirmPassword}
                    onChange={handleAuthChange}
                    required
                  />
                </>
              )}

              <button
                className="cursor-pointer mt-4 bg-rebay-blue hover:opacity-90 w-full h-[45px] rounded-xl text-white font-bold transition duration-150 shadow-lg disabled:bg-gray-400 disabled:shadow-none"
                type="submit"
                disabled={
                  loading ||
                  (!isVerified && isIdSubmitted && !authForm.enteredFullName)
                }
              >
                {loading
                  ? isVerified
                    ? "재설정 중..."
                    : "확인 중..."
                  : !isIdSubmitted
                  ? "확인"
                  : isVerified
                  ? "비밀번호 재설정"
                  : "본인 인증"}
              </button>
            </form>

            {error && <p className={`text-sm mt-3 text-center `}>{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FindPassword;
