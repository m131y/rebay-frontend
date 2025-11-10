import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import Input from "../ui/Input";
import { FiX } from "react-icons/fi";
import useAuthStore from "../../store/authStore";

const Login = ({ onClose, onOpenSignup }) => {
  const navigate = useNavigate();

  const { login, loading, error } = useAuthStore();

  const [formData, setFormData] = useState({
    emailOrUsername: "",
    password: "",
  });

  const isEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const loginData = isEmail(formData.emailOrUsername)
        ? { email: formData.emailOrUsername, password: formData.password }
        : { username: formData.emailOrUsername, password: formData.password };

      await login(loginData);
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

  const handleSocialLogin = (provider) => {
    window.location.href = `${
      import.meta.env.VITE_API_URL
    }/oauth2/authorization/${provider}`;
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
              <h1 className="flex items-center justify-center">
                <img
                  src="/image-Photoroom.png"
                  alt="ReBay"
                  className="w-25 mb-8"
                />
              </h1>

              <form
                className="font-presentation flex flex-col gap-[15px]"
                onSubmit={handleSubmit}
              >
                <Input
                  type="text"
                  name="emailOrUsername"
                  placeholder="Email address or Username"
                  value={formData.emailOrUsername}
                  onChange={handleChange}
                  required
                />

                <Input
                  type="password"
                  name="password"
                  placeholder="Password"
                  minlength="6"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />

                <button
                  className="cursor-pointer mt-4 bg-rebay-blue w-full h-[40px] rounded-xl text-white font-bold"
                  type="submit"
                  disabled={
                    loading || !formData.emailOrUsername || !formData.password
                  }
                >
                  {loading ? "Logging in..." : "Log in"}
                </button>
              </form>

              {error && <p className="text-error">{error}</p>}

              <div className="flex items-center justify-center my-4">
                <div className="divider"></div>
                <span className="font-presentation px-4 text-sm font-medium">
                  OR
                </span>
                <div className="divider"></div>
              </div>

              <div className="font-presentation flex flex-col justify-center items-center gap-[15px] mb-4">
                <button
                  onClick={() => handleSocialLogin("google")}
                  className="cursor-pointer border-1 border-gray-200 w-full h-[50px] rounded-lg text-sm font-bold  flex items-center justify-center gap-[10px]"
                >
                  <FcGoogle />
                  Continue with Google
                </button>

                <button
                  onClick={() => handleSocialLogin("github")}
                  className="cursor-pointer border-1 border-gray-200 w-full h-[50px] rounded-lg text-sm font-bold flex items-center justify-center gap-[10px]"
                >
                  <FaGithub />
                  Continue with Github
                </button>
              </div>

              <Link
                to="/forgot-password"
                className="block text-center text-sm text-gray-600 hover:text-blue-500 transition-colors mt-8"
              >
                Forgot password?
              </Link>

              <div className="text-center mt-5 text-sm">
                <p className="text-gray-600 flex flex-col">
                  Don't have an account?
                  <button
                    onClick={onOpenSignup}
                    className="mt-1 mb-2 cursor-pointer bg-rebay-blue bg-clip-text text-transparent font-semibold hover:from-blue-700 hover:to-sky-700 transition-all "
                  >
                    Sign up
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
