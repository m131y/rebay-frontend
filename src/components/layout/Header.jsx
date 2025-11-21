import { useRef, useState, useEffect } from "react";
import { FaBars, FaSearch } from "react-icons/fa";
import { FiMessageCircle } from "react-icons/fi"; // 아이콘
import { Link, useNavigate } from "react-router-dom";
import Login from "../auth/login";
import Signup from "../auth/signup";
import useAuthStore from "../../store/authStore";
import useSearchStore from "../../store/searchStore";
import NotificationBell from "../notification/NotificationBell";
import FindPassword from "../auth/findPassword";

const Header = () => {
  const { user, logout } = useAuthStore();
  const { fetchSuggests, clearSuggests, suggests, searchPosts } =
    useSearchStore();
  const navigate = useNavigate();
  const suggestBoxRef = useRef(null);

  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showFindPassword, setShowFindPassword] = useState(false);

  const [keyword, setKeyword] = useState("");
  const [target, setTarget] = useState("TITLE");

  const handleOpenFindPassword = () => {
    setShowLogin(false);
    setShowFindPassword(true);
  };

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
    navigate("/");
    window.location.reload();
  };

  const handleSearch = (e) => {
    e?.preventDefault();
    if (!keyword.trim()) return;

    searchPosts({ keyword, target, page: 0 });

    navigate(`/search?keyword=${keyword}&target=${target}`);

    clearSuggests();
  };

  useEffect(() => {
    if (!keyword.trim()) {
      clearSuggests();
      return;
    }

    const delay = setTimeout(() => {
      fetchSuggests({ keyword, target });
    }, 300);

    return () => clearTimeout(delay);
  }, [keyword, target]);

  useEffect(() => {
    const handler = (e) => {
      if (suggestBoxRef.current && !suggestBoxRef.current.contains(e.target)) {
        clearSuggests();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div>
      <header className="w-full max-w-full mx-auto h-[110px] bg-white flex items-center justify-between px-[30px] sticky top-0 z-10 border-b border-gray-200 shadow-sm">
        <div className="flex space-x-15">
          <Link to="/">
            <img src="/image-Photoroom.png" alt="ReBay" className="w-30" />
          </Link>

          <form
            onSubmit={handleSearch}
            className="font-presentation flex items-center relative"
          >
            <div className="flex items-center bg-rebay-search w-[400px] h-[40px] px-[20px] rounded-full">
              <select
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="text-gray-600 text-sm mr-[10px] bg-transparent outline-none cursor-pointer"
              >
                <option value="TITLE">제목</option>
                <option value="USERNAME">작성자</option>
                <option value="HASHTAG">해시태그</option>
              </select>

              <input
                type="search"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="검색어를 입력하세요"
                className="font-presentation bg-transparent flex-1 outline-none"
              />

              <FaSearch
                className="ml-[10px] text-rebay-gray-300 cursor-pointer"
                onClick={handleSearch}
              />
            </div>

            {suggests.length > 0 && (
              <div
                ref={suggestBoxRef}
                className="absolute top-full left-0 mt-2 w-[400px] bg-white 
                shadow-md rounded-xl border border-gray-200 
                max-h-[250px] overflow-y-auto z-20"
              >
                {suggests.map((item, idx) => (
                  <div
                    key={idx}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                    onClick={() => {
                      setKeyword(item);
                      handleSearch();
                    }}
                  >
                    {item}
                  </div>
                ))}
              </div>
            )}
          </form>
        </div>

        {user ? (
          <nav className="items flex space-x-4 items-center">
            <NotificationBell />

            <Link
              to="/chat"
              className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FiMessageCircle size={24} className="text-gray-600" />
            </Link>

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
            onOpenFindPassword={handleOpenFindPassword}
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

      {showFindPassword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <FindPassword
            OnClose={() => setShowFindPassword(false)}
            onOpenFindPassword={handleOpenFindPassword}
          />
        </div>
      )}
    </div>
  );
};

export default Header;
