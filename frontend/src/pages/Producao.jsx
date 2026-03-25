import React, { useState, useEffect } from "react";
import { Card } from "../components/Card";
import { Table } from "../components/Table";
import { Modal } from "../components/Modal";
import { Input } from "../components/Input";
import { Dropdown } from "../components/Dropdown";
import { Button } from "../components/Button";
import { Loading } from "../components/Loading";
import { Package, Plus, Calendar, Clock } from "lucide-react";
import api from "../services/api";
import { formatarData } from "../utils/mascaras";
import "./Home.css";

export const Producao = () => {
  const [logs, setLogs] = useState([]);
  const [produtosFinais, setProdutosFinais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    produto_id: "",
    quantidade: "",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [logsRes, estoqueRes] = await Promise.all([
        api.get("/manufatura/logs"),
        api.get("/estoque"),
      ]);
      const logsData = await logsRes.json();
      const estoqueData = await estoqueRes.json();

      setLogs(logsData);
      setProdutosFinais(estoqueData
        .filter(p => p.tipo === "PRODUTO_FINAL")
        .map(p => ({ value: p.id, label: p.nome }))
      );
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/manufatura/produzir", {
        produto_id: formData.produto_id,
        quantidade: parseFloat(formData.quantidade),
      });

      setModalOpen(false);
      setFormData({ produto_id: "", quantidade: "" });
      fetchData();
    } catch (error) {
      console.error("Erro ao registrar produção:", error);
      alert(error.response?.data?.detail || "Erro ao registrar produção. Verifique o estoque de insumos.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="home-container">
      <div className="home-header">
        <div className="header-content">
          <h1>Módulo de Produção</h1>
          <p className="home-subtitle">Controle de manufatura e montagem de produtos</p>
        </div>
        <Button onClick={() => setModalOpen(true)} icon={Plus}>
          Nova Produção
        </Button>
      </div>

      {loading ? (
        <Loading message="Carregando histórico..." />
      ) : (
        <Card>
          <Table>
            <thead>
              <tr>
                <th>Cód.</th>
                <th>Data</th>
                <th>Produto Final</th>
                <th>Quantidade</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center", padding: "2rem" }}>
                    Nenhum registro de produção encontrado.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td>#{log.id}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <Calendar size={14} color="var(--text-secondary)" />
                        {formatarData(log.data)}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <Package size={14} color="var(--text-secondary)" />
                        {log.produto?.nome || `Produto ${log.produto_id}`}
                      </div>
                    </td>
                    <td>{log.quantidade} un</td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Registrar Produção"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} loading={submitting}>
              Iniciar Produção
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="modal-form">
          <Dropdown
            label="Produto a Fabricar"
            options={produtosFinais}
            value={formData.produto_id}
            onChange={(val) => setFormData({ ...formData, produto_id: val })}
            placeholder="Selecione o produto final"
          />
          <Input
            label="Quantidade de Unidades"
            type="number"
            value={formData.quantidade}
            onChange={(e) => setFormData({ ...formData, quantidade: e.target.value })}
            placeholder="0"
            required
          />
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.5rem" }}>
            * O sistema dará baixa automática nos insumos (BOM) cadastrados para este produto.
          </p>
        </form>
      </Modal>
    </div>
  );
};
