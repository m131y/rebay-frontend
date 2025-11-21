import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import useAuthStore from "../store/authStore";

const OAuth2Callback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get("token");
    const refreshToken = searchParams.get("refreshToken");
    const error = searchParams.get("error");

    if (error) {
      // error 가 있으면 error 를 같이보내면서 로그인창 다시띄우기 ?
      //alert 창 띄우자
      navigate("/");
      return;
    }

    if (token && refreshToken) {
      localStorage.setItem("accessToken", token);
      localStorage.setItem("refreshToken", refreshToken);

      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const user = {
          id: payload.id,
          username: payload.username,
          email: payload.email,
          fullName: payload.fullName,
          profileImageUrl: payload.profileImageUrl || null,
          bio: payload.bio,
        };

        localStorage.setItem("user", JSON.stringify(user));

        setAuth({
          user,
          isAuthenticated: true,
          loading: false,
          error: null,
        });

        window.location.replace(`/`);
      } catch (error) {
        navigate("/");
      }
    } else {
      // 토큰이 누락되었을때 ?
      navigate("/");
    }
  }, []);

  return <div>logging .. </div>;
};
export default OAuth2Callback;
