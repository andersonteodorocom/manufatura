import { useState } from "react";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Loading } from "../components/Loading";
import { Search, FileText, Download, Copy, AlertCircle, CheckCircle, XCircle, Edit3 } from "lucide-react";
import api from "../services/api";
import { formatarMoeda } from "../utils/mascaras";
import "./ConsultarNfe.css";

export const ConsultarNfe = () => {
  const [loading, setLoading] = useState(false);
  const [ref, setRef] = useState("");
  const [resultado, setResultado] = useState(null);
  const [mensagem, setMensagem] = useState(null);

  // CC-e
  const [showCCeForm, setShowCCeForm] = useState(false);
  const [correcaoTexto, setCorrecaoTexto] = useState("");
  const [loadingCCe, setLoadingCCe] = useState(false);

  // Cancelamento
  const [showCancelarForm, setShowCancelarForm] = useState(false);
  const [justificativa, setJustificativa] = useState("");
  const [loadingCancelar, setLoadingCancelar] = useState(false);

  const consultar = async (e) => {
    e?.preventDefault();
    if (!ref.trim()) {
      setMensagem({ tipo: "erro", texto: "Informe a referência da NF-e." });
      return;
    }
    setLoading(true);
    setMensagem(null);
    setResultado(null);
    setShowCCeForm(false);
    setShowCancelarForm(false);

    try {
      const res = await api.get(`/api/nfe/consultar/${ref.trim()}`);
      const data = await res.json();
      if (data.sucesso) {
        setResultado(data.dados || data);
      } else {
        setMensagem({ tipo: "erro", texto: data.mensagem || "NF-e não encontrada." });
      }
    } catch {
      setMensagem({ tipo: "erro", texto: "Erro de conexão com o servidor." });
    } finally {
      setLoading(false);
    }
  };

  const copiarChave = () => {
    if (resultado?.chave_nfe) {
      navigator.clipboard.writeText(resultado.chave_nfe);
      setMensagem({ tipo: "sucesso", texto: "Chave copiada!" });
      setTimeout(() => setMensagem(null), 2000);
    }
  };

  const getUrlCompleta = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `https://api.focusnfe.com.br${url}`;
  };

  const enviarCCe = async () => {
    if (correcaoTexto.trim().length < 15) {
      setMensagem({ tipo: "erro", texto: "A correção deve ter no mínimo 15 caracteres." });
      return;
    }
    if (!window.confirm("Confirma o envio da Carta de Correção?")) return;

    setLoadingCCe(true);
    try {
      const res = await api.post("/api/nfe/carta-correcao", { ref: resultado.referencia || ref, correcao: correcaoTexto });
      const data = await res.json();
      setMensagem({ tipo: data.sucesso ? "sucesso" : "erro", texto: data.mensagem });
      if (data.sucesso) {
        setShowCCeForm(false);
        setCorrecaoTexto("");
        consultar();
      }
    } catch {
      setMensagem({ tipo: "erro", texto: "Erro ao enviar CC-e." });
    } finally {
      setLoadingCCe(false);
    }
  };

  const cancelarNfe = async () => {
    if (justificativa.trim().length < 15) {
      setMensagem({ tipo: "erro", texto: "Justificativa deve ter no mínimo 15 caracteres." });
      return;
    }
    if (!window.confirm("Confirma o CANCELAMENTO desta NF-e? Esta ação não pode ser desfeita.")) return;

    setLoadingCancelar(true);
    try {
      const res = await api.post("/api/nfe/cancelar", { ref: resultado.referencia || ref, justificativa });
      const data = await res.json();
      setMensagem({ tipo: data.sucesso ? "sucesso" : "erro", texto: data.mensagem });
      if (data.sucesso) {
        setShowCancelarForm(false);
        setJustificativa("");
        consultar();
      }
    } catch {
      setMensagem({ tipo: "erro", texto: "Erro ao cancelar NF-e." });
    } finally {
      setLoadingCancelar(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "autorizado": return <CheckCircle size={20} color="#10b981" />;
      case "cancelado": return <XCircle size={20} color="#ef4444" />;
      case "erro_autorizacao": return <AlertCircle size={20} color="#f59e0b" />;
      default: return <FileText size={20} color="#6b7280" />;
    }
  };

  const getStatusLabel = (status) => {
    const labels = { autorizado: "Autorizada", cancelado: "Cancelada", erro_autorizacao: "Erro", processando_autorizacao: "Processando" };
    return labels[status] || status;
  };

  return (
    <div className="consultar-container">
      <div className="consultar-header">
        <h1>Consultar NF-e</h1>
        <p>Consulte uma nota fiscal por sua referência</p>
      </div>

      {mensagem && (
        <div className={`consultar-msg ${mensagem.tipo}`}>
          {mensagem.texto}
          <button onClick={() => setMensagem(null)}>×</button>
        </div>
      )}

      <Card>
        <form className="consultar-form" onSubmit={consultar}>
          <Input
            label="Referência da NF-e"
            name="ref"
            value={ref}
            onChange={(e) => setRef(e.target.value)}
            placeholder="Ex: 1590"
            autoFocus
          />
          <Button text={loading ? "Consultando..." : "Consultar"} type="submit" variant="primary" disabled={loading} />
        </form>
      </Card>

      {loading && <Loading message="Consultando NF-e..." />}

      {resultado && (
        <div className="consultar-resultado">
          <Card>
            <div className="resultado-header">
              {getStatusIcon(resultado.status)}
              <div>
                <h3>NF-e {resultado.numero ? `Nº ${resultado.numero}` : `REF ${resultado.referencia || ref}`}</h3>
                <span className={`status-badge status-${resultado.status}`}>
                  {getStatusLabel(resultado.status)}
                </span>
              </div>
            </div>

            <div className="resultado-grid">
              {resultado.numero && <div className="resultado-item"><label>Número</label><span>{resultado.numero}</span></div>}
              {resultado.serie && <div className="resultado-item"><label>Série</label><span>{resultado.serie}</span></div>}
              {resultado.modelo && <div className="resultado-item"><label>Modelo</label><span>{resultado.modelo}</span></div>}
              {resultado.chave_nfe && (
                <div className="resultado-item full-width">
                  <label>Chave de Acesso</label>
                  <div className="chave-container">
                    <code>{resultado.chave_nfe}</code>
                    <button className="btn-icon" onClick={copiarChave} title="Copiar"><Copy size={16} /></button>
                  </div>
                </div>
              )}
              {resultado.mensagem_sefaz && (
                <div className="resultado-item full-width">
                  <label>Mensagem SEFAZ</label>
                  <span>{resultado.mensagem_sefaz}</span>
                </div>
              )}
            </div>

            {/* Downloads */}
            <div className="resultado-acoes">
              {getUrlCompleta(resultado.caminho_danfe) && (
                <a href={getUrlCompleta(resultado.caminho_danfe)} target="_blank" rel="noreferrer" className="btn-download">
                  <Download size={16} /> DANFE (PDF)
                </a>
              )}
              {getUrlCompleta(resultado.caminho_xml_nota_fiscal) && (
                <a href={getUrlCompleta(resultado.caminho_xml_nota_fiscal)} target="_blank" rel="noreferrer" className="btn-download">
                  <FileText size={16} /> XML
                </a>
              )}
            </div>

            {/* Ações para NF-e autorizada */}
            {resultado.status === "autorizado" && (
              <div className="resultado-acoes-secundarias">
                <button className="btn-acao" onClick={() => { setShowCCeForm(!showCCeForm); setShowCancelarForm(false); }}>
                  <Edit3 size={16} /> Carta de Correção (CC-e)
                </button>
                <button className="btn-acao danger" onClick={() => { setShowCancelarForm(!showCancelarForm); setShowCCeForm(false); }}>
                  <XCircle size={16} /> Cancelar NF-e
                </button>
              </div>
            )}

            {/* Formulário CC-e */}
            {showCCeForm && (
              <div className="form-evento">
                <h4>Carta de Correção Eletrônica</h4>
                <Input
                  multiline
                  value={correcaoTexto}
                  onChange={(e) => setCorrecaoTexto(e.target.value)}
                  placeholder="Descreva a correção (mínimo 15 caracteres)..."
                  rows={4}
                  maxLength={1000}
                />
                <span className="char-count">{correcaoTexto.length}/1000</span>
                <div className="form-evento-acoes">
                  <Button text={loadingCCe ? "Enviando..." : "Enviar CC-e"} variant="primary" onClick={enviarCCe} disabled={loadingCCe} />
                  <Button text="Cancelar" variant="secondary" onClick={() => setShowCCeForm(false)} />
                </div>
              </div>
            )}

            {/* Formulário Cancelamento */}
            {showCancelarForm && (
              <div className="form-evento">
                <h4>Cancelar NF-e</h4>
                <p className="aviso-cancelamento">⚠️ O cancelamento é irreversível. A justificativa deve ter no mínimo 15 caracteres.</p>
                <Input
                  multiline
                  value={justificativa}
                  onChange={(e) => setJustificativa(e.target.value)}
                  placeholder="Justificativa do cancelamento (mínimo 15 caracteres)..."
                  rows={3}
                  maxLength={255}
                />
                <span className="char-count">{justificativa.length}/255</span>
                <div className="form-evento-acoes">
                  <Button text={loadingCancelar ? "Cancelando..." : "Confirmar Cancelamento"} variant="danger" onClick={cancelarNfe} disabled={loadingCancelar} />
                  <Button text="Voltar" variant="secondary" onClick={() => setShowCancelarForm(false)} />
                </div>
              </div>
            )}

            {/* Erro - Link para correção */}
            {resultado.status === "erro_autorizacao" && (
              <div className="resultado-erro-acoes">
                <p>Esta NF-e apresentou erro na autorização.</p>
                {resultado.erro_validacao && <p className="erro-detalhe">{resultado.erro_validacao}</p>}
                <a href={`/emitir?corrigir=${resultado.referencia || ref}`} className="btn-corrigir">
                  Corrigir e Reenviar
                </a>
              </div>
            )}
          </Card>

          {/* Resposta completa (colapsável) */}
          <details className="resposta-completa">
            <summary>Ver resposta completa da API</summary>
            <pre>{JSON.stringify(resultado, null, 2)}</pre>
          </details>
        </div>
      )}
    </div>
  );
};
