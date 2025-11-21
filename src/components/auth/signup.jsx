import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import Input from "../ui/Input";
import { FiX } from "react-icons/fi";
import useAuthStore from "../../store/authStore";

const Signup = ({ onClose, onOpenLogin }) => {
  const navigate = useNavigate();

  const { register, loading, error } = useAuthStore();

  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    username: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(formData);
      navigate("/");
      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const isFormValid =
    formData.email &&
    formData.fullName &&
    formData.username &&
    formData.password;

  const handleSocialLogin = (provider) => {
    window.location.href = `${
      import.meta.env.VITE_API_URL
    }/oauth2/authorization/${provider}`;
  };

  return (
    <div className="w-[350px]">
      <div>
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl ">
          <div className="flex justify-end pt-4 pr-4">
            <FiX onClick={onClose} className="cursor-pointer" />
          </div>
          <div className="px-12 py-5">
            <h1 className="flex items-center justify-center">
              <img
                src="/image-Photoroom.png"
                alt="ReBay"
                className="w-25 mb-4"
              />
            </h1>
            <p className="font-presentation text-center text-gray-600 font-medium mb-10">
              ReBay로 지금 중고거래 시작하기
            </p>

            <div className="font-presentation flex flex-col justify-center items-center gap-[15px] mb-4">
              <button
                onClick={() => handleSocialLogin("google")}
                className="cursor-pointer border-1 border-gray-200 w-full h-[40px] rounded-lg text-sm font-bold  flex items-center justify-center gap-[10px]"
              >
                <FcGoogle />
                Continue with Google
              </button>

              <button
                onClick={() => handleSocialLogin("github")}
                className="cursor-pointer border-1 border-gray-200 w-full h-[40px] rounded-lg text-sm font-bold flex items-center justify-center gap-[10px]"
              >
                <FaGithub />
                Continue with Github
              </button>
            </div>

            <div className="flex items-center justify-center mb-4">
              <div className="divider"></div>
              <span className="font-presentation px-4 text-sm">OR</span>
              <div className="divider"></div>
            </div>

            <form className="font-presentation text-xs" onSubmit={handleSubmit}>
              <div className="flex flex-col justify-center items-center gap-[10px]">
                <Input
                  type="email"
                  name="email"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />

                <Input
                  name="fullName"
                  placeholder="Full Name"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />

                <Input
                  name="username"
                  placeholder="Username"
                  value={formData.username}
                  minlength="2"
                  onChange={handleChange}
                  required
                />

                <Input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  minlength="6"
                  onChange={handleChange}
                  required
                />
              </div>

              <button
                className="cursor-pointer w-full h-[50px] rounded-xl bg-rebay-blue text-sm mt-7 text-white font-bold"
                type="submit"
                disabled={loading || !isFormValid}
              >
                {loading ? "Signing up..." : "Sign up"}
              </button>
            </form>

            {error && <p className="text-error">{error}</p>}

            <div className="m-5 text-center text-sm">
              <p className="text-gray-600">
                Have an account?
                <button
                  onClick={onOpenLogin}
                  className="cursor-pointer bg-gradient-to-r from-blue-600 to-sky-600 bg-clip-text text-transparent font-semibold hover:from-blue-700 hover:to-sky-700 transition-all "
                >
                  Log in
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
