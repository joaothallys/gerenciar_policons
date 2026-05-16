import axios from "axios";

const NOTIFICATION_API_HOST = "https://policoins-notifications.up.railway.app";
const MAIN_API_HOST = import.meta.env.VITE_REACT_APP_API_HOST || "http://localhost:5000";

const notificationApi = axios.create({
  baseURL: NOTIFICATION_API_HOST,
});

export const notificationService = {
  // List all users with active tokens combined with active users from main API
  getAllUsersWithTokens: async () => {
    try {
      // Buscar usuários com tokens
      const tokensResponse = await notificationApi.get("/notifications/users/list/all");
      const usersWithTokens = tokensResponse.data.data;
      const token = localStorage.getItem("accessToken");

      // Enriquecer com dados de login-logs para cada usuário
      const enrichedUsers = await Promise.all(
        usersWithTokens.users.map(async (user) => {
          try {
            const loginLogsResponse = await axios.get(
              `${MAIN_API_HOST}/login-logs/last/${user._id}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  accept: "application/json",
                },
              }
            );
            const userData = loginLogsResponse.data.user;
            return {
              ...user,
              username: userData?.username || `Usuário ${user._id}`,
              email: userData?.email || "-",
            };
          } catch (error) {
            console.error(`Error fetching user info for ${user._id}:`, error);
            return {
              ...user,
              username: `Usuário ${user._id}`,
              email: "-",
            };
          }
        })
      );

      return {
        ...usersWithTokens,
        users: enrichedUsers,
      };
    } catch (error) {
      console.error("Error fetching users with tokens:", error);
      throw error;
    }
  },

  // Send notification to specific user
  sendToUser: async (userId, title, message, metadata = {}) => {
    try {
      const response = await notificationApi.post("/notifications/send", {
        title,
        message,
        type: "user",
        userId: String(userId),
        metadata,
      });
      return response.data.data;
    } catch (error) {
      console.error("Error sending notification to user:", error);
      throw error;
    }
  },

  // Send broadcast notification to all users
  sendBroadcast: async (title, message, metadata = {}) => {
    try {
      const response = await notificationApi.post("/notifications/send", {
        title,
        message,
        type: "broadcast",
        metadata,
      });
      return response.data.data;
    } catch (error) {
      console.error("Error sending broadcast notification:", error);
      throw error;
    }
  },

  // Get user info from login-logs
  getUserInfo: async (userId, token) => {
    try {
      const response = await axios.get(
        `${MAIN_API_HOST}/login-logs/last/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            accept: "application/json",
          },
        }
      );
      return response.data.user;
    } catch (error) {
      console.error("Error fetching user info:", error);
      throw error;
    }
  },
};
