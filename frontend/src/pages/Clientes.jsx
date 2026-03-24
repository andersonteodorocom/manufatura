import { useState, useEffect } from "react";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Table } from "../components/Table";
import { Loading } from "../components/Loading";
import "../components/Modal.css";
import { UserPlus, Edit, Trash2, Search, X } from "lucide-react";
import "./Clientes.css";

const API_URL = "http://localhost:5000/api";

export const Clientes = () => {
  const [busca, setBusca] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [mensagem, setMensagem] = useState(null);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    cnpj_tomador: "",
    cpf_tomador: "",
    razao_social_tomador: "",
    email_tomador: "",
    telefone_tomador: "",
    logradouro_tomador: "",
    numero_tomador: "",
    complemento_tomador: "",
    bairro_tomador: "",
    cep_tomador: "",
    codigo_municipio_tomador: "",
    uf_tomador: "",
  });

  const [clientes, setClientes] = useState([]);

  useEffect(() => {
    carregarClientes();
  }, []);

  const carregarClientes = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/clientes`);
      const result = await response.json();
      if (result.sucesso) {
        setClientes(result.dados || []);
      } else {
        setMensagem({ tipo: "erro", texto: result.mensagem || "Erro ao carregar clientes" });
      }
    } catch (error) {
      setMensagem({ tipo: "erro", texto: "Erro ao carregar clientes" });
    } finally {
      setLoading(false);
    }
  };

  const clientesFiltrados = clientes.filter((cliente) => {
    const buscarLower = busca.toLowerCase();
    const razao = (cliente.razao_social_tomador || "").toLowerCase();
    const cnpjCpf = cliente.cnpj_tomador || cliente.cpf_tomador || "";
    const email = (cliente.email_tomador || "").toLowerCase();
    return (
      razao.includes(buscarLower) ||
      cnpjCpf.includes(busca) ||
      email.includes(buscarLower)
    );
  });

  const handleNovoCliente = () => {
    setModoEdicao(false);
    setFormData({
      cnpj_tomador: "",
      cpf_tomador: "",
      razao_social_tomador: "",
      email_tomador: "",
      telefone_tomador: "",
      logradouro_tomador: "",
      numero_tomador: "",
      complemento_tomador: "",
      bairro_tomador: "",
      cep_tomador: "",
      codigo_municipio_tomador: "",
      uf_tomador: "",
    });
    setShowModal(true);
  };

  const handleEditarCliente = (cliente) => {
    setModoEdicao(true);
    setFormData({
      id: cliente.id,
      cnpj_tomador: cliente.cnpj_tomador || "",
      cpf_tomador: cliente.cpf_tomador || "",
      razao_social_tomador: cliente.razao_social_tomador || "",
      email_tomador: cliente.email_tomador || "",
      telefone_tomador: cliente.telefone_tomador || "",
      logradouro_tomador: cliente.logradouro_tomador || "",
      numero_tomador: cliente.numero_tomador || "",
      complemento_tomador: cliente.complemento_tomador || "",
      bairro_tomador: cliente.bairro_tomador || "",
      cep_tomador: cliente.cep_tomador || "",
      codigo_municipio_tomador: cliente.codigo_municipio_tomador || "",
      uf_tomador: cliente.uf_tomador || "",
    });
    setShowModal(true);
  };

  const handleExcluirCliente = async (id) => {
    if (!confirm("Deseja realmente excluir este cliente?")) return;
    try {
      const response = await fetch(`${API_URL}/clientes/${id}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (result.sucesso) {
        setMensagem({ tipo: "sucesso", texto: "Cliente excluído com sucesso!" });
        carregarClientes();
      } else {
        setMensagem({ tipo: "erro", texto: result.mensagem || "Erro ao excluir" });
      }
    } catch (error) {
      setMensagem({ tipo: "erro", texto: "Erro ao excluir" });
    }
    setTimeout(() => setMensagem(null), 3000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSalvar = async () => {
    if (!formData.razao_social_tomador) {
      setMensagem({ tipo: "erro", texto: "Nome/Razão Social é obrigatório!" });
      return;
    }

    const payload = {
      cnpj_tomador: formData.cnpj_tomador || null,
      cpf_tomador: formData.cpf_tomador || null,
      razao_social_tomador: formData.razao_social_tomador,
      email_tomador: formData.email_tomador || null,
      telefone_tomador: formData.telefone_tomador || null,
      logradouro_tomador: formData.logradouro_tomador || null,
      numero_tomador: formData.numero_tomador || null,
      complemento_tomador: formData.complemento_tomador || null,
      bairro_tomador: formData.bairro_tomador || null,
      cep_tomador: formData.cep_tomador || null,
      codigo_municipio_tomador: formData.codigo_municipio_tomador || null,
      uf_tomador: formData.uf_tomador || null,
    };

    try {
      if (modoEdicao) {
        const response = await fetch(`${API_URL}/clientes/${formData.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const result = await response.json();
        if (result.sucesso) {
          setMensagem({ tipo: "sucesso", texto: "Cliente atualizado com sucesso!" });
          carregarClientes();
        } else {
          setMensagem({ tipo: "erro", texto: result.mensagem || "Erro ao atualizar" });
          return;
        }
      } else {
        const response = await fetch(`${API_URL}/clientes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const result = await response.json();
        if (result.sucesso) {
          setMensagem({ tipo: "sucesso", texto: "Cliente cadastrado com sucesso!" });
          carregarClientes();
        } else {
          setMensagem({ tipo: "erro", texto: result.mensagem || "Erro ao cadastrar" });
          return;
        }
      }
    } catch (error) {
      setMensagem({ tipo: "erro", texto: "Erro ao salvar cliente" });
      return;
    }
    
    setShowModal(false);
    setTimeout(() => setMensagem(null), 3000);
  };

  return (
    <div className="clientes-container">
      <div className="clientes-header">
        <div>
          <h1>Gerenciamento de Clientes</h1>
          <p className="clientes-subtitle">
            {loading ? "Carregando..." : `${clientes.length} cliente(s) cadastrado(s)`}
          </p>
        </div>
        <Button
          text="Novo Cliente"
          variant="primary"
          icon={UserPlus}
          onClick={handleNovoCliente}
        />
      </div>

      {mensagem && (
        <div className={`mensagem mensagem-${mensagem.tipo}`}>
          {mensagem.texto}
          <button className="mensagem-close" onClick={() => setMensagem(null)}>
            <X size={16} />
          </button>
        </div>
      )}

      <Card>
        {loading ? (
          <Loading message="Carregando clientes..." />
        ) : (
          <>
            {/* Barra de busca */}
            <div className="search-bar">
          <div className="search-input-wrapper">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Buscar por nome, CNPJ/CPF ou email..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {/* Tabela de Clientes */}
        <div className="table-wrapper">
          <Table>
            <thead>
              <tr>
                <th>Nome/Razão Social</th>
                <th>CNPJ/CPF</th>
                <th>Email</th>
                <th>Telefone</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {clientesFiltrados.length > 0 ? (
                clientesFiltrados.map((cliente) => (
                  <tr key={cliente.id}>
                    <td data-label="Nome/Razão Social">
                      <div className="cliente-nome">{cliente.razao_social_tomador}</div>
                    </td>
                    <td data-label="CNPJ/CPF">{cliente.cnpj_tomador || cliente.cpf_tomador || "-"}</td>
                    <td data-label="Email">{cliente.email_tomador || "-"}</td>
                    <td data-label="Telefone">{cliente.telefone_tomador || "-"}</td>
                    <td data-label="Ações">
                      <div className="acoes-cell">
                        <button
                          className="action-btn"
                          onClick={() => handleEditarCliente(cliente)}
                          title="Editar cliente"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="action-btn action-delete"
                          onClick={() => handleExcluirCliente(cliente.id)}
                          title="Excluir cliente"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="empty-message">
                    Nenhum cliente encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
          </>
        )}
      </Card>

      {/* Modal de Cadastro/Edição */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modoEdicao ? "Editar Cliente" : "Novo Cliente"}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-cliente">
                {/* Identificação */}
                <div className="form-section-modal">
                  <h4>Identificação</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <Input
                        label="CNPJ"
                        name="cnpj_tomador"
                        value={formData.cnpj_tomador}
                        onChange={handleInputChange}
                        placeholder="00.000.000/0000-00"
                      />
                    </div>
                    <div className="form-group">
                      <Input
                        label="CPF"
                        name="cpf_tomador"
                        value={formData.cpf_tomador}
                        onChange={handleInputChange}
                        placeholder="000.000.000-00"
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group full-width">
                      <Input
                        label="Nome/Razão Social *"
                        name="razao_social_tomador"
                        value={formData.razao_social_tomador}
                        onChange={handleInputChange}
                        placeholder="Nome completo ou razão social"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Contato */}
                <div className="form-section-modal">
                  <h4>Contato</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <Input
                        label="Email"
                        name="email_tomador"
                        type="email"
                        value={formData.email_tomador}
                        onChange={handleInputChange}
                        placeholder="email@exemplo.com"
                      />
                    </div>
                    <div className="form-group">
                      <Input
                        label="Telefone"
                        name="telefone_tomador"
                        value={formData.telefone_tomador}
                        onChange={handleInputChange}
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                  </div>
                </div>

                {/* Endereço */}
                <div className="form-section-modal">
                  <h4>Endereço</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <Input
                        label="CEP"
                        name="cep_tomador"
                        value={formData.cep_tomador}
                        onChange={handleInputChange}
                        placeholder="00000-000"
                      />
                    </div>
                    <div className="form-group">
                      <Input
                        label="Código Município (IBGE)"
                        name="codigo_municipio_tomador"
                        value={formData.codigo_municipio_tomador}
                        onChange={handleInputChange}
                        placeholder="7 dígitos"
                      />
                    </div>
                    <div className="form-group">
                      <Input
                        label="UF"
                        name="uf_tomador"
                        value={formData.uf_tomador}
                        onChange={handleInputChange}
                        placeholder="SP"
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group flex-2">
                      <Input
                        label="Logradouro"
                        name="logradouro_tomador"
                        value={formData.logradouro_tomador}
                        onChange={handleInputChange}
                        placeholder="Rua, avenida, etc."
                      />
                    </div>
                    <div className="form-group">
                      <Input
                        label="Número"
                        name="numero_tomador"
                        value={formData.numero_tomador}
                        onChange={handleInputChange}
                        placeholder="Nº"
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <Input
                        label="Complemento"
                        name="complemento_tomador"
                        value={formData.complemento_tomador}
                        onChange={handleInputChange}
                        placeholder="Apto, sala, etc."
                      />
                    </div>
                    <div className="form-group">
                      <Input
                        label="Bairro"
                        name="bairro_tomador"
                        value={formData.bairro_tomador}
                        onChange={handleInputChange}
                        placeholder="Nome do bairro"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <Button
                text="Cancelar"
                variant="secondary"
                onClick={() => setShowModal(false)}
              />
              <Button
                text={modoEdicao ? "Atualizar" : "Cadastrar"}
                variant="primary"
                onClick={handleSalvar}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
