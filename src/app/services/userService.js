import api from "./api";

export const userService = {
  // Get all users (optional name filter)
  getAll: async (name = null) => {
    try {
      const params = {};
      if (name && name.trim()) {
        params.name = name.trim();
      }

      const response = await api.get("/users", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  },

  // Get all active users list
  getAllActive: async () => {
    try {
      const response = await api.get("/users/list/all");
      return response.data;
    } catch (error) {
      console.error("Error fetching active users:", error);
      throw error;
    }
  },

  // Create new user
  create: async (data) => {
    try {
      const response = await api.post("/users", data);
      return response.data;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  },

  // Update existing user
  update: async (id, data) => {
    try {
      const response = await api.put(`/users/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  },

  // Delete user
  remove: async (id) => {
    try {
      const response = await api.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  },

  // Change user password
  changePassword: async (id, password) => {
    try {
      const response = await api.put(`/users/${id}/password`, {
        password,
      });
      return response.data;
    } catch (error) {
      console.error("Error changing password:", error);
      throw error;
    }
  },
};
