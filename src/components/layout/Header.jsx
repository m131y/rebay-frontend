import { useState } from "react";
import { FaBars, FaSearch } from "react-icons/fa";
import { Link } from "react-router-dom";
import Login from "../auth/login";
import Signup from "../auth/signup";
import useAuthStore from "../../store/authStore";

const Header = () => {
  const { user, logout, loading, error } = useAuthStore();

  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  const handleOpenSignup = () => {
    setShowLogin(false);
    setShowSignup(true);
  };

  const handleOpenLogin = () => {
    setShowLogin(true);
    setShowSignup(false);
  };

  const handleLogout = () => {
    logout();
    window.location.reload();
  };

  return (
    <div>
      <header className="w-full max-w-full mx-auto h-[110px] bg-white flex items-center justify-between px-[30px] sticky top-0 z-10 border-b border-gray-200 shadow-sm">
        <div className="flex space-x-15">
          <Link to="/">
            <img src="/image-Photoroom.png" alt="ReBay" className="w-30" />
          </Link>

          <form className="flex items-center">
            <div className="flex items-center bg-rebay-search w-[400px] h-[40px] px-[20px] rounded-full">
              <FaBars className="mr-[10px] text-rebay-gray-300" />
              <input
                type="search"
                name="q"
                placeholder="검색어를 입력하세요"
                className="font-presentation w-[300px] "
              />
              <FaSearch className="ml-[10px] text-rebay-gray-300" />
            </div>
          </form>
        </div>
        {user ? (
          <nav className="items flex space-x-9 items-center">
            <Link
              to="/sell"
              className="font-presentation text-black text-[15px] font-medium cursor-pointer hover:text-gray-600"
            >
              판매하기
            </Link>
            <Link
              to="/products"
              className="font-presentation text-black text-[15px] font-medium cursor-pointer hover:text-gray-600"
            >
              상품보기
            </Link>
            <Link
              to={`/user/${user.id}`}
              className="font-presentation text-black text-[15px] font-medium cursor-pointer hover:text-gray-600"
            >
              내 상점
            </Link>
            <div className="w-[1px] h-6 bg-gray-300"></div>
            <Link
              to="/"
              onClick={() => handleLogout()}
              className="cursor-pointer bg-rebay-green rounded-md py-[10.5px] px-[22px] flex items-center justify-center shadow-sm hover:opacity-90 transition"
            >
              <div className="font-presentation text-white text-[12px] font-medium">
                로그아웃
              </div>
            </Link>
          </nav>
        ) : (
          <nav className="items flex space-x-9 items-center">
            <button
              onClick={() => setShowLogin(true)}
              className="font-presentation text-black text-[15px] font-medium cursor-pointer hover:text-gray-600"
            >
              판매하기
            </button>
            <button
              onClick={() => setShowLogin(true)}
              className="font-presentation text-black text-[15px] font-medium cursor-pointer hover:text-gray-600"
            >
              상품보기
            </button>
            <div className="w-[1px] h-6 bg-gray-300"></div>
            <button
              onClick={() => setShowLogin(true)}
              className="cursor-pointer bg-rebay-blue rounded-md py-[10.5px] px-[22px] flex items-center justify-center shadow-sm hover:opacity-90 transition"
            >
              <div className="font-presentation text-white text-[12px] font-medium">
                로그인
              </div>
            </button>
          </nav>
        )}
      </header>

      {showLogin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Login
            onClose={() => setShowLogin(false)}
            onOpenSignup={handleOpenSignup}
          />
        </div>
      )}

      {showSignup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Signup
            onClose={() => setShowSignup(false)}
            onOpenLogin={handleOpenLogin}
          />
        </div>
      )}
    </div>
  );
};
export default Header;
