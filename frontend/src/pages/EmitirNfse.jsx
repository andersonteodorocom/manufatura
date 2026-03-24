import { useState, useEffect } from "react";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Dropdown } from "../components/Dropdown";
import { Calendar } from "../components/Calendar";
import "./EmitirNfse.css";

const API_URL = "http://localhost:5000/api";


export const EmitirNfse = () => {
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState(null);
  const [buscaCliente, setBuscaCliente] = useState("");
  const [buscaServico, setBuscaServico] = useState("");
  const [clientesCatalogo, setClientesCatalogo] = useState([]);
  const [servicosCatalogo, setServicosCatalogo] = useState([]);
  const [prestadorData, setPrestadorData] = useState({});
  const [codigosListas, setCodigosListas] = useState({
    simplesNacional: [],
    regimeEspecial: [],
    tributacaoIss: [],
    retencaoIss: [],
    consumidorFinal: [],
    indicadorDestinatario: [],
  });

  // Estado do formulário
  const [formData, setFormData] = useState({
    // DPS
    serie_dps: "1",
    numero_dps: "",
    // Usa data local (não UTC) para evitar problemas de fuso horário
    data_competencia: new Date().toLocaleDateString('en-CA'), // Formato YYYY-MM-DD
    emitente_dps: "1",

    // Tomador
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

    // Serviço
    codigo_municipio_prestacao: "",
    codigo_tributacao_nacional_iss: "",
    codigo_tributacao_municipal_iss: "",
    descricao_servico: "",

    // Valores
    valor_servico: "",
    desconto_incondicionado: "",
    desconto_condicionado: "",

    // Tributos
    tributacao_iss: "1",
    tipo_retencao_iss: "1",
    percentual_aliquota_relativa_municipio: "",

    // Informações complementares
    informacoes_complementares: "",

    // Reforma Tributária
    finalidade_emissao: "0",
    consumidor_final: "0",
    indicador_destinatario: "0",
  });

  // Carrega dados do prestador e códigos
  useEffect(() => {
    const carregarDados = async () => {
      try {
        // Carrega dados do prestador
        const prestadorRes = await fetch(`${API_URL}/nfse/prestador`);
        const prestadorJson = await prestadorRes.json();
        if (prestadorJson.sucesso) {
          setPrestadorData(prestadorJson.dados);
          // Preenche dados padrão do prestador no formulário
          setFormData((prev) => ({
            ...prev,
            // Série DPS padrão configurada no backend
            serie_dps: prestadorJson.dados.serie_dps_padrao || prev.serie_dps,
            // Código do município de prestação (IBGE)
            codigo_municipio_prestacao:
              prestadorJson.dados.codigo_municipio_emissora || 
              prestadorJson.dados.codigo_municipio_prestador || 
              prev.codigo_municipio_prestacao,
            // Código de Tributação Nacional (LC 116)
            codigo_tributacao_nacional_iss:
              prestadorJson.dados.codigo_tributacao_nacional || prev.codigo_tributacao_nacional_iss,
            // Código de Tributação Municipal
            codigo_tributacao_municipal_iss:
              prestadorJson.dados.codigo_tributacao_municipal || prev.codigo_tributacao_municipal_iss,
          }));
        }

        // Carrega listas de códigos
        const [simplesRes, regimeRes, tribIssRes, retIssRes, consFinRes, indDestRes] = await Promise.all(
          [
            fetch(`${API_URL}/nfse/codigos/simples-nacional`),
            fetch(`${API_URL}/nfse/codigos/regime-especial`),
            fetch(`${API_URL}/nfse/codigos/tributacao-iss`),
            fetch(`${API_URL}/nfse/codigos/tipo-retencao-iss`),
            fetch(`${API_URL}/nfse/codigos/consumidor-final`),
            fetch(`${API_URL}/nfse/codigos/indicador-destinatario`),
          ]
        );

        const [simplesJson, regimeJson, tribIssJson, retIssJson, consFinJson, indDestJson] =
          await Promise.all([
            simplesRes.json(),
            regimeRes.json(),
            tribIssRes.json(),
            retIssRes.json(),
            consFinRes.json(),
            indDestRes.json(),
          ]);

        setCodigosListas({
          simplesNacional: simplesJson.dados || [],
          regimeEspecial: regimeJson.dados || [],
          tributacaoIss: tribIssJson.dados || [],
          retencaoIss: retIssJson.dados || [],
          consumidorFinal: consFinJson.dados || [],
          indicadorDestinatario: indDestJson.dados || [],
        });
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    };

    carregarDados();
  }, []);

  useEffect(() => {
    const carregarCatalogos = async () => {
      try {
        const [clientesRes, servicosRes] = await Promise.all([
          fetch(`${API_URL}/clientes`),
          fetch(`${API_URL}/servicos`),
        ]);

        const [clientesJson, servicosJson] = await Promise.all([
          clientesRes.json(),
          servicosRes.json(),
        ]);

        if (clientesJson.sucesso) {
          setClientesCatalogo(clientesJson.dados || []);
        }

        if (servicosJson.sucesso) {
          setServicosCatalogo(servicosJson.dados || []);
        }
      } catch (error) {
        console.error("Erro ao carregar catalogos:", error);
      }
    };

    carregarCatalogos();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDropdownChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const clientesFiltrados = buscaCliente.trim()
    ? clientesCatalogo.filter((cliente) => {
        const termo = buscaCliente.toLowerCase();
        return (
          (cliente.razao_social_tomador || "").toLowerCase().includes(termo) ||
          (cliente.cnpj_tomador || "").includes(buscaCliente) ||
          (cliente.cpf_tomador || "").includes(buscaCliente) ||
          (cliente.email_tomador || "").toLowerCase().includes(termo)
        );
      }).slice(0, 6)
    : [];

  const servicosFiltrados = buscaServico.trim()
    ? servicosCatalogo.filter((servico) => {
        const termo = buscaServico.toLowerCase();
        return (
          (servico.descricao_servico || "").toLowerCase().includes(termo) ||
          (servico.codigo_tributacao_nacional_iss || "").toLowerCase().includes(termo) ||
          (servico.codigo_tributacao_municipal_iss || "").toLowerCase().includes(termo)
        );
      }).slice(0, 6)
    : [];

  const aplicarCliente = (cliente) => {
    setFormData((prev) => ({
      ...prev,
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
    }));
    setBuscaCliente("");
  };

  const aplicarServico = (servico) => {
    setFormData((prev) => ({
      ...prev,
      codigo_municipio_prestacao: servico.codigo_municipio_prestacao || "",
      codigo_tributacao_nacional_iss:
        servico.codigo_tributacao_nacional_iss || "",
      codigo_tributacao_municipal_iss:
        servico.codigo_tributacao_municipal_iss || "",
      descricao_servico: servico.descricao_servico || "",
      valor_servico: servico.valor_servico || "",
      desconto_incondicionado: servico.desconto_incondicionado || "",
      desconto_condicionado: servico.desconto_condicionado || "",
      tributacao_iss: servico.tributacao_iss || prev.tributacao_iss,
      tipo_retencao_iss: servico.tipo_retencao_iss || prev.tipo_retencao_iss,
      percentual_aliquota_relativa_municipio:
        servico.percentual_aliquota_relativa_municipio || "",
    }));
    setBuscaServico("");
  };

  const formatarMoeda = (valor) => {
    if (!valor) return "";
    return parseFloat(valor).toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensagem(null);

    try {
      // Monta o payload conforme o schema esperado pelo backend
      const payload = {
        serie_dps: formData.serie_dps,
        numero_dps: formData.numero_dps,
        data_competencia: formData.data_competencia,
        emitente_dps: formData.emitente_dps,
        codigo_municipio_emissora:
          prestadorData.codigo_municipio_prestador || "",

        tomador: {
          cnpj_tomador: formData.cnpj_tomador || null,
          cpf_tomador: formData.cpf_tomador || null,
          razao_social_tomador: formData.razao_social_tomador,
          email_tomador: formData.email_tomador,
          telefone_tomador: formData.telefone_tomador,
          logradouro_tomador: formData.logradouro_tomador,
          numero_tomador: formData.numero_tomador,
          complemento_tomador: formData.complemento_tomador,
          bairro_tomador: formData.bairro_tomador,
          cep_tomador: formData.cep_tomador,
          codigo_municipio_tomador: formData.codigo_municipio_tomador,
          uf_tomador: formData.uf_tomador,
        },

        servico: {
          codigo_municipio_prestacao: formData.codigo_municipio_prestacao,
          codigo_tributacao_nacional_iss:
            formData.codigo_tributacao_nacional_iss,
          codigo_tributacao_municipal_iss:
            formData.codigo_tributacao_municipal_iss || null,
          descricao_servico: formData.descricao_servico,
        },

        valores: {
          valor_servico: formatarMoeda(formData.valor_servico),
          desconto_incondicionado: formData.desconto_incondicionado
            ? formatarMoeda(formData.desconto_incondicionado)
            : null,
          desconto_condicionado: formData.desconto_condicionado
            ? formatarMoeda(formData.desconto_condicionado)
            : null,
        },

        tributo_iss: {
          tributacao_iss: formData.tributacao_iss,
          tipo_retencao_iss: formData.tipo_retencao_iss,
          percentual_aliquota_relativa_municipio:
            formData.percentual_aliquota_relativa_municipio || null,
        },

        // informacoes_complementares: formData.informacoes_complementares || null,
        // finalidade_emissao: formData.finalidade_emissao,
        // consumidor_final: formData.consumidor_final,
        // indicador_destinatario: formData.indicador_destinatario,
      };

      const response = await fetch(`${API_URL}/nfse/emitir`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.sucesso) {
        setMensagem({
          tipo: "sucesso",
          texto: `NF-e enviada com sucesso! Referência: ${result.referencia}`,
        });
        // Limpa alguns campos após sucesso
        setFormData((prev) => ({
          ...prev,
          numero_dps: "",
          cnpj_tomador: "",
          cpf_tomador: "",
          razao_social_tomador: "",
          descricao_servico: "",
          valor_servico: "",
          // informacoes_complementares: "",
        }));
      } else {
        setMensagem({
          tipo: "erro",
          texto: `Erro: ${result.mensagem}. ${result.erros?.join(", ") || ""}`,
        });
      }
    } catch (error) {
      setMensagem({
        tipo: "erro",
        texto: `Erro de conexão: ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="emitir-nfse-container">
      <Card title="Emitir NF-e Nacional">
        {mensagem && (
          <div className={`mensagem ${mensagem.tipo}`}>{mensagem.texto}</div>
        )}

        <form onSubmit={handleSubmit} className="form-nfse">
          {/* Seção: Dados da DPS */}
          <fieldset className="form-section">
            <legend>Dados da DPS</legend>
            <div className="form-row">
              <div className="form-group">
                <label>Série DPS *</label>
                <Input
                  type="text"
                  name="serie_dps"
                  value={formData.serie_dps}
                  onChange={handleChange}
                  maxLength={5}
                  required
                />
              </div>
              <div className="form-group">
                <label>Número DPS *</label>
                <Input
                  type="text"
                  name="numero_dps"
                  value={formData.numero_dps}
                  onChange={handleChange}
                  maxLength={15}
                  required
                />
              </div>
              <div className="form-group">
                <Calendar
                  label="Data Competência"
                  name="data_competencia"
                  value={formData.data_competencia}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </fieldset>

          {/* Seção: Dados do Prestador (somente leitura) */}
          <fieldset className="form-section">
            <legend>Dados do Prestador (Configurado no Sistema)</legend>
            <div className="prestador-info">
              <p>
                <strong>Razão Social:</strong>{" "}
                {prestadorData.razao_social_prestador || "Não configurado"}
              </p>
              <p>
                <strong>CNPJ:</strong>{" "}
                {prestadorData.cnpj_prestador || "Não configurado"}
              </p>
              <p>
                <strong>Inscrição Municipal:</strong>{" "}
                {prestadorData.inscricao_municipal_prestador ||
                  "Não configurado"}
              </p>
              <p>
                <strong>Município:</strong>{" "}
                {prestadorData.codigo_municipio_prestador || "Não configurado"}
              </p>
            </div>
          </fieldset>

          {/* Seção: Dados do Tomador */}
          <fieldset className="form-section">
            <legend>Dados do Tomador</legend>
            <div className="form-row">
              <div className="form-group full-width">
                <label>Pesquisar cliente</label>
                <div className="nfse-search">
                  <input
                    type="text"
                    className="nfse-search-input"
                    placeholder="Buscar por nome, CNPJ/CPF ou email"
                    value={buscaCliente}
                    onChange={(e) => setBuscaCliente(e.target.value)}
                  />
                  {buscaCliente.trim() && (
                    <div className="nfse-search-results">
                      {clientesFiltrados.length > 0 ? (
                        clientesFiltrados.map((cliente) => (
                          <button
                            key={cliente.id}
                            type="button"
                            className="nfse-search-item"
                            onClick={() => aplicarCliente(cliente)}
                          >
                            <div className="nfse-search-title">
                              {cliente.razao_social_tomador || "Sem nome"}
                            </div>
                            <div className="nfse-search-meta">
                              {(cliente.cnpj_tomador || cliente.cpf_tomador) || "-"} · {cliente.email_tomador || "-"}
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="nfse-search-empty">
                          Nenhum cliente encontrado
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>CNPJ do Tomador</label>
                <Input
                  type="text"
                  name="cnpj_tomador"
                  value={formData.cnpj_tomador}
                  onChange={handleChange}
                  maxLength={14}
                  placeholder="Apenas números"
                />
              </div>
              <div className="form-group">
                <label>CPF do Tomador</label>
                <Input
                  type="text"
                  name="cpf_tomador"
                  value={formData.cpf_tomador}
                  onChange={handleChange}
                  maxLength={11}
                  placeholder="Apenas números"
                />
              </div>
              <div className="form-group flex-2">
                <label>Razão Social / Nome *</label>
                <Input
                  type="text"
                  name="razao_social_tomador"
                  value={formData.razao_social_tomador}
                  onChange={handleChange}
                  maxLength={150}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Email</label>
                <Input
                  type="email"
                  name="email_tomador"
                  value={formData.email_tomador}
                  onChange={handleChange}
                  maxLength={80}
                />
              </div>
              <div className="form-group">
                <label>Telefone</label>
                <Input
                  type="text"
                  name="telefone_tomador"
                  value={formData.telefone_tomador}
                  onChange={handleChange}
                  maxLength={20}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group flex-2">
                <label>Logradouro</label>
                <Input
                  type="text"
                  name="logradouro_tomador"
                  value={formData.logradouro_tomador}
                  onChange={handleChange}
                  maxLength={255}
                />
              </div>
              <div className="form-group">
                <label>Número</label>
                <Input
                  type="text"
                  name="numero_tomador"
                  value={formData.numero_tomador}
                  onChange={handleChange}
                  maxLength={60}
                />
              </div>
              <div className="form-group">
                <label>Complemento</label>
                <Input
                  type="text"
                  name="complemento_tomador"
                  value={formData.complemento_tomador}
                  onChange={handleChange}
                  maxLength={156}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Bairro</label>
                <Input
                  type="text"
                  name="bairro_tomador"
                  value={formData.bairro_tomador}
                  onChange={handleChange}
                  maxLength={60}
                />
              </div>
              <div className="form-group">
                <label>CEP</label>
                <Input
                  type="text"
                  name="cep_tomador"
                  value={formData.cep_tomador}
                  onChange={handleChange}
                  maxLength={8}
                  placeholder="Apenas números"
                />
              </div>
              <div className="form-group">
                <label>Código Município (IBGE)</label>
                <Input
                  type="text"
                  name="codigo_municipio_tomador"
                  value={formData.codigo_municipio_tomador}
                  onChange={handleChange}
                  maxLength={7}
                  placeholder="7 dígitos"
                />
              </div>
              <div className="form-group">
                <label>UF</label>
                <Input
                  type="text"
                  name="uf_tomador"
                  value={formData.uf_tomador}
                  onChange={handleChange}
                  maxLength={2}
                  placeholder="SP"
                />
              </div>
            </div>
          </fieldset>

          {/* Seção: Dados do Serviço */}
          <fieldset className="form-section">
            <legend>Dados do Serviço</legend>
            <div className="form-row">
              <div className="form-group full-width">
                <label>Pesquisar servico</label>
                <div className="nfse-search">
                  <input
                    type="text"
                    className="nfse-search-input"
                    placeholder="Buscar por descricao ou codigo"
                    value={buscaServico}
                    onChange={(e) => setBuscaServico(e.target.value)}
                  />
                  {buscaServico.trim() && (
                    <div className="nfse-search-results">
                      {servicosFiltrados.length > 0 ? (
                        servicosFiltrados.map((servico) => (
                          <button
                            key={servico.id}
                            type="button"
                            className="nfse-search-item"
                            onClick={() => aplicarServico(servico)}
                          >
                            <div className="nfse-search-title">
                              {servico.descricao_servico || "Sem descrição"}
                            </div>
                            <div className="nfse-search-meta">
                              {servico.codigo_tributacao_nacional_iss || "-"}
                              {servico.codigo_tributacao_municipal_iss
                                ? ` · ${servico.codigo_tributacao_municipal_iss}`
                                : ""}
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="nfse-search-empty">
                          Nenhum servico encontrado
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Código Município Prestação (IBGE) *</label>
                <Input
                  type="text"
                  name="codigo_municipio_prestacao"
                  value={formData.codigo_municipio_prestacao}
                  onChange={handleChange}
                  maxLength={7}
                  required
                />
              </div>
              <div className="form-group">
                <label>Código Tributação Nacional (LC 116) *</label>
                <Input
                  type="text"
                  name="codigo_tributacao_nacional_iss"
                  value={formData.codigo_tributacao_nacional_iss}
                  onChange={handleChange}
                  maxLength={6}
                  placeholder="Ex: 171901 (6 dígitos)"
                  required
                />
              </div>
              <div className="form-group">
                <label>Código Tributação Municipal</label>
                <Input
                  type="text"
                  name="codigo_tributacao_municipal_iss"
                  value={formData.codigo_tributacao_municipal_iss}
                  onChange={handleChange}
                  maxLength={10}
                  placeholder="Ex: 03093"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group full-width">
                <label>Descrição do Serviço *</label>
                <Input
                  multiline
                  name="descricao_servico"
                  value={formData.descricao_servico}
                  onChange={handleChange}
                  maxLength={1000}
                  rows={4}
                  required
                />
              </div>
            </div>
          </fieldset>

          {/* Seção: Valores */}
          <fieldset className="form-section">
            <legend>Valores</legend>
            <div className="form-row">
              <div className="form-group">
                <label>Valor do Serviço (R$) *</label>
                <Input
                  type="number"
                  name="valor_servico"
                  value={formData.valor_servico}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              <div className="form-group">
                <label>Desconto Incondicionado (R$)</label>
                <Input
                  type="number"
                  name="desconto_incondicionado"
                  value={formData.desconto_incondicionado}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                />
              </div>
              <div className="form-group">
                <label>Desconto Condicionado (R$)</label>
                <Input
                  type="number"
                  name="desconto_condicionado"
                  value={formData.desconto_condicionado}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                />
              </div>
            </div>
          </fieldset>

          {/* Seção: Tributação */}
          <fieldset className="form-section">
            <legend>Tributação ISS</legend>
            <div className="form-row">
              <div className="form-group">
                <label>Tributação ISS (tribISSQN) *</label>
                <Dropdown
                  options={codigosListas.tributacaoIss.map((item) => ({
                    value: item.codigo,
                    label: `${item.codigo} - ${item.descricao}`,
                  }))}
                  placeholder="Selecione..."
                  value={formData.tributacao_iss}
                  onChange={(value) => handleDropdownChange("tributacao_iss", value)}
                />
              </div>
              <div className="form-group">
                <label>Tipo de Retenção ISS (tpRetISSQN)</label>
                <Dropdown
                  options={codigosListas.retencaoIss.map((item) => ({
                    value: item.codigo,
                    label: `${item.codigo} - ${item.descricao}`,
                  }))}
                  placeholder="Selecione..."
                  value={formData.tipo_retencao_iss}
                  onChange={(value) => handleDropdownChange("tipo_retencao_iss", value)}
                />
              </div>
              <div className="form-group">
                <label>Alíquota ISS (%)</label>
                <Input
                  type="number"
                  name="percentual_aliquota_relativa_municipio"
                  value={formData.percentual_aliquota_relativa_municipio}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  max="5"
                  placeholder="Ex: 2.00"
                />
              </div>
            </div>
          </fieldset>

          {/* Seção: Reforma Tributária (oculto) */}
          {/*
          <fieldset className="form-section">
            <legend>Campos Reforma Tributária</legend>
            <div className="form-row">
              <div className="form-group">
                <label>Consumidor Final (indFinal) *</label>
                <Dropdown
                  options={codigosListas.consumidorFinal.map((item) => ({
                    value: item.codigo,
                    label: `${item.codigo} - ${item.descricao}`,
                  }))}
                  placeholder="Selecione..."
                  value={formData.consumidor_final}
                  onChange={(value) => handleDropdownChange("consumidor_final", value)}
                />
              </div>
              <div className="form-group">
                <label>Indicador Destinatário (indDest) *</label>
                <Dropdown
                  options={codigosListas.indicadorDestinatario.map((item) => ({
                    value: item.codigo,
                    label: `${item.codigo} - ${item.descricao}`,
                  }))}
                  placeholder="Selecione..."
                  value={formData.indicador_destinatario}
                  onChange={(value) => handleDropdownChange("indicador_destinatario", value)}
                />
              </div>
            </div>
          </fieldset>
          */}

          {/* Seção: Informações Complementares (oculto) */}
          {/*
          <fieldset className="form-section">
            <legend>Informações Complementares</legend>
            <div className="form-row">
              <div className="form-group full-width">
                <textarea
                  name="informacoes_complementares"
                  value={formData.informacoes_complementares}
                  onChange={handleChange}
                  maxLength={2000}
                  rows={3}
                  className="textarea-servico"
                  placeholder="Informações adicionais da nota fiscal..."
                />
              </div>
            </div>
          </fieldset>
          */}

          {/* Botões de ação */}
          <div className="form-actions">
            <Button
              type="submit"
              text={loading ? "Emitindo..." : "Emitir NFS-e"}
              variant="primary"
              disabled={loading}
            />
            <Button
              type="button"
              text="Limpar"
              variant="secondary"
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  numero_dps: "",
                  cnpj_tomador: "",
                  cpf_tomador: "",
                  razao_social_tomador: "",
                  descricao_servico: "",
                  valor_servico: "",
                  informacoes_complementares: "",
                }))
              }
            />
          </div>
        </form>
      </Card>
    </div>
  );
};
