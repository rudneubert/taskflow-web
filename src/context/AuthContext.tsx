import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import { ApiError, authApi, tokenStorage } from "../api/client";

// Define o que o contexto oferece a quem o usar.
interface AuthContextValue {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  // Recebe um erro; se for 401, desloga e devolve true.
  handleAuthError: (err: unknown) => boolean;
}

// createContext cria o "canal" de compartilhamento.
// O valor inicial é null; o Provider abaixo entrega o valor real.
const AuthContext = createContext<AuthContextValue | null>(null);

// O Provider envolve o app e fornece os dados a todos os componentes
// dentro dele. "children" são os componentes filhos.
export function AuthProvider({ children }: { children: ReactNode }) {
  // O estado começa com o que já estiver salvo no navegador. Passar
  // uma FUNÇÃO ao useState faz o React executá-la só na primeira
  // renderização (e não a cada atualização).
  // "!!" converte o valor em booleano: texto vira true, null vira false.
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!tokenStorage.get()
  );

  async function login(email: string, password: string) {
    // Pede o token à API. Se falhar, o erro sobe para quem chamou
    // (a página de login mostra a mensagem).
    const { access_token } = await authApi.login(email, password);
    tokenStorage.set(access_token);
    setIsAuthenticated(true);
  }

  function logout() {
    tokenStorage.clear();
    setIsAuthenticated(false);
  }

  // Chamada pelas páginas quando uma requisição dá erro.
  // Se o erro for 401 (token inválido ou expirado), limpa o login.
  // Como isAuthenticated vira false, o ProtectedRoute redireciona
  // sozinho para /login. Devolve true se tratou o erro.
  function handleAuthError(err: unknown): boolean {
    if (err instanceof ApiError && err.status === 401) {
      logout();
      return true;
    }
    return false;
  }

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, login, logout, handleAuthError }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado: atalho para acessar o contexto.
// Em vez de useContext(AuthContext) em todo lugar, usamos useAuth().
export function useAuth() {
  const context = useContext(AuthContext);
  // Protege contra o uso fora do Provider, com erro claro.
  if (context === null) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}