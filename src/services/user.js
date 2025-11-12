import api from "./api";

const userService = {
  async getUserProfile(userId) {
    const response = await api.get(`/api/user/${userId}`);
    return response.data;
  },

  async updateProfile(userData) {
    const response = await api.put(`/api/user/me`, userData);
    return response.data;
  },

  async updatePassword(passwordData) {
    await api.put(`/api/user/me/password`, passwordData);
  },
};
export default userService;
