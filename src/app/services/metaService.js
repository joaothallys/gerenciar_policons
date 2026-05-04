import api from "./api";

export const metaService = {
  // Fetch all meta pages in parallel
  getAllPages: async () => {
    try {
      const first = await api.get("/meta?page=1");
      const totalPages = first.data.total_pages || 1;

      if (totalPages === 1) {
        return first.data.metas || first.data.data || [];
      }

      // Fetch remaining pages in parallel
      const pageNumbers = Array.from({ length: totalPages - 1 }, (_, i) => i + 2);
      const results = await Promise.all(
        pageNumbers.map((pageNum) => api.get(`/meta?page=${pageNum}`))
      );

      // Combine all results
      const firstData = first.data.metas || first.data.data || [];
      const otherData = results.flatMap((r) => r.data.metas || r.data.data || []);

      return [...firstData, ...otherData];
    } catch (error) {
      console.error("Error fetching all meta pages:", error);
      throw error;
    }
  },

  // Create new meta
  create: async (data) => {
    try {
      const response = await api.post("/meta", data);
      return response.data;
    } catch (error) {
      console.error("Error creating meta:", error);
      throw error;
    }
  },

  // Update existing meta
  update: async (id, data) => {
    try {
      const response = await api.put(`/meta/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("Error updating meta:", error);
      throw error;
    }
  },

  // Delete meta
  remove: async (id) => {
    try {
      const response = await api.delete(`/meta/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting meta:", error);
      throw error;
    }
  },
};
