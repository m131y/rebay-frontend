import api from "./api";

const likeService = {
  toggleLike: async (postId) => {
    const res = await api.post(`/api/posts/${postId}/like`);
    return res.data;
  },
};

export default likeService;
