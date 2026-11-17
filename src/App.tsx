import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL as string;

function App() {
  // useState cria uma variável de "estado": quando ela muda, o
  // React redesenha o componente com o novo valor.
  const [status, setStatus] = useState("verificando...");

  // useEffect executa código DEPOIS que o componente aparece na
  // tela. O [] no final significa "rode só uma vez".
  useEffect(() => {
    fetch(`${API_URL}/health`)
      .then((res) => res.json())
      .then((data) => setStatus(data.status))
      .catch(() => setStatus("API fora do ar ou bloqueada por CORS"));
  }, []);

  return <h1>Status da API: {status}</h1>;
}

export default App;