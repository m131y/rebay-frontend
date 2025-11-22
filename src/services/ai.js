import api from "./api";

const aiService = {
  analyzeImage: async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post("/api/ai/analyze", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};

export default aiService;
