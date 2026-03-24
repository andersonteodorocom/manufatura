import './Sidebar.css';
import { Link, useLocation } from "react-router-dom";
import { Home, ShoppingCart, DollarSign, Package, Settings, LogOut } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export const Sidebar = ({ onLinkClick }) => {
  const { usuario, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    onLinkClick?.();
  };

  return (
    <aside className="sidebar-aside">
      <div className="sidebar-brand">
        <h2 className="sidebar-title">
          Manufatura ERP
        </h2>
        {usuario && (
          <span className="sidebar-user">{usuario}</span>
        )}
        <hr className="sidebar-divider" />
      </div>
      
      <nav>
        <Link to="/" className={`sidebar-link ${isActive("/") ? "active" : ""}`} onClick={onLinkClick}>
          <Home size={20} className="sidebar-icon" /> Dashboard
        </Link>

        <Link to="/compras" className={`sidebar-link ${isActive("/compras") ? "active" : ""}`} onClick={onLinkClick}>
          <ShoppingCart size={20} className="sidebar-icon" /> Compras
        </Link>

        <Link to="/vendas" className={`sidebar-link ${isActive("/vendas") ? "active" : ""}`} onClick={onLinkClick}>
          <DollarSign size={20} className="sidebar-icon" /> Vendas
        </Link>

        <Link to="/producao" className={`sidebar-link ${isActive("/producao") ? "active" : ""}`} onClick={onLinkClick}>
          <Package size={20} className="sidebar-icon" /> Produção
        </Link>

        <Link to="/config" className={`sidebar-link ${isActive("/config") ? "active" : ""}`} onClick={onLinkClick}>
          <Settings size={20} className="sidebar-icon" /> Configurações
        </Link>

        <hr className="sidebar-divider" />

        <button
          className="sidebar-link sidebar-logout"
          onClick={handleLogout}
        >
          <LogOut color="var(--secondary)" size={20} className="sidebar-icon" /> Sair
        </button>
      </nav>
      
      <div className="sidebar-version">
        v1.0.0 Manufatura ERP
      </div>
    </aside>
  );
};