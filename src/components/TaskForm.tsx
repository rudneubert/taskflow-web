import { useState } from "react";
import type { FormEvent } from "react";

// Props: o que este componente recebe do pai.
// onCreate é uma função que o pai fornece; o formulário a chama
// quando o usuário envia. O formulário não sabe falar com a API:
// só cuida de coletar os dados.
interface TaskFormProps {
  onCreate: (title: string, description: string) => Promise<void>;
}

export default function TaskForm({ onCreate }: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    try {
      await onCreate(title.trim(), description.trim());
      // Só limpa os campos se a criação deu certo.
      setTitle("");
      setDescription("");
    } catch {
      // O erro é mostrado pelo pai; aqui só mantemos os campos
      // preenchidos para o usuário tentar de novo.
    } finally {
      setSubmitting(false);
    }
  }

    return (
    <form onSubmit={handleSubmit} className="card">
      <label htmlFor="new-title" style={{ marginTop: 0 }}>
        Nova tarefa
      </label>
      <input
        id="new-title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={100}
        required
      />

      <label htmlFor="new-description">Descrição (opcional)</label>
      <input
        id="new-description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <button type="submit" disabled={submitting || !title.trim()}>
        {submitting ? "Adicionando..." : "Adicionar"}
      </button>
    </form>
  );
}