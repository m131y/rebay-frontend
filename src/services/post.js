import api from "./api";

const postService = {
  createPost: async (postData) => {
    const response = await api.post("/api/posts", postData);
    return response.data;
  },

  getAllPosts: async (page, size) => {
    const response = await api.get("/api/posts", { params: { page, size } });
    return response.data.content;
  },

  getUserPosts: async (userId) => {
    const response = await api.get(`/api/posts/user/${userId}`);
    return response.data;
  },

  getUserPostCount: async (userId) => {
    const response = await api.get(`/api/posts/user/${userId}/count`);
    return response.data.count;
  },

  getPost: async (postId) => {
    const res = await api.get(`/api/posts/${postId}`); // 서버에서 view +1
    return res.data;
  },

  updatePost: async (postId, postData) => {
    const response = await api.put(`/api/posts/${postId}`, postData);
    return response.data;
  },

  deletePost: async (postId) => {
    await api.delete(`/api/posts/${postId}`);
  },

  toggleLike: async (postId) => {
    const response = await api.post(`/api/posts/${postId}/like`);
    return response.data;
  },

  createAuction: async (auctionData) => {
    const response = await api.post("/api/auction", auctionData);
    return response.data;
  },

  getAuction: async (auctionId) => {
    const response = await api.get(`/api/auction/${auctionId}`); // 서버에서 view +1
    return response.data;
  },

  getAllAuctions: async (page, size) => {
    const response = await api.get("/api/auction", { params: { page, size } });
    return response.data.content;
  },

  getUserAuctions: async (page, size, userId) => {
    const response = await api.get(`/api/auction/user/${userId}`, {
      params: { page, size },
    });
    return response.data.content;
  },

  updateAuction: async (auctionId, auctionData) => {
    const response = await api.put(`/api/auction/${auctionId}`, auctionData);
    return response.data;
  },

  deleteAuction: async (auctionId) => {
    await api.delete(`/api/auction/${auctionId}`);
  },

  toggleAuctionLike: async (auctionId) => {
    const response = await api.post(`/api/auction/${auctionId}/like`);
    return response.data;
  },

  // 입찰하기 함수
  placeBid: async (auctionId, amount) => {
    const response = await api.post(`/api/auction/${auctionId}/bid`, { amount });
    return response.data;
  },

  getAllProducts: async (params) => {
    const response = await api.get("/api/products", { params: params });
    return response.data;
  },

  getUserProducts: async (userId) => {
    const response = await api.get(`/api/products/${userId}`);
    return response.data;
  },
};

export default postService;
