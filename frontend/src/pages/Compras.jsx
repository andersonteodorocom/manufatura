import React, { useState, useEffect } from "react";
import { Card } from "../components/Card";
import { Table } from "../components/Table";
import { Modal } from "../components/Modal";
import { Input } from "../components/Input";
import { Dropdown } from "../components/Dropdown";
import { Button } from "../components/Button";
import { Loading } from "../components/Loading";
import { StatusBadge } from "../components/StatusBadge";
import { ShoppingCart, Plus, Calendar, User, Package } from "lucide-react";
import api from "../services/api";
import { formatarMoeda, formatarData } from "../utils/mascaras";
import "./Home.css";

export const Compras = () => {
  const [pedidos, setPedidos] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    parceiro_id: "",
    produto_id: "",
    quantidade: "",
    preco_unitario: "",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pedidosRes, fornecedoresRes, estoqueRes] = await Promise.all([
        api.get("/pedidos?tipo=COMPRA"),
        api.get("/fornecedores"),
        api.get("/estoque"),
      ]);
      const pedidosData = await pedidosRes.json();
      const fornecedoresData = await fornecedoresRes.json();
      const estoqueData = await estoqueRes.json();

      setPedidos(pedidosData);
      setFornecedores(fornecedoresData.map(f => ({ value: f.id, label: f.nome })));
      setProdutos(estoqueData.map(p => ({ value: p.id, label: `${p.nome} (${p.tipo})` })));
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
      // 1. Criar o pedido
      const pedidoRes = await api.post("/pedidos", {
        parceiro_id: formData.parceiro_id,
        tipo: "COMPRA",
        itens: [
          {
            produto_id: formData.produto_id,
            quantidade: parseFloat(formData.quantidade),
            preco_unitario: parseFloat(formData.preco_unitario),
          },
        ],
      });

      // 2. Finalizar o pedido para atualizar estoque
      await api.put(`/pedidos/${pedidoRes.data.id}/finalizar`);

      setModalOpen(false);
      setFormData({ parceiro_id: "", produto_id: "", quantidade: "", preco_unitario: "" });
      fetchData();
    } catch (error) {
      console.error("Erro ao finalizar compra:", error);
      alert("Erro ao finalizar compra. Verifique os dados.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="home-container">
      <div className="home-header">
        <div className="header-content">
          <h1>Módulo de Compras</h1>
          <p className="home-subtitle">Gestão de pedidos e entrada de estoque</p>
        </div>
        <Button onClick={() => setModalOpen(true)} icon={Plus}>
          Nova Compra
        </Button>
      </div>

      {loading ? (
        <Loading message="Carregando pedidos..." />
      ) : (
        <Card>
          <Table>
            <thead>
              <tr>
                <th>Cód.</th>
                <th>Data</th>
                <th>Fornecedor</th>
                <th>Valor Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "2rem" }}>
                    Nenhum pedido de compra encontrado.
                  </td>
                </tr>
              ) : (
                pedidos.map((pedido) => (
                  <tr key={pedido.id}>
                    <td>#{pedido.id}</td>
                    <td>{formatarData(pedido.data)}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <User size={14} color="var(--text-secondary)" />
                        {fornecedores.find(f => f.value === pedido.parceiro_id)?.label || `Fornecedor ${pedido.parceiro_id}`}
                      </div>
                    </td>
                    <td>
                      {formatarMoeda(
                        pedido.itens.reduce((acc, item) => acc + item.quantidade * item.preco_unitario, 0)
                      )}
                    </td>
                    <td>
                      <StatusBadge status={pedido.status} />
                    </td>
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
        title="Novo Pedido de Compra"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} loading={submitting}>
              Finalizar Compra
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="modal-form">
          <Dropdown
            label="Fornecedor"
            options={fornecedores}
            value={formData.parceiro_id}
            onChange={(val) => setFormData({ ...formData, parceiro_id: val })}
            placeholder="Selecione o fornecedor"
          />
          <Dropdown
            label="Produto / Insumo"
            options={produtos}
            value={formData.produto_id}
            onChange={(val) => setFormData({ ...formData, produto_id: val })}
            placeholder="Selecione o item"
          />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <Input
              label="Quantidade"
              type="number"
              value={formData.quantidade}
              onChange={(e) => setFormData({ ...formData, quantidade: e.target.value })}
              placeholder="0"
              required
            />
            <Input
              label="Preço Unitário"
              type="number"
              step="0.01"
              value={formData.preco_unitario}
              onChange={(e) => setFormData({ ...formData, preco_unitario: e.target.value })}
              placeholder="0,00"
              required
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
