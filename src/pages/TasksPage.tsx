import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function TasksPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <main style={{ maxWidth: 600, margin: "4rem auto", padding: "0 1rem" }}>
      <h1>Minhas tarefas</h1>
      <p>Você está logado. A lista de tarefas vem na próxima etapa.</p>
      <button onClick={handleLogout}>Sair</button>
    </main>
  );
}