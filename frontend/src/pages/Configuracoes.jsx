import { useState, useEffect } from "react";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { RefreshCw, Building } from "lucide-react";
import api from "../services/api";
import "./Configuracoes.css";

export const Configuracoes = () => {
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState(null);
  
  const [formData, setFormData] = useState({
    // Dados da Empresa
    cnpj_prestador: "",
    razao_social_prestador: "",
    nome_fantasia: "",
    inscricao_estadual: "",
    
    // Endereço
    codigo_municipio_prestador: "",
    cep_prestador: "",
    logradouro_prestador: "",
    numero_prestador: "",
    complemento_prestador: "",
    bairro_prestador: "",
    uf_prestador: "",
  });

  // Carrega dados do prestador
  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/configuracoes");
      const result = await response.json();
      
      if (result.sucesso) {
        const dados = result.dados;
        setFormData({
          cnpj_prestador: dados.cnpj_prestador || "",
          razao_social_prestador: dados.razao_social_prestador || "",
          nome_fantasia: dados.nome_fantasia || "",
          inscricao_estadual: dados.inscricao_estadual || "",
          codigo_municipio_prestador: dados.codigo_municipio_prestador || "",
          cep_prestador: dados.cep_prestador || "",
          logradouro_prestador: dados.logradouro_prestador || "",
          numero_prestador: dados.numero_prestador || "",
          complemento_prestador: dados.complemento_prestador || "",
          bairro_prestador: dados.bairro_prestador || "",
          uf_prestador: dados.uf_prestador || "",
        });
      }
    } catch (error) {
      setMensagem({ tipo: "erro", texto: "Erro ao carregar dados" });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="configuracoes-container">
      <div className="configuracoes-header">
        <div>
          <h1>Configurações do Sistema</h1>
          <p className="configuracoes-subtitle">
            Visualize os dados do emitente configurados no sistema
          </p>
        </div>
        <div className="configuracoes-acoes">
          <Button
            text="Recarregar"
            variant="secondary"
            icon={RefreshCw}
            onClick={carregarDados}
            disabled={loading}
          />
        </div>
      </div>

      {mensagem && (
        <div className={`mensagem mensagem-${mensagem.tipo}`}>
          {mensagem.texto}
          <button className="mensagem-close" onClick={() => setMensagem(null)}>
            ×
          </button>
        </div>
      )}

      <form className="form-configuracoes">
        {/* Aviso de dados fixos */}
        <div className="config-aviso">
          <span>ℹ️</span>
          <p>Os dados do emitente são configurados no sistema e não podem ser alterados por aqui. Para alterações, contate o administrador.</p>
        </div>

        {/* Dados da Empresa */}
        <Card>
          <fieldset className="form-section">
            <legend>
              <Building size={18} />
              Dados da Empresa (Emitente)
            </legend>
            
            <div className="form-row">
              <div className="form-group">
                <Input
                  label="CNPJ"
                  name="cnpj_prestador"
                  value={formData.cnpj_prestador}
                  onChange={handleInputChange}
                  placeholder="00.000.000/0000-00"
                  disabled
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group flex-2">
                <Input
                  label="Razão Social"
                  name="razao_social_prestador"
                  value={formData.razao_social_prestador}
                  onChange={handleInputChange}
                  placeholder="Nome empresarial completo"
                  disabled
                />
              </div>
              <div className="form-group">
                <Input
                  label="Nome Fantasia"
                  name="nome_fantasia"
                  value={formData.nome_fantasia}
                  onChange={handleInputChange}
                  placeholder="Nome fantasia"
                  disabled
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <Input
                  label="Inscrição Estadual"
                  name="inscricao_estadual"
                  value={formData.inscricao_estadual}
                  onChange={handleInputChange}
                  placeholder="Número da IE"
                  disabled
                />
              </div>
            </div>
          </fieldset>
        </Card>

        {/* Endereço */}
        <Card>
          <fieldset className="form-section">
            <legend>Endereço</legend>
            
            <div className="form-row">
              <div className="form-group">
                <Input
                  label="CEP"
                  name="cep_prestador"
                  value={formData.cep_prestador}
                  onChange={handleInputChange}
                  placeholder="00000-000"
                  disabled
                />
              </div>
              <div className="form-group">
                <Input
                  label="Código Município (IBGE)"
                  name="codigo_municipio_prestador"
                  value={formData.codigo_municipio_prestador}
                  onChange={handleInputChange}
                  placeholder="7 dígitos"
                  disabled
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group flex-2">
                <Input
                  label="Logradouro"
                  name="logradouro_prestador"
                  value={formData.logradouro_prestador}
                  onChange={handleInputChange}
                  placeholder="Rua, avenida, etc."
                  disabled
                />
              </div>
              <div className="form-group">
                <Input
                  label="Número"
                  name="numero_prestador"
                  value={formData.numero_prestador}
                  onChange={handleInputChange}
                  placeholder="Nº"
                  disabled
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <Input
                  label="Complemento"
                  name="complemento_prestador"
                  value={formData.complemento_prestador}
                  onChange={handleInputChange}
                  placeholder="Sala, andar, etc."
                />
              </div>
              <div className="form-group">
                <Input
                  label="Bairro"
                  name="bairro_prestador"
                  value={formData.bairro_prestador}
                  onChange={handleInputChange}
                  placeholder="Nome do bairro"
                  disabled
                />
              </div>
              <div className="form-group" style={{ maxWidth: "100px" }}>
                <Input
                  label="UF"
                  name="uf_prestador"
                  value={formData.uf_prestador}
                  onChange={handleInputChange}
                  placeholder="SP"
                  maxLength={2}
                  disabled
                />
              </div>
            </div>
          </fieldset>
        </Card>

      </form>
    </div>
  );
};