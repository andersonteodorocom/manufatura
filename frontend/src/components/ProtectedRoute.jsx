import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Loading } from "./Loading";

export const ProtectedRoute = ({ children }) => {
  const { autenticado, loading } = useAuth();

  if (loading) return <Loading fullScreen message="Verificando autenticação..." />;
  if (!autenticado) return <Navigate to="/login" replace />;

  return children;
};
