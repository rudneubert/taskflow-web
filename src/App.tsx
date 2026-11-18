import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import TasksPage from "./pages/TasksPage";

function App() {
  return (
    <Routes>
      {/* Rotas públicas */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Rotas protegidas: ficam dentro do ProtectedRoute. */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<TasksPage />} />
      </Route>

      {/* Qualquer endereço desconhecido volta para a raiz. */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;