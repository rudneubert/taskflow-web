import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
  const { isAuthenticated } = useAuth();

  // Sem login: redireciona para /login.
  // "replace" substitui a entrada no histórico, para o botão
  // "voltar" do navegador não trazer o usuário de volta aqui.
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Com login: Outlet renderiza a página filha da rota.
  return <Outlet />;
}