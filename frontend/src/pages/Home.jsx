import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/Card";
import { Loading } from "../components/Loading";
import { DollarSign, ShoppingCart, Package, AlertCircle } from "lucide-react";
import api from "../services/api";
import { formatarMoeda } from "../utils/mascaras";
import "./Home.css";

export const Home = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [estatisticas, setEstatisticas] = useState([
    { titulo: "A Receber (Mês)", valor: "R$ 0,00", variacao: "0 contas", icon: DollarSign, corClass: "stat-success" },
    { titulo: "A Pagar (Mês)", valor: "R$ 0,00", variacao: "0 contas", icon: ShoppingCart, corClass: "stat-danger" },
    { titulo: "Estoque Baixo", valor: "0", variacao: "Itens críticos", icon: AlertCircle, corClass: "stat-warning" },
    { titulo: "Produtos Finais", valor: "0", variacao: "Em estoque", icon: Package, corClass: "stat-info" },
  ]);

  const acoesRapidas = [
    { label: "Nova Compra", icon: ShoppingCart, link: "/compras", variant: "primary" },
    { label: "Nova Venda", icon: DollarSign, link: "/vendas", variant: "secondary" },
    { label: "Registrar Produção", icon: Package, link: "/producao", variant: "secondary" },
  ];

  return (
    <div className="home-container">
      <div className="home-header">
        <h1>Dashboard - Manufatura ERP</h1>
        <p className="home-subtitle">Visão geral do seu negócio</p>
      </div>

      {loading ? (
        <Loading message="Carregando dashboard..." />
      ) : (
        <>
          <div className="stats-grid">
            {estatisticas.map((stat, index) => (
              <Card key={index} className="stat-card">
                <div className="stat-content">
                  <div className={`stat-icon ${stat.corClass}`}>
                    <stat.icon size={24} />
                  </div>
                  <div className="stat-info">
                    <p className="stat-label">{stat.titulo}</p>
                    <h2 className="stat-value">{stat.valor}</h2>
                    <p className="stat-variacao">{stat.variacao}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="home-grid">
            <Card className="acoes-card">
              <h3 className="card-section-title">Ações Rápidas</h3>
              <div className="acoes-grid">
                {acoesRapidas.map((acao, index) => (
                  <button key={index} className="acao-item" onClick={() => navigate(acao.link)}>
                    <acao.icon size={20} />
                    <span>{acao.label}</span>
                  </button>
                ))}
              </div>
            </Card>

            <Card className="notas-card">
              <h3 className="card-section-title">Alertas do Sistema</h3>
              <div className="notas-lista">
                <p className="home-empty">
                  Sem alertas no momento.
                </p>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};