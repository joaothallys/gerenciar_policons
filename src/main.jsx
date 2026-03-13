import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
// ROOT APP COMPONENT
import App from "./app/App";
// THIRD PARTY CSS
import "perfect-scrollbar/css/perfect-scrollbar.css";
import "react-toastify/dist/ReactToastify.css";

const root = createRoot(document.getElementById("root"));

root.render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <ToastContainer
        newestOnTop
        closeButton
        limit={4}
        hideProgressBar={false}
      />
    </BrowserRouter>
  </StrictMode>
);
