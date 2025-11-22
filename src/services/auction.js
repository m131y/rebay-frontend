import api from "./api";

const auctionService = {
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
};

export default auctionService;
