import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ApiError, authApi } from "../api/client";

export default function RegisterPage() {
  // "Formulário controlado": o valor de cada campo vive no estado
  // do React, e o campo apenas o exibe. Assim o React sempre sabe
  // o que foi digitado.
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // useNavigate devolve uma função para trocar de página por código.
  const navigate = useNavigate();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    // Impede o comportamento padrão do formulário, que recarregaria
    // a página inteira.
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await authApi.register(email, password);
      // Sucesso: vai para o login.
      navigate("/login");
    } catch (err) {
      // "instanceof" confere se é o nosso ApiError (com mensagem da API).
      if (err instanceof ApiError) {
        // 422 vem com uma lista de detalhes: usamos mensagem própria.
        setError(
          err.status === 422
            ? "Dados inválidos. Use um e-mail válido e senha com 8+ caracteres."
            : err.message
        );
      } else {
        setError("Não foi possível conectar ao servidor.");
      }
    } finally {
      // Roda sempre, com sucesso ou erro: libera o botão.
      setLoading(false);
    }
  }

  return (
    <main className="container">
      <div className="card auth-card">
        <h1>Criar conta</h1>

        <form onSubmit={handleSubmit}>
          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="password">Senha (mínimo 8 caracteres)</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />

          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading}>
            {loading ? "Criando..." : "Criar conta"}
          </button>
        </form>

        <p className="auth-footer">
          Já tem conta? <Link to="/login">Entrar</Link>
        </p>
      </div>
    </main>
  );
}