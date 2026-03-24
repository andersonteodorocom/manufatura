import { useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Sidebar } from "./components/Sidebar";
import { Home } from "./pages/Home";
import { Configuracoes } from "./pages/Configuracoes";
import { Login } from "./pages/Login";
import { HamburgerButton } from "./components/HamburgerButton";

// Novos módulos
import { Compras } from "./pages/Compras";
import { Vendas } from "./pages/Vendas";
import { Producao } from "./pages/Producao";

const AppLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const isLogin = location.pathname === "/login";
  const isPrint = location.pathname === "/pedido-impressao";

  return (
    <div className={`app-container ${isPrint ? "print-mode" : ""}`}>
      {!isLogin && !isPrint && (
        <>
          <HamburgerButton
            isOpen={isSidebarOpen}
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          />
          <div className={`sidebar-container ${isSidebarOpen ? "open" : ""}`}>
            <Sidebar onLinkClick={() => setIsSidebarOpen(false)} />
          </div>
          {isSidebarOpen && (
            <div
              className="sidebar-overlay"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}
        </>
      )}
      <main className={`main-content ${isLogin ? "login-content" : ""} ${isPrint ? "print-content" : ""}`}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/compras" element={<ProtectedRoute><Compras /></ProtectedRoute>} />
          <Route path="/vendas" element={<ProtectedRoute><Vendas /></ProtectedRoute>} />
          <Route path="/producao" element={<ProtectedRoute><Producao /></ProtectedRoute>} />
          <Route path="/config" element={<ProtectedRoute><Configuracoes /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
