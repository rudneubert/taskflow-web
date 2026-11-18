import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ApiError, tasksApi } from "../api/client";
import TaskForm from "../components/TaskForm";
import TaskItem from "../components/TaskItem";
import { useAuth } from "../context/AuthContext";
import type { Task } from "../types";

// Tipo para o filtro: só aceita estes três valores.
type Filter = "all" | "pending" | "done";

export default function TasksPage() {
  const { logout, handleAuthError } = useAuth();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Traduz qualquer erro em mensagem para a tela.
  // Se for 401, handleAuthError já deslogou e não mostramos nada.
  const showError = useCallback(
    (err: unknown) => {
      if (handleAuthError(err)) return;
      setError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível conectar ao servidor."
      );
    },
    [handleAuthError]
  );

  // Busca as tarefas sempre que o filtro muda.
  // O array [filter, showError] diz ao React: "rode este efeito de novo
  // quando algum destes valores mudar".
  useEffect(() => {
    // "cancelled" evita atualizar o estado se o usuário trocou o
    // filtro (ou saiu da página) antes da resposta chegar.
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        // Converte o filtro da tela no parâmetro da API.
        const completed =
          filter === "all" ? undefined : filter === "done";
        const data = await tasksApi.list(completed);
        if (!cancelled) setTasks(data);
      } catch (err) {
        if (!cancelled) showError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    // Função de limpeza: roda antes do próximo efeito ou ao sair.
    return () => {
      cancelled = true;
    };
  }, [filter, showError]);

  async function handleCreate(title: string, description: string) {
    setError("");
    try {
      const created = await tasksApi.create({
        title,
        description: description || null,
      });
      // Atualiza a lista sem nova requisição. Nunca alteramos o array
      // direto: criamos um novo ([...]), como o React exige.
      // Se o filtro for "concluídas", a nova tarefa (pendente) não
      // deve aparecer.
      if (filter !== "done") {
        setTasks((current) => [created, ...current]);
      }
    } catch (err) {
      showError(err);
      // Relança para o formulário saber que falhou e não limpar os campos.
      throw err;
    }
  }

  async function handleToggle(task: Task) {
    setError("");
    try {
      const updated = await tasksApi.update(task.id, {
        completed: !task.completed,
      });
      setTasks((current) => {
        // Se a tarefa não pertence mais ao filtro atual, sai da lista.
        const stillMatches =
          filter === "all" || (filter === "done") === updated.completed;
        return stillMatches
          ? current.map((t) => (t.id === updated.id ? updated : t))
          : current.filter((t) => t.id !== updated.id);
      });
    } catch (err) {
      showError(err);
    }
  }

  async function handleSave(id: number, title: string, description: string) {
    setError("");
    try {
      const updated = await tasksApi.update(id, {
        title,
        description: description || null,
      });
      setTasks((current) => current.map((t) => (t.id === id ? updated : t)));
    } catch (err) {
      showError(err);
      throw err;
    }
  }

  async function handleDelete(id: number) {
    // confirm() abre uma caixa nativa de confirmação.
    if (!window.confirm("Apagar esta tarefa?")) return;
    setError("");
    try {
      await tasksApi.remove(id);
      setTasks((current) => current.filter((t) => t.id !== id));
    } catch (err) {
      showError(err);
    }
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <main className="container">
      <header className="page-header">
        <h1>Minhas tarefas</h1>
        <button className="secondary" onClick={handleLogout}>
          Sair
        </button>
      </header>

      <TaskForm onCreate={handleCreate} />

      <div className="filter">
        <label htmlFor="filter">Mostrar</label>
        <select
          id="filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value as Filter)}
        >
          <option value="all">Todas</option>
          <option value="pending">Pendentes</option>
          <option value="done">Concluídas</option>
        </select>
      </div>

      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}

      {loading ? (
        <p className="muted">Carregando...</p>
      ) : tasks.length === 0 ? (
        <p className="muted">Nenhuma tarefa por aqui.</p>
      ) : (
        <ul className="task-list">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={handleToggle}
              onSave={handleSave}
              onDelete={handleDelete}
            />
          ))}
        </ul>
      )}
    </main>
  );
}