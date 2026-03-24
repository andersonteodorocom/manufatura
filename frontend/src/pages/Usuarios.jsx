import { useState, useEffect } from "react";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Dropdown } from "../components/Dropdown";
import { Table } from "../components/Table";import { Loading } from "../components/Loading";
import "../components/Modal.css";
import { UserPlus, Edit, Trash2, Search, X } from "lucide-react";
import "./Usuarios.css";

const API_URL = "http://localhost:5000/api";

const DEFAULT_FORM = {
  nome: "",
  email: "",
  cargo: "Visualizador",
  ativo: true,
  senha: "",
};

export const Usuarios = () => {
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [mensagem, setMensagem] = useState(null);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [formData, setFormData] = useState(DEFAULT_FORM);

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const carregarUsuarios = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/usuarios`);
      const result = await response.json();
      if (result.sucesso) {
        setUsuarios(result.dados || []);
      } else {
        setMensagem({ tipo: "erro", texto: result.mensagem || "Erro ao carregar usuarios" });
      }
    } catch (error) {
      setMensagem({ tipo: "erro", texto: "Erro ao carregar usuarios" });
    } finally {
      setLoading(false);
    }
  };

  const usuariosFiltrados = usuarios.filter((user) => {
    const matchBusca =
      (user.nome || "").toLowerCase().includes(busca.toLowerCase()) ||
      (user.email || "").toLowerCase().includes(busca.toLowerCase());
    const status = user.ativo ? "ativo" : "inativo";
    const matchStatus = filtroStatus === "todos" || status === filtroStatus;
    return matchBusca && matchStatus;
  });

  const handleNovoUsuario = () => {
    setModoEdicao(false);
    setFormData(DEFAULT_FORM);
    setShowModal(true);
  };

  const handleEditarUsuario = (user) => {
    setModoEdicao(true);
    setFormData({
      id: user.id,
      nome: user.nome || "",
      email: user.email || "",
      cargo: user.cargo || "Visualizador",
      ativo: Boolean(user.ativo),
      senha: "",
    });
    setShowModal(true);
  };

  const handleExcluirUsuario = async (id) => {
    if (!confirm("Deseja realmente excluir este usuario?")) return;
    try {
      const response = await fetch(`${API_URL}/usuarios/${id}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (result.sucesso) {
        setMensagem({ tipo: "sucesso", texto: "Usuario excluido com sucesso!" });
        carregarUsuarios();
      } else {
        setMensagem({ tipo: "erro", texto: result.mensagem || "Erro ao excluir" });
      }
    } catch (error) {
      setMensagem({ tipo: "erro", texto: "Erro ao excluir" });
    }
    setTimeout(() => setMensagem(null), 3000);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSalvar = async () => {
    if (!formData.nome || !formData.email) {
      setMensagem({ tipo: "erro", texto: "Nome e email sao obrigatorios!" });
      return;
    }

    if (!modoEdicao && !formData.senha) {
      setMensagem({ tipo: "erro", texto: "Senha e obrigatoria para novo usuario" });
      return;
    }

    const payload = {
      nome: formData.nome,
      email: formData.email,
      cargo: formData.cargo,
      ativo: formData.ativo,
    };

    if (formData.senha) {
      payload.senha = formData.senha;
    }

    try {
      if (modoEdicao) {
        const response = await fetch(`${API_URL}/usuarios/${formData.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const result = await response.json();
        if (result.sucesso) {
          setMensagem({ tipo: "sucesso", texto: "Usuario atualizado com sucesso!" });
          carregarUsuarios();
        } else {
          setMensagem({ tipo: "erro", texto: result.mensagem || "Erro ao atualizar" });
          return;
        }
      } else {
        const response = await fetch(`${API_URL}/usuarios`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const result = await response.json();
        if (result.sucesso) {
          setMensagem({ tipo: "sucesso", texto: "Usuario cadastrado com sucesso!" });
          carregarUsuarios();
        } else {
          setMensagem({ tipo: "erro", texto: result.mensagem || "Erro ao cadastrar" });
          return;
        }
      }
    } catch (error) {
      setMensagem({ tipo: "erro", texto: "Erro ao salvar usuario" });
      return;
    }

    setShowModal(false);
    setTimeout(() => setMensagem(null), 3000);
  };

  return (
    <div className="usuarios-container">
      <div className="usuarios-header">
        <div>
          <h1>Gerenciamento de Usuários</h1>
          <p className="usuarios-subtitle">
            {loading
              ? "Carregando..."
              : `${usuarios.length} usuários cadastrados • ${usuarios.filter((u) => u.ativo).length} ativos`}
          </p>
        </div>
        <Button
          text="Novo Usuário"
          variant="primary"
          icon={UserPlus}
          onClick={handleNovoUsuario}
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
          <Loading message="Carregando usuários..." />
        ) : (
          <>
            {/* Filtros */}
            <div className="usuarios-filtros">
          <div className="filtro-grupo">
            <Input
              label="Buscar usuários"
              placeholder="Nome ou email..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              icon={Search}
            />
          </div>
          <div className="filtro-grupo">
            <Dropdown
              label="Status"
              options={[
                { value: "todos", label: "Todos" },
                { value: "ativo", label: "Ativos" },
                { value: "inativo", label: "Inativos" },
              ]}
              value={filtroStatus}
              onChange={(value) => setFiltroStatus(value)}
            />
          </div>
        </div>

        {/* Tabela de Usuários */}
        <div className="usuarios-table-container">
          <Table>
            <thead>
              <tr>
                <th>Usuário</th>
                <th>Cargo</th>
                <th>Status</th>
                <th>Último Acesso</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.length > 0 ? (
                usuariosFiltrados.map((user) => (
                  <tr key={user.id}>
                    <td data-label="Usuário">
                      <div className="usuario-info">
                        <div className="usuario-avatar">
                          {(user.nome || "")
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </div>
                        <div>
                          <div className="usuario-nome">{user.nome}</div>
                          <div className="usuario-email">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td data-label="Cargo">
                      <span className="usuario-cargo">{user.cargo || "-"}</span>
                    </td>
                    <td data-label="Status">
                      <span className={`usuario-status ${user.ativo ? "ativo" : "inativo"}`}>
                        {user.ativo ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td data-label="Último Acesso">
                      {user.ultimo_acesso
                        ? new Date(user.ultimo_acesso).toLocaleDateString("pt-BR")
                        : "-"}
                    </td>
                    <td data-label="Ações">
                      <div className="usuarios-acoes">
                        <button
                          className="action-btn"
                          onClick={() => handleEditarUsuario(user)}
                          title="Editar usuário"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="action-btn action-delete"
                          onClick={() => handleExcluirUsuario(user.id)}
                          title="Excluir usuário"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "2rem" }}>
                    Nenhum usuário encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
          </>
        )}
      </Card>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modoEdicao ? "Editar Usuário" : "Novo Usuário"}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-cliente">
                <div className="form-section-modal">
                  <h4>Dados do Usuário</h4>
                  <div className="form-row">
                    <div className="form-group full-width">
                      <Input
                        label="Nome *"
                        name="nome"
                        value={formData.nome}
                        onChange={handleInputChange}
                        placeholder="Nome completo"
                        required
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group full-width">
                      <Input
                        label="Email *"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="usuario@empresa.com"
                        required
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <Dropdown
                        label="Cargo"
                        options={[
                          { value: "Administrador", label: "Administrador" },
                          { value: "Editor", label: "Editor" },
                          { value: "Visualizador", label: "Visualizador" },
                        ]}
                        value={formData.cargo}
                        onChange={(value) => setFormData((prev) => ({ ...prev, cargo: value }))}
                      />
                    </div>
                    <div className="form-group">
                      <Dropdown
                        label="Status"
                        options={[
                          { value: true, label: "Ativo" },
                          { value: false, label: "Inativo" },
                        ]}
                        value={formData.ativo}
                        onChange={(value) => setFormData((prev) => ({ ...prev, ativo: value }))}
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group full-width">
                      <Input
                        label={modoEdicao ? "Senha (opcional)" : "Senha *"}
                        name="senha"
                        type="password"
                        value={formData.senha}
                        onChange={handleInputChange}
                        placeholder={modoEdicao ? "Deixe em branco para manter" : "Defina uma senha"}
                        required={!modoEdicao}
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