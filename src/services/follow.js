import api from "./api";

const followService = {
  getFollowers: async (userId, page, size) => {
    const response = await api.get(`/api/users/${userId}/followers`, {
      params: { page, size },
    });
    return response.data.content;
  },

  getFollowing: async (userId, page, size) => {
    const response = await api.get(`/api/users/${userId}/following`, {
      params: { page, size },
    });
    return response.data.content;
  },

  toggleFollow: async (userId) => {
    const response = await api.post(`/api/users/${userId}/follow`);
    return response.data;
  },
};

export default followService;
