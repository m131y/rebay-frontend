import api from "./api";

const likeService = {
  toggleLike: async (postId) => {
    const response = await api.post(`/api/posts/${postId}/like`);
    console.log("togglePost", response.data);
    return response.data;
  },

  getPostLikeCount: async (postId) => {
    const response = await api.get(`/api/posts/${postId}/like`);
    return response.data;
  },

  isLikedPostByCurrentUser: async (postId) => {
    const response = await api.get(`/api/posts/${postId}/likeCount`);
    return response.data;
  },

  toggleAuctionLike: async (auctionId) => {
    const response = await api.post(`/api/auction/${auctionId}/like`);
    console.log("toggleAuction", response.data);
    return response.data;
  },
  getAuctionLikeCount: async (auctionId) => {
    const response = await api.get(`/api/auction/${auctionId}/like`);
    return response.data;
  },
  isLikedAuctionByCurrentUser: async (auctionId) => {
    const response = await api.get(`/api/auction/${auctionId}/likeCount`);
    return response.data;
  },
};

export default likeService;
