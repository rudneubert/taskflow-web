// Espelha o schema TaskResponse da API.
export interface Task {
  id: number;
  title: string;
  description: string | null; // "string | null" = texto ou nulo
  completed: boolean;
  created_at: string; // datas chegam como texto ISO
}

// Dados para criar uma tarefa (schema TaskCreate).
export interface TaskCreate {
  title: string;
  description?: string | null; // "?" = campo opcional
}

// Dados para atualizar (schema TaskUpdate): tudo opcional.
export interface TaskUpdate {
  title?: string;
  description?: string | null;
  completed?: boolean;
}

export interface User {
  id: number;
  email: string;
  created_at: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}