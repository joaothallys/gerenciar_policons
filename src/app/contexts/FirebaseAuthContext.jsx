import React, { createContext, useReducer, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import authService from "__api__/db/auth";

const AuthContext = createContext();

const initialState = {
  isAuthenticated: false,
  isInitialized: false,
  user: null,
  role: null,
};

const reducer = (state, action) => {
  switch (action.type) {
    case "INITIALIZE":
      return {
        ...state,
        isAuthenticated: action.payload.isAuthenticated,
        isInitialized: true,
        user: action.payload.user,
        role: action.payload.role,
      };
    case "LOGIN":
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        role: action.payload.role,
      };
    case "LOGOUT":
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        role: null,
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const navigate = useNavigate();

  // Inicializa o estado de autenticação
  useEffect(() => {
    const initialize = () => {
      const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";

      console.log("Inicializando autenticação. Estado armazenado:", isAuthenticated);

      if (isAuthenticated) {
        dispatch({
          type: "INITIALIZE",
          payload: {
            isAuthenticated: true,
            user: null,
            role: null,
          },
        });
      } else {
        dispatch({ type: "INITIALIZE", payload: { isAuthenticated: false } });
      }
    };

    initialize();
  }, []);

  const login = async (email, password) => {
    try {
      console.log("Tentando login...");
      const response = await authService.login(email, password);

      if (response.authorized) {
        // Salvar estado no localStorage
        localStorage.setItem("isAuthenticated", "true");

        dispatch({
          type: "LOGIN",
          payload: { user: null, role: null },
        });

        navigate("/dashboard/default");
      } else {
        // Caso o login falhe
        throw new Error(response.message || "Erro ao fazer login.");
      }
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      throw error; // Propaga o erro para a interface
    }
  };

  const logout = async () => {
    try {
      console.log("Fazendo logout...");

      // Remover estado do localStorage
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("accessToken");

      dispatch({ type: "LOGOUT" });
      navigate("/session/signin");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {state.isInitialized ? children : <div>Carregando...</div>}
    </AuthContext.Provider>
  );
};

export default AuthContext;