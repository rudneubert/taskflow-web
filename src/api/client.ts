import type { Task, TaskCreate, TaskUpdate, Token, User } from "../types";

// import.meta.env é como o Vite expõe as variáveis VITE_*.
const API_URL = import.meta.env.VITE_API_URL as string;

// Chave usada para guardar o token no navegador.
const TOKEN_KEY = "taskflow_token";

// ---------- Token ----------
// localStorage guarda dados no navegador, mesmo depois de fechar a aba.
export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

// Erro próprio, carregando o status HTTP para a interface decidir
// o que fazer (ex.: 401 = mandar para o login).
export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// Função central: todas as chamadas passam por aqui.
// <T> é um "genérico": quem chama informa o tipo esperado da resposta.
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = tokenStorage.get();

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      // Só envia Content-Type JSON quando NÃO for formulário.
      ...(options.body instanceof URLSearchParams
        ? {}
        : { "Content-Type": "application/json" }),
      // Se houver token, anexa o cabeçalho de autenticação.
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  // 204 = sucesso sem corpo (delete). Não há JSON para ler.
  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    // A API devolve {"detail": "mensagem"}. Em erros 422, "detail" é
    // uma lista; nesse caso usamos uma mensagem genérica.
    const message =
      typeof data?.detail === "string" ? data.detail : "Erro inesperado";
    throw new ApiError(response.status, message);
  }

  return data as T;
}

// ---------- Autenticação ----------
export const authApi = {
  register: (email: string, password: string) =>
    request<User>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  // O login da API espera FORMULÁRIO (OAuth2), não JSON.
  // URLSearchParams monta esse formato; o campo se chama "username".
  login: (email: string, password: string) =>
    request<Token>("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ username: email, password }),
    }),
};

// ---------- Tarefas ----------
export const tasksApi = {
  list: (completed?: boolean) => {
    const query = completed === undefined ? "" : `?completed=${completed}`;
    return request<Task[]>(`/tasks${query}`);
  },

  create: (data: TaskCreate) =>
    request<Task>("/tasks", { method: "POST", body: JSON.stringify(data) }),

  update: (id: number, data: TaskUpdate) =>
    request<Task>(`/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  remove: (id: number) => request<void>(`/tasks/${id}`, { method: "DELETE" }),
};