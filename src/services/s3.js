import api from "./api";

const s3Service = {
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post("/api/upload/post", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  getImage: async (imageUrl) => {
    const response = await api.get(`/api/upload/post/image?url=${imageUrl}`);
    return response.data;
  },
};

export default s3Service;
