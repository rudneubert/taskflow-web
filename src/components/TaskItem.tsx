import { useState } from "react";
import type { Task } from "../types";

interface TaskItemProps {
  task: Task;
  // Funções fornecidas pelo pai. O item só as chama.
  onToggle: (task: Task) => void;
  onSave: (id: number, title: string, description: string) => Promise<void>;
  onDelete: (id: number) => void;
}

export default function TaskItem({
  task,
  onToggle,
  onSave,
  onDelete,
}: TaskItemProps) {
  // Controla se está no modo de edição.
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");

  async function handleSave() {
    try {
      await onSave(task.id, title.trim(), description.trim());
      setEditing(false);
    } catch {
      // Se falhar, continua no modo de edição.
    }
  }

  function handleCancel() {
    // Descarta as alterações, restaurando os valores originais.
    setTitle(task.title);
    setDescription(task.description ?? "");
    setEditing(false);
  }

  if (editing) {
    return (
      <li>
        <input
          aria-label="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
        />
        <input
          aria-label="Descrição"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button onClick={handleSave} disabled={!title.trim()}>
          Salvar
        </button>
        <button onClick={handleCancel}>Cancelar</button>
      </li>
    );
  }

  return (
    <li>
      <label style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggle(task)}
          style={{ width: "auto" }}
        />
        <span
          style={{
            // Tarefa concluída aparece riscada.
            textDecoration: task.completed ? "line-through" : "none",
          }}
        >
          {task.title}
        </span>
      </label>
      {task.description && <p>{task.description}</p>}
      <button onClick={() => setEditing(true)}>Editar</button>
      <button onClick={() => onDelete(task.id)}>Apagar</button>
    </li>
  );
}