import { useState } from "react";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Loading } from "../components/Loading";
import { XCircle, AlertCircle, CheckCircle, FileText, Download } from "lucide-react";
import api from "../services/api";
import { API_URL } from "../config";
import "./InutilizarNfe.css";

export const InutilizarNfe = () => {
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [formData, setFormData] = useState({
    serie: "1",
    numero_inicial: "",
    numero_final: "",
    justificativa: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem(null);
    setResultado(null);

    const { numero_inicial, numero_final, justificativa } = formData;

    if (!numero_inicial || !numero_final) {
      setMensagem({ tipo: "erro", texto: "Informe os números inicial e final." });
      return;
    }

    if (parseInt(numero_inicial) > parseInt(numero_final)) {
      setMensagem({ tipo: "erro", texto: "O número inicial deve ser menor ou igual ao final." });
      return;
    }

    if (justificativa.trim().length < 15) {
      setMensagem({ tipo: "erro", texto: "A justificativa deve ter no mínimo 15 caracteres." });
      return;
    }

    const confirmMsg = `Confirma a inutilização da faixa ${numero_inicial} a ${numero_final}?\nEsta ação é irreversível!`;
    if (!window.confirm(confirmMsg)) return;

    setLoading(true);
    try {
      const res = await api.post("/api/nfe/inutilizar", formData);
      const data = await res.json();
      
      if (data.sucesso) {
        setMensagem({ tipo: "sucesso", texto: data.mensagem });
        setResultado(data.dados || data);
        setFormData({ serie: "1", numero_inicial: "", numero_final: "", justificativa: "" });
      } else {
        setMensagem({ tipo: "erro", texto: data.mensagem });
        if (data.dados) setResultado(data.dados);
      }
    } catch {
      setMensagem({ tipo: "erro", texto: "Erro de conexão com o servidor." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="inutilizar-container">
      <div className="inutilizar-header">
        <XCircle size={32} color="var(--primary)" />
        <div>
          <h1>Inutilizar NF-e</h1>
          <p>Inutilize uma faixa de numeração de NF-e</p>
        </div>
      </div>

      {mensagem && (
        <div className={`inutilizar-msg ${mensagem.tipo}`}>
          {mensagem.tipo === "sucesso" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{mensagem.texto}</span>
          <button onClick={() => setMensagem(null)}>×</button>
        </div>
      )}

      <Card>
        <form className="inutilizar-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <Input
              label="Série"
              name="serie"
              value={formData.serie}
              onChange={handleChange}
              readOnly
            />
          </div>

          <div className="form-row">
            <Input
              label="Número Inicial"
              name="numero_inicial"
              type="number"
              value={formData.numero_inicial}
              onChange={handleChange}
              placeholder="Ex: 1"
              min="1"
              required
            />
            <Input
              label="Número Final"
              name="numero_final"
              type="number"
              value={formData.numero_final}
              onChange={handleChange}
              placeholder="Ex: 10"
              min="1"
              required
            />
          </div>

          <div className="form-row full">
            <Input
              label="Justificativa"
              multiline
              name="justificativa"
              value={formData.justificativa}
              onChange={handleChange}
              placeholder="Informe a justificativa para inutilização (mínimo 15 caracteres)"
              rows={3}
              required
              minLength={15}
            />
              <span className={`char-count ${formData.justificativa.length < 15 ? "insuficiente" : ""}`}>
                {formData.justificativa.length}/15 mínimo
              </span>
          </div>

          <div className="form-actions">
            <Button
              text={loading ? "Processando..." : "Inutilizar Faixa"}
              type="submit"
              variant="danger"
              disabled={loading}
            />
          </div>
        </form>
      </Card>

      {loading && <Loading message="Processando inutilização..." />}

      {resultado && (
        <Card>
          <h3 className="resultado-titulo">Resultado da Inutilização</h3>
          <div className="resultado-grid">
            {resultado.status && (
              <div className="resultado-item">
                <label>Status</label>
                <span>{resultado.status}</span>
              </div>
            )}
            {resultado.mensagem_sefaz && (
              <div className="resultado-item full-width">
                <label>Mensagem SEFAZ</label>
                <span>{resultado.mensagem_sefaz}</span>
              </div>
            )}
            {resultado.protocolo && (
              <div className="resultado-item">
                <label>Protocolo</label>
                <span>{resultado.protocolo}</span>
              </div>
            )}
          </div>

          {resultado.caminho_xml && (
            <div className="resultado-acoes">
              <a href={resultado.caminho_xml.startsWith("http") ? resultado.caminho_xml : `https://api.focusnfe.com.br${resultado.caminho_xml}`} target="_blank" rel="noreferrer" className="btn-download">
                <Download size={16} /> Download XML
              </a>
            </div>
          )}

          <details className="resposta-completa">
            <summary>Ver resposta completa</summary>
            <pre>{JSON.stringify(resultado, null, 2)}</pre>
          </details>
        </Card>
      )}
    </div>
  );
};
