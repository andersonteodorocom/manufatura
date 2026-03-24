import { useState, useEffect } from "react";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Dropdown } from "../components/Dropdown";
import { Table } from "../components/Table";import { Loading } from "../components/Loading";
import "../components/Modal.css";
import { Edit, Trash2, Search, X } from "lucide-react";
import "./Servicos.css";

const API_URL = "http://localhost:5000/api";

const TRIBUTACAO_ISS_OPTIONS = [
  { value: "1", label: "Tributado" },
  { value: "2", label: "Isento" },
  { value: "3", label: "Imune" },
  { value: "4", label: "Nao incidencia" },
  { value: "5", label: "Suspenso" },
];

const RETENCAO_ISS_OPTIONS = [
  { value: "1", label: "Nao retido" },
  { value: "2", label: "Retido" },
];

const DEFAULT_FORM = {
  descricao_servico: "",
  codigo_tributacao_nacional_iss: "",
  codigo_tributacao_municipal_iss: "",
  codigo_municipio_prestacao: "",
  valor_servico: "",
  desconto_incondicionado: "",
  desconto_condicionado: "",
  tributacao_iss: "1",
  tipo_retencao_iss: "1",
  percentual_aliquota_relativa_municipio: "",
};

export const Servicos = () => {
  const [busca, setBusca] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [mensagem, setMensagem] = useState(null);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);

  const [servicos, setServicos] = useState([]);

  useEffect(() => {
    carregarServicos();
  }, []);

  const carregarServicos = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/servicos`);
      const result = await response.json();
      if (result.sucesso) {
        setServicos(result.dados || []);
      } else {
        setMensagem({ tipo: "erro", texto: result.mensagem || "Erro ao carregar servicos" });
      }
    } catch (error) {
      setMensagem({ tipo: "erro", texto: "Erro ao carregar servicos" });
    } finally {
      setLoading(false);
    }
  };

  const servicosFiltrados = servicos.filter((servico) => {
    const buscaLower = busca.toLowerCase();
    return (
      servico.descricao_servico.toLowerCase().includes(buscaLower) ||
      servico.codigo_tributacao_nacional_iss.toLowerCase().includes(buscaLower) ||
      servico.codigo_tributacao_municipal_iss.toLowerCase().includes(buscaLower) ||
      servico.codigo_municipio_prestacao.includes(busca)
    );
  });

  const handleNovoServico = () => {
    setModoEdicao(false);
    setFormData(DEFAULT_FORM);
    setShowModal(true);
  };

  const handleEditarServico = (servico) => {
    setModoEdicao(true);
    setFormData({ ...servico });
    setShowModal(true);
  };

  const handleExcluirServico = async (id) => {
    if (!confirm("Deseja realmente excluir este servico?")) return;
    try {
      const response = await fetch(`${API_URL}/servicos/${id}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (result.sucesso) {
        setMensagem({ tipo: "sucesso", texto: "Servico excluido com sucesso!" });
        carregarServicos();
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
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDropdownChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSalvar = async () => {
    if (!formData.descricao_servico || !formData.codigo_tributacao_nacional_iss) {
      setMensagem({
        tipo: "erro",
        texto: "Descricao do servico e codigo de tributacao nacional sao obrigatorios!",
      });
      return;
    }

    if (!formData.codigo_municipio_prestacao) {
      setMensagem({
        tipo: "erro",
        texto: "Codigo do municipio de prestacao e obrigatorio!",
      });
      return;
    }

    try {
      if (modoEdicao) {
        const response = await fetch(`${API_URL}/servicos/${formData.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const result = await response.json();
        if (result.sucesso) {
          setMensagem({ tipo: "sucesso", texto: "Servico atualizado com sucesso!" });
          carregarServicos();
        } else {
          setMensagem({ tipo: "erro", texto: result.mensagem || "Erro ao atualizar" });
          return;
        }
      } else {
        const response = await fetch(`${API_URL}/servicos`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const result = await response.json();
        if (result.sucesso) {
          setMensagem({ tipo: "sucesso", texto: "Servico cadastrado com sucesso!" });
          carregarServicos();
        } else {
          setMensagem({ tipo: "erro", texto: result.mensagem || "Erro ao cadastrar" });
          return;
        }
      }
    } catch (error) {
      setMensagem({ tipo: "erro", texto: "Erro ao salvar servico" });
      return;
    }

    setShowModal(false);
    setTimeout(() => setMensagem(null), 3000);
  };

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(parseFloat(valor || 0));
  };

  const obterLabel = (options, value) =>
    options.find((opt) => opt.value === value)?.label || "-";

  return (
    <div className="servicos-container">
      <div className="servicos-header">
        <div>
          <h1>Catalogo de Servicos</h1>
          <p className="servicos-subtitle">
            {loading ? "Carregando..." : `${servicos.length} servico(s) cadastrado(s)`}
          </p>
        </div>
        <Button text="Novo Servico" variant="primary" onClick={handleNovoServico} />
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
          <Loading message="Carregando serviços..." />
        ) : (
          <>
            {/* Barra de busca */}
            <div className="search-bar">
          <div className="search-input-wrapper">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Buscar por descricao, codigo ou municipio..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {/* Tabela de Servicos */}
        <div className="table-wrapper">
          <Table>
            <thead>
              <tr>
                <th>Descricao</th>
                <th>Cod. Trib. Nacional</th>
                <th>Cod. Trib. Municipal</th>
                <th>Valor Servico</th>
                <th>Aliquota ISS</th>
                <th>Retencao</th>
                <th>Acoes</th>
              </tr>
            </thead>
            <tbody>
              {servicosFiltrados.length > 0 ? (
                servicosFiltrados.map((servico) => (
                  <tr key={servico.id}>
                    <td data-label="Descricao">
                      <div className="servico-nome">
                        {servico.descricao_servico}
                      </div>
                      <div className="servico-subinfo">
                        {obterLabel(TRIBUTACAO_ISS_OPTIONS, servico.tributacao_iss)}
                      </div>
                    </td>
                    <td data-label="Cod. Trib. Nacional">
                      {servico.codigo_tributacao_nacional_iss}
                    </td>
                    <td data-label="Cod. Trib. Municipal">
                      {servico.codigo_tributacao_municipal_iss || "-"}
                    </td>
                    <td data-label="Valor Servico">
                      {formatarMoeda(servico.valor_servico)}
                    </td>
                    <td data-label="Aliquota ISS">
                      {servico.percentual_aliquota_relativa_municipio
                        ? `${servico.percentual_aliquota_relativa_municipio}%`
                        : "-"}
                    </td>
                    <td data-label="Retencao">
                      <span className={`tag tag-${servico.tipo_retencao_iss}`}>
                        {obterLabel(RETENCAO_ISS_OPTIONS, servico.tipo_retencao_iss)}
                      </span>
                    </td>
                    <td data-label="Acoes">
                      <div className="acoes-cell">
                        <button
                          className="action-btn"
                          onClick={() => handleEditarServico(servico)}
                          title="Editar servico"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="action-btn action-delete"
                          onClick={() => handleExcluirServico(servico.id)}
                          title="Excluir servico"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="empty-message">
                    Nenhum servico encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
          </>
        )}
      </Card>

      {/* Modal de Cadastro/Edicao */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modoEdicao ? "Editar Servico" : "Novo Servico"}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-servico">
                <div className="form-section-modal">
                  <h4>Identificacao</h4>
                  <div className="form-row">
                    <div className="form-group full-width">
                      <Input
                        label="Descricao do Servico *"
                        name="descricao_servico"
                        value={formData.descricao_servico}
                        onChange={handleInputChange}
                        placeholder="Descricao detalhada do servico"
                        required
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <Input
                        label="Cod. Tributacao Nacional (LC 116) *"
                        name="codigo_tributacao_nacional_iss"
                        value={formData.codigo_tributacao_nacional_iss}
                        onChange={handleInputChange}
                        placeholder="Ex: 1.05"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <Input
                        label="Cod. Tributacao Municipal"
                        name="codigo_tributacao_municipal_iss"
                        value={formData.codigo_tributacao_municipal_iss}
                        onChange={handleInputChange}
                        placeholder="Ex: 0105"
                      />
                    </div>
                    <div className="form-group">
                      <Input
                        label="Cod. Municipio Prestacao (IBGE) *"
                        name="codigo_municipio_prestacao"
                        value={formData.codigo_municipio_prestacao}
                        onChange={handleInputChange}
                        placeholder="7 digitos"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="form-section-modal">
                  <h4>Valores</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <Input
                        label="Valor do Servico"
                        name="valor_servico"
                        type="number"
                        step="0.01"
                        value={formData.valor_servico}
                        onChange={handleInputChange}
                        placeholder="0,00"
                      />
                    </div>
                    <div className="form-group">
                      <Input
                        label="Desconto Incondicionado"
                        name="desconto_incondicionado"
                        type="number"
                        step="0.01"
                        value={formData.desconto_incondicionado}
                        onChange={handleInputChange}
                        placeholder="0,00"
                      />
                    </div>
                    <div className="form-group">
                      <Input
                        label="Desconto Condicionado"
                        name="desconto_condicionado"
                        type="number"
                        step="0.01"
                        value={formData.desconto_condicionado}
                        onChange={handleInputChange}
                        placeholder="0,00"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-section-modal">
                  <h4>ISS</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <Dropdown
                        label="Tributacao ISS"
                        options={TRIBUTACAO_ISS_OPTIONS}
                        value={formData.tributacao_iss}
                        onChange={(value) =>
                          handleDropdownChange("tributacao_iss", value)
                        }
                      />
                    </div>
                    <div className="form-group">
                      <Dropdown
                        label="Tipo Retencao ISS"
                        options={RETENCAO_ISS_OPTIONS}
                        value={formData.tipo_retencao_iss}
                        onChange={(value) =>
                          handleDropdownChange("tipo_retencao_iss", value)
                        }
                      />
                    </div>
                    <div className="form-group">
                      <Input
                        label="Aliquota (%)"
                        name="percentual_aliquota_relativa_municipio"
                        type="number"
                        step="0.01"
                        value={formData.percentual_aliquota_relativa_municipio}
                        onChange={handleInputChange}
                        placeholder="0,00"
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
