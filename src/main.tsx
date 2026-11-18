import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* BrowserRouter habilita a navegação por endereços. */}
    <BrowserRouter>
      {/* AuthProvider fica DENTRO do router, pois usaremos navegação. */}
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);