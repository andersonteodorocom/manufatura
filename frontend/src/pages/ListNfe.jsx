import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Dropdown } from "../components/Dropdown";
import { Table } from "../components/Table";
import { Loading } from "../components/Loading";
import { ActionsMenu } from "../components/ActionsMenu";
import "../components/Modal.css";
import {
  Search, FileText, Download, X, Eye, RefreshCw,
  CheckCircle, Clock, XCircle, AlertCircle,
  Edit3, ExternalLink
} from "lucide-react";
import api from "../services/api";
import { formatarMoeda, formatarData, formatarDocumento } from "../utils/mascaras";
import "./ListNfe.css";

export const ListNfe = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState(null);
  const [nfes, setNfes] = useState([]);
  const [totalInfo, setTotalInfo] = useState({ total: 0, faixa: "", fonte: "" });

  // Filtros
  const [filtros, setFiltros] = useState({
    busca_texto: "", status: "", periodo: "",
  });
  const debounceRef = useRef(null);

  // Modais
  const [showDetalhes, setShowDetalhes] = useState(false);
  const [nfeSelecionada, setNfeSelecionada] = useState(null);
  const [showCancelarModal, setShowCancelarModal] = useState(false);
  const [justificativa, setJustificativa] = useState("");

  useEffect(() => { carregarNfes(); }, []);

  // Calcula datas de início/fim a partir do período selecionado
  const calcularDatas = useCallback((periodo) => {
    const hoje = new Date();
    let data_inicio = "", data_fim = "";
    if (periodo === "hoje") {
      data_inicio = data_fim = hoje.toISOString().split("T")[0];
    } else if (periodo === "7dias") {
      const d = new Date(hoje); d.setDate(d.getDate() - 7);
      data_inicio = d.toISOString().split("T")[0];
      data_fim = hoje.toISOString().split("T")[0];
    } else if (periodo === "15dias") {
      const d = new Date(hoje); d.setDate(d.getDate() - 15);
      data_inicio = d.toISOString().split("T")[0];
      data_fim = hoje.toISOString().split("T")[0];
    } else if (periodo === "30dias") {
      const d = new Date(hoje); d.setDate(d.getDate() - 30);
      data_inicio = d.toISOString().split("T")[0];
      data_fim = hoje.toISOString().split("T")[0];
    } else if (periodo === "mes_atual") {
      data_inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split("T")[0];
      data_fim = hoje.toISOString().split("T")[0];
    } else if (periodo === "mes_anterior") {
      data_inicio = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1).toISOString().split("T")[0];
      data_fim = new Date(hoje.getFullYear(), hoje.getMonth(), 0).toISOString().split("T")[0];
    } else if (periodo === "90dias") {
      const d = new Date(hoje); d.setDate(d.getDate() - 90);
      data_inicio = d.toISOString().split("T")[0];
      data_fim = hoje.toISOString().split("T")[0];
    }
    return { data_inicio, data_fim };
  }, []);

  const carregarNfes = async (filtrosCustom) => {
    setLoading(true);
    setMensagem(null);
    try {
      const f = filtrosCustom || filtros;
      const params = new URLSearchParams();
      if (f.busca_texto) params.set("busca_texto", f.busca_texto);
      if (f.status) params.set("status", f.status);
      if (f.periodo) {
        const { data_inicio, data_fim } = calcularDatas(f.periodo);
        if (data_inicio) params.set("data_inicio", data_inicio);
        if (data_fim) params.set("data_fim", data_fim);
      }
      params.set("limit", "50");

      const res = await api.get(`/api/listar-nfes?${params.toString()}`);
      const data = await res.json();
      if (data.sucesso) {
        setNfes(data.nfes || []);
        setTotalInfo({ total: data.total || 0, faixa: data.faixa_consultada || "", fonte: data.fonte || "" });
      } else {
        setMensagem({ tipo: "erro", texto: data.mensagem || "Erro ao carregar NF-es" });
      }
    } catch {
      setMensagem({ tipo: "erro", texto: "Erro ao conectar com o servidor" });
    } finally {
      setLoading(false);
    }
  };

  // AJAX: dispara busca ao mudar filtros com debounce para texto
  const handleFiltroChange = useCallback((campo, valor) => {
    setFiltros((prev) => {
      const novo = { ...prev, [campo]: valor };
      if (campo === "busca_texto") {
        // Debounce para digitação
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => carregarNfes(novo), 400);
      } else {
        // Dropdowns: busca imediata
        carregarNfes(novo);
      }
      return novo;
    });
  }, [filtros]);

  const limparFiltros = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const fLimpo = { busca_texto: "", status: "", periodo: "" };
    setFiltros(fLimpo);
    carregarNfes(fLimpo);
  };

  const sincronizarNfe = async (ref) => {
    try {
      const res = await api.post(`/api/sincronizar-nfe/${ref}`);
      const data = await res.json();
      if (data.sucesso) {
        setMensagem({ tipo: "sucesso", texto: `NF-e ${ref} sincronizada!` });
        carregarNfes();
      } else {
        setMensagem({ tipo: "erro", texto: data.mensagem || "Erro ao sincronizar" });
      }
    } catch {
      setMensagem({ tipo: "erro", texto: "Erro ao sincronizar NF-e" });
    }
  };

  const sincronizarTodas = async () => {
    setLoading(true);
    setMensagem(null);
    try {
      const res = await api.post("/api/sincronizar-nfes");
      const data = await res.json();
      if (data.sucesso) {
        setMensagem({
          tipo: "sucesso",
          texto: data.mensagem || "Sincronização concluída!",
        });
        await carregarNfes();
      } else {
        setMensagem({ tipo: "erro", texto: data.mensagem || "Erro na sincronização" });
      }
    } catch {
      setMensagem({ tipo: "erro", texto: "Erro ao conectar com o servidor" });
    } finally {
      setLoading(false);
    }
  };

  const abrirDetalhes = (nfe) => { setNfeSelecionada(nfe); setShowDetalhes(true); };

  const abrirCancelar = (nfe) => { setNfeSelecionada(nfe); setJustificativa(""); setShowCancelarModal(true); };

  const cancelarNfe = async () => {
    if (justificativa.length < 15) {
      setMensagem({ tipo: "erro", texto: "Justificativa deve ter no mínimo 15 caracteres." });
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/api/nfe/cancelar", { referencia: String(nfeSelecionada.referencia), justificativa });
      const data = await res.json();
      if (data.sucesso) {
        setMensagem({ tipo: "sucesso", texto: "Cancelamento solicitado!" });
        setShowCancelarModal(false);
        carregarNfes();
      } else {
        setMensagem({ tipo: "erro", texto: data.mensagem || "Erro ao cancelar" });
      }
    } catch {
      setMensagem({ tipo: "erro", texto: "Erro de conexão" });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "autorizado": return <CheckCircle size={14} color="#10b981" />;
      case "processando_autorizacao": return <Clock size={14} color="#f59e0b" />;
      case "erro_autorizacao": return <XCircle size={14} color="#ef4444" />;
      case "cancelado": return <XCircle size={14} color="#6b7280" />;
      default: return <AlertCircle size={14} color="#6b7280" />;
    }
  };

  const getStatusLabel = (status) => {
    const map = { autorizado: "Autorizado", processando_autorizacao: "Processando", erro_autorizacao: "Erro", cancelado: "Cancelado" };
    return map[status] || status || "Desconhecido";
  };

  const getDanfeUrl = (url) => {
    if (!url) return null;
    return url.startsWith("http") ? url : `https://api.focusnfe.com.br${url}`;
  };


  const statusOptions = [
    { value: "", label: "Todos os Status" },
    { value: "autorizado", label: "Autorizado" },
    { value: "processando_autorizacao", label: "Processando" },
    { value: "erro_autorizacao", label: "Erro" },
    { value: "cancelado", label: "Cancelado" },
  ];

  const periodoOptions = [
    { value: "", label: "Todo Período" },
    { value: "hoje", label: "Hoje" },
    { value: "7dias", label: "Últimos 7 dias" },
    { value: "15dias", label: "Últimos 15 dias" },
    { value: "30dias", label: "Últimos 30 dias" },
    { value: "mes_atual", label: "Mês atual" },
    { value: "mes_anterior", label: "Mês anterior" },
    { value: "90dias", label: "Últimos 90 dias" },
  ];

  const temFiltrosAtivos = filtros.busca_texto || filtros.status || filtros.periodo;

  return (
    <div className="list-nfe-container">
      <div className="list-nfe-header">
        <div>
          <h1>Notas Fiscais Eletrônicas</h1>
          <p className="list-subtitle">{totalInfo.total} nota(s) encontrada(s)</p>
        </div>
        <Button text="Atualizar" variant="secondary" onClick={sincronizarTodas} />
      </div>

      {mensagem && (
        <div className={`list-msg ${mensagem.tipo}`}>
          {mensagem.tipo === "sucesso" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span>{mensagem.texto}</span>
          <button onClick={() => setMensagem(null)}>×</button>
        </div>
      )}

      <Card className="card-filtros">
        <div className="filtros-row">
          <div className="filtro-busca">
            <Search size={18} className="filtro-busca-icon" />
            <input
              type="text"
              placeholder="Buscar por nome, CPF/CNPJ, referência, número..."
              value={filtros.busca_texto}
              onChange={(e) => handleFiltroChange("busca_texto", e.target.value)}
              className="filtro-busca-input"
            />
          </div>
          <div className="filtro-dropdown">
            <Dropdown options={statusOptions} value={filtros.status} onChange={(v) => handleFiltroChange("status", v)} />
          </div>
          <div className="filtro-dropdown">
            <Dropdown options={periodoOptions} value={filtros.periodo} onChange={(v) => handleFiltroChange("periodo", v)} />
          </div>
          {temFiltrosAtivos && (
            <button className="filtro-limpar" onClick={limparFiltros} title="Limpar filtros">
              <X size={18} />
            </button>
          )}
        </div>
      </Card>

      <Card>
        {loading ? (
          <Loading message="Carregando notas fiscais..." />
        ) : (
          <div className="table-wrapper">
            <Table>
              <thead>
                <tr>
                  <th>Ref</th>
                  <th>Número</th>
                  <th>Data</th>
                  <th>Destinatário</th>
                  <th>Valor</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {nfes.length === 0 ? (
                  <tr><td colSpan="7" className="empty-message">Nenhuma NF-e encontrada. Use os filtros acima para buscar.</td></tr>
                ) : (
                  nfes.map((nfe) => (
                    <tr key={nfe.referencia}>
                      <td data-label="Ref"><span className="ref-code">{nfe.referencia}</span></td>
                      <td data-label="Número">{nfe.numero || "-"}</td>
                      <td data-label="Data">{formatarData(nfe.data_emissao)}</td>
                      <td data-label="Destinatário">
                        <div className="dest-cell">
                          <span className="dest-nome">{nfe.destinatario_nome || "-"}</span>
                          {nfe.destinatario_cnpj && <span className="dest-doc">{formatarDocumento(nfe.destinatario_cnpj)}</span>}
                        </div>
                      </td>
                      <td data-label="Valor"><span className="valor">{formatarMoeda(nfe.valor_total)}</span></td>
                      <td data-label="Status">
                        <span className={`status-badge status-${nfe.status}`}>{getStatusIcon(nfe.status)} {getStatusLabel(nfe.status)}</span>
                      </td>
                      <td data-label="Ações">
                        <ActionsMenu actions={[
                          { icon: <Eye size={16} />, label: "Ver detalhes", onClick: () => abrirDetalhes(nfe) },
                          nfe.status === "autorizado" && getDanfeUrl(nfe.caminho_danfe) && { icon: <FileText size={16} />, label: "DANFE", href: getDanfeUrl(nfe.caminho_danfe) },
                          nfe.status === "autorizado" && getDanfeUrl(nfe.caminho_xml) && { icon: <Download size={16} />, label: "Download XML", href: getDanfeUrl(nfe.caminho_xml) },
                          nfe.status === "autorizado" && { separator: true },
                          nfe.status === "autorizado" && { icon: <X size={16} />, label: "Cancelar NF-e", onClick: () => abrirCancelar(nfe), variant: "danger" },
                          nfe.status?.includes("processando") && { icon: <RefreshCw size={16} />, label: "Atualizar status", onClick: () => sincronizarNfe(nfe.referencia) },
                          nfe.status?.includes("erro") && { icon: <Edit3 size={16} />, label: "Corrigir e Reenviar", onClick: () => navigate(`/emitir?corrigir=${nfe.referencia}`), variant: "warning" },
                        ]} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        )}
      </Card>

      {showDetalhes && nfeSelecionada && (
        <div className="modal-overlay" onClick={() => setShowDetalhes(false)}>
          <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Detalhes da NF-e</h3>
              <button className="modal-close" onClick={() => setShowDetalhes(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-section">
                  <h4>Informações Gerais</h4>
                  <div className="detail-row"><span className="detail-label">Referência:</span><span>{nfeSelecionada.referencia}</span></div>
                  <div className="detail-row"><span className="detail-label">Número:</span><span>{nfeSelecionada.numero || "Aguardando"}</span></div>
                  <div className="detail-row"><span className="detail-label">Série:</span><span>{nfeSelecionada.serie}</span></div>
                  <div className="detail-row"><span className="detail-label">Modelo:</span><span>{nfeSelecionada.modelo}</span></div>
                  {nfeSelecionada.chave_nfe && <div className="detail-row"><span className="detail-label">Chave:</span><span className="chave-nfe">{nfeSelecionada.chave_nfe}</span></div>}
                  <div className="detail-row"><span className="detail-label">Data:</span><span>{formatarData(nfeSelecionada.data_emissao)}</span></div>
                  <div className="detail-row"><span className="detail-label">Status:</span><span className={`status-badge status-${nfeSelecionada.status}`}>{getStatusIcon(nfeSelecionada.status)} {getStatusLabel(nfeSelecionada.status)}</span></div>
                </div>
                <div className="detail-section">
                  <h4>Destinatário</h4>
                  <div className="detail-row"><span className="detail-label">Nome:</span><span>{nfeSelecionada.destinatario_nome || "-"}</span></div>
                  <div className="detail-row"><span className="detail-label">CPF/CNPJ:</span><span>{formatarDocumento(nfeSelecionada.destinatario_cnpj)}</span></div>
                </div>
                <div className="detail-section full-width">
                  <h4>Valores</h4>
                  <div className="detail-row"><span className="detail-label">Valor Total:</span><span className="valor">{formatarMoeda(nfeSelecionada.valor_total)}</span></div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              {nfeSelecionada.status === "autorizado" && (
                <>
                  {getDanfeUrl(nfeSelecionada.caminho_danfe) && <a href={getDanfeUrl(nfeSelecionada.caminho_danfe)} target="_blank" rel="noreferrer" className="btn-link primary"><FileText size={16} /> DANFE</a>}
                  {getDanfeUrl(nfeSelecionada.caminho_xml) && <a href={getDanfeUrl(nfeSelecionada.caminho_xml)} target="_blank" rel="noreferrer" className="btn-link secondary"><Download size={16} /> XML</a>}
                </>
              )}
              <button className="btn-link" onClick={() => navigate(`/consultar?ref=${nfeSelecionada.referencia}`)}><ExternalLink size={16} /> Consultar Completa</button>
              <Button text="Fechar" variant="secondary" onClick={() => setShowDetalhes(false)} />
            </div>
          </div>
        </div>
      )}

      {showCancelarModal && nfeSelecionada && (
        <div className="modal-overlay" onClick={() => setShowCancelarModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header modal-header-danger">
              <h3>Cancelar NF-e</h3>
              <button className="modal-close" onClick={() => setShowCancelarModal(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="cancel-info">
                <p><strong>Referência:</strong> {nfeSelecionada.referencia}</p>
                <p><strong>Destinatário:</strong> {nfeSelecionada.destinatario_nome}</p>
                <p><strong>Valor:</strong> {formatarMoeda(nfeSelecionada.valor_total)}</p>
              </div>
              <div className="form-group">
                <label>Justificativa do Cancelamento *</label>
                <Input multiline value={justificativa} onChange={(e) => setJustificativa(e.target.value)} placeholder="Descreva o motivo do cancelamento (mínimo 15 caracteres)..." rows={4} />
                <span className="char-count">{justificativa.length}/15 caracteres mínimo</span>
              </div>
            </div>
            <div className="modal-footer">
              <Button text="Voltar" variant="secondary" onClick={() => setShowCancelarModal(false)} />
              <Button text={loading ? "Enviando..." : "Confirmar Cancelamento"} variant="danger" onClick={cancelarNfe} disabled={loading || justificativa.length < 15} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};