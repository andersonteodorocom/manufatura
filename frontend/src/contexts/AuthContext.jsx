import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { API_URL } from "../config";

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  const verificarAuth = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/check`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        if (data.autenticado) {
          setUsuario(data.usuario);
        } else {
          setUsuario(null);
        }
      } else {
        setUsuario(null);
      }
    } catch {
      setUsuario(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    verificarAuth();
  }, [verificarAuth]);

  const login = async (user, senha) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ usuario: user, senha }),
    });
    const data = await res.json();
    if (data.sucesso) {
      setUsuario(data.usuario);
      return { sucesso: true };
    }
    return { sucesso: false, mensagem: data.mensagem };
  };

  const logout = async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch { /* ignore */ }
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, loading, login, logout, autenticado: !!usuario }}>
      {children}
    </AuthContext.Provider>
  );
};
