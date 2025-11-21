import api from "./api";

const searchService = {
  async searchPosts({ keyword, target, page = 0 }) {
    const response = await api.get("/api/search/posts", {
      params: { keyword, target, page },
    });
    return response.data;
  },

  async fetchSuggests({ keyword, target }) {
    const response = await api.get("/api/search/suggest", {
      params: { keyword, target, size: 10 },
    });
    return response.data.content;
  },
};

export default searchService;
