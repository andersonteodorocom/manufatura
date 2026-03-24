import { API_URL } from "../config";

/**
 * Helper para chamadas à API Flask com credentials (cookies de sessão)
 */
const apiFetch = async (endpoint, options = {}) => {
  const config = {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  };

  // Não definir Content-Type para FormData
  if (options.body instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  const res = await fetch(`${API_URL}${endpoint}`, config);

  // Se 401, redirecionar para login
  if (res.status === 401 && !endpoint.includes("/auth/")) {
    window.location.href = "/login";
    throw new Error("Sessão expirada");
  }

  return res;
};

export const api = {
  get: (endpoint) => apiFetch(endpoint),
  post: (endpoint, data) =>
    apiFetch(endpoint, { method: "POST", body: JSON.stringify(data) }),
  put: (endpoint, data) =>
    apiFetch(endpoint, { method: "PUT", body: JSON.stringify(data) }),
  delete: (endpoint, data) =>
    apiFetch(endpoint, { method: "DELETE", body: data ? JSON.stringify(data) : undefined }),
};

export default api;
