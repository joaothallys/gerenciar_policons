import axios from "axios";

const API_URL = import.meta.env.VITE_REACT_APP_API_HOST || "http://localhost:5000";

const authService = {
  login: async (email, password) => {
    try {
      const instance = axios.create({
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      const params = new URLSearchParams();
      params.append("email", email);
      params.append("password", password);

      const loginResponse = await instance.post(`${API_URL}/login`, params);

      if (loginResponse.status === 200) {
        const { token } = loginResponse.data;

        // Armazena o token no localStorage
        localStorage.setItem("accessToken", token);

        // Configura o header de autorização para requisições futuras
        axios.defaults.headers.common.Authorization = `Bearer ${token}`;

        console.log("Login bem-sucedido.");
        return { authorized: true, message: "Login realizado com sucesso.", token };
      } else {
        throw new Error("Credenciais inválidas.");
      }
    } catch (error) {
      console.error("Erro no serviço de autenticação:", error);

      if (error.response?.data?.error) {
        return { authorized: false, message: error.response.data.error };
      }

      throw new Error(error.response?.data?.message || "Erro ao autenticar.");
    }
  },
};

export default authService;