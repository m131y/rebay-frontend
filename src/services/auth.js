import api from "./api";

export const authService = {
  async register(userData) {
    const response = await api.post(`/api/auth/register`, userData);
    const { access_token, refresh_token, user } = response.data;

    localStorage.setItem("accessToken", access_token);
    localStorage.setItem("refreshToken", refresh_token);
    localStorage.setItem("user", JSON.stringify(user));

    return response.data;
  },

  async login(userData) {
    try {
      const response = await api.post(`/api/auth/login`, userData);
      const { access_token, refresh_token, user } = response.data;

      if (access_token) {
        localStorage.setItem("accessToken", access_token);
        localStorage.setItem("refreshToken", refresh_token);
        localStorage.setItem("user", JSON.stringify(user));
      } else {
        throw new Error("로그인에 실패했습니다: 토큰을 받지 못했습니다.");
      }
      return response.data;
    } catch (err) {
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  },

  getCurrentUser() {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated() {
    return !!localStorage.getItem("accessToken");
  },
};
