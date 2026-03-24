// Configuração centralizada da API
// Em produção (Docker), VITE_API_URL não é definida = usa caminho relativo (mesmo domínio)
// Em dev local, crie frontend-template/.env com VITE_API_URL=http://localhost:5000
export const API_URL = import.meta.env.VITE_API_URL ?? "";
