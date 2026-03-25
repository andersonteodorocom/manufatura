import React, { useState, useEffect } from "react";
import { Card } from "../components/Card";
import { Table } from "../components/Table";
import { Modal } from "../components/Modal";
import { Input } from "../components/Input";
import { Dropdown } from "../components/Dropdown";
import { Button } from "../components/Button";
import { Loading } from "../components/Loading";
import { StatusBadge } from "../components/StatusBadge";
import { DollarSign, Plus, User, Package } from "lucide-react";
import api from "../services/api";
import { formatarMoeda, formatarData } from "../utils/mascaras";
import "./Home.css";

export const Vendas = () => {
  const [pedidos, setPedidos] = useState([]);
  const [clientes, setClientes] = useState([]);
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
      const [pedidosRes, clientesRes, estoqueRes] = await Promise.all([
        api.get("/pedidos?tipo=VENDA"),
        api.get("/clientes"),
        api.get("/estoque"),
      ]);
      const pedidosData = await pedidosRes.json();
      const clientesData = await clientesRes.json();
      const estoqueData = await estoqueRes.json();

      setPedidos(pedidosData);
      setClientes(clientesData.map(c => ({ value: c.id, label: c.nome })));
      // Filtra apenas produtos finais ou revenda para venda
      setProdutos(estoqueData
        .filter(p => p.tipo !== "PECA")
        .map(p => ({ value: p.id, label: `${p.nome} (Estoque: ${p.estoque})` }))
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
      // 1. Criar o pedido
      const pedidoRes = await api.post("/pedidos", {
        parceiro_id: formData.parceiro_id,
        tipo: "VENDA",
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
      console.error("Erro ao finalizar venda:", error);
      alert(error.response?.data?.detail || "Erro ao finalizar venda. Verifique o estoque.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="home-container">
      <div className="home-header">
        <div className="header-content">
          <h1>Módulo de Vendas</h1>
          <p className="home-subtitle">Gestão de vendas e saída de produtos</p>
        </div>
        <Button onClick={() => setModalOpen(true)} icon={Plus}>
          Nova Venda
        </Button>
      </div>

      {loading ? (
        <Loading message="Carregando vendas..." />
      ) : (
        <Card>
          <Table>
            <thead>
              <tr>
                <th>Cód.</th>
                <th>Data</th>
                <th>Cliente</th>
                <th>Valor Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "2rem" }}>
                    Nenhuma venda encontrada.
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
                        {clientes.find(c => c.value === pedido.parceiro_id)?.label || `Cliente ${pedido.parceiro_id}`}
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
        title="Nova Venda"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} loading={submitting}>
              Vender
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="modal-form">
          <Dropdown
            label="Cliente"
            options={clientes}
            value={formData.parceiro_id}
            onChange={(val) => setFormData({ ...formData, parceiro_id: val })}
            placeholder="Selecione o cliente"
          />
          <Dropdown
            label="Produto"
            options={produtos}
            value={formData.produto_id}
            onChange={(val) => {
              const prod = produtos.find(p => p.value === val);
              // Tenta sugerir o preço se tivéssemos essa info, por ora mantém 0
              setFormData({ ...formData, produto_id: val });
            }}
            placeholder="Selecione o produto"
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
              label="Preço de Venda"
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
