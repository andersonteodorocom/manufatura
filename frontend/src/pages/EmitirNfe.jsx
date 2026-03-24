import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Dropdown } from "../components/Dropdown";
import { Calendar } from "../components/Calendar";
import { Loading } from "../components/Loading";
import "../components/Modal.css";
import {
  FilePlus, Search, Plus, Trash2, Edit3, Upload,
  CheckCircle, AlertCircle, Package, Truck, CreditCard,
  FileText, X, Download, Clock, RefreshCw
} from "lucide-react";
import api from "../services/api";
import {
  aplicarMascaraCPF, aplicarMascaraCNPJ, aplicarMascaraCEP,
  limparMascara, validarDigitosCPF, validarDigitosCNPJ,
  validarNCM, validarCEST, formatarMoeda, UFS,
  FORMAS_PAGAMENTO, MODALIDADES_FRETE
} from "../utils/mascaras";
import "./EmitirNfe.css";

const INITIAL_FORM = {
  tipo_documento: "",
  documento: "",
  nome_destinatario: "",
  inscricao_estadual: "",
  logradouro: "",
  numero: "",
  complemento: "",
  bairro: "",
  municipio: "",
  uf: "SP",
  cep: "",
  telefone: "",
  email: "",
  tipo_documento_nfe: "1",
  natureza_operacao: "VENDA DE MERCADORIA",
  modalidade_frete: "9",
  informacoes_adicionais_contribuinte: "",
  forma_pagamento: "0",
};

const INITIAL_PRODUTO = {
  codigo: "", ncm: "", descricao: "", cfop: "", cst: "",
  cest: "", quantidade: "1", unidade: "UN", valor_unitario: "",
  ean: "", valor_frete: "", produto_importado: false,
  aliquota_st_manual: "", icms_base_calculo_st: "", icms_valor_st: "",
};

export const EmitirNfe = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const corrigirRef = searchParams.get("corrigir");

  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState(null);
  const [formData, setFormData] = useState({ ...INITIAL_FORM });
  const [produtos, setProdutos] = useState([]);
  const [duplicatas, setDuplicatas] = useState([]);

  // Modal produto
  const [showProdutoModal, setShowProdutoModal] = useState(false);
  const [produtoForm, setProdutoForm] = useState({ ...INITIAL_PRODUTO });
  const [editIndex, setEditIndex] = useState(-1);

  // Modal duplicata
  const [showDuplicataModal, setShowDuplicataModal] = useState(false);
  const [duplicataForm, setDuplicataForm] = useState({ numero: "", data_vencimento: "", valor: "" });
  const [editDupIndex, setEditDupIndex] = useState(-1);

  // Dados de Transporte (aparece quando modalidade_frete != '9')
  const [dadosTransporte, setDadosTransporte] = useState({
    tipo_documento: "",
    cpf_transportador: "",
    cnpj_transportador: "",
    nome_transportador: "",
    inscricao_estadual_transportador: "",
    endereco_transportador: "",
    municipio_transportador: "",
    uf_transportador: "",
    volumes_quantidade: "",
    volumes_especie: "",
    volumes_peso_liquido: "",
    volumes_peso_bruto: "",
  });

  const handleTransporteChange = (e) => {
    const { name, value } = e.target;
    let v = value;
    if (name === "cnpj_transportador") v = aplicarMascaraCNPJ(value);
    if (name === "cpf_transportador") v = aplicarMascaraCPF(value);
    setDadosTransporte((prev) => ({ ...prev, [name]: v }));
  };

  const handleTransporteDropdown = (name, value) => {
    setDadosTransporte((prev) => ({ ...prev, [name]: value }));
    if (name === "tipo_documento") {
      // Limpar campos específicos do tipo anterior
      if (value === "CPF") {
        setDadosTransporte((prev) => ({ ...prev, [name]: value, cnpj_transportador: "", inscricao_estadual_transportador: "" }));
      } else if (value === "CNPJ") {
        setDadosTransporte((prev) => ({ ...prev, [name]: value, cpf_transportador: "" }));
      } else {
        setDadosTransporte((prev) => ({
          ...prev, [name]: value,
          cpf_transportador: "", cnpj_transportador: "", nome_transportador: "",
          inscricao_estadual_transportador: "", endereco_transportador: "",
          municipio_transportador: "", uf_transportador: "",
          volumes_quantidade: "", volumes_especie: "", volumes_peso_liquido: "", volumes_peso_bruto: "",
        }));
      }
    }
  };

  const freteComTransportadora = ["0", "1", "2", "3", "4"].includes(formData.modalidade_frete);

  // CFOPs disponíveis
  const [cfopsDisponiveis, setCfopsDisponiveis] = useState([]);
  const [consultandoCNPJ, setConsultandoCNPJ] = useState(false);
  const [consultandoCNPJTransp, setConsultandoCNPJTransp] = useState(false);

  // Resultado da emissão
  const [resultado, setResultado] = useState(null);

  // Referência da NFe que falhou (para reenviar com mesma ref)
  const [refFalha, setRefFalha] = useState(null);

  // JSON Import
  const [showImportJSON, setShowImportJSON] = useState(false);

  // Carregar CFOPs ao mudar tipo NFe
  useEffect(() => {
    carregarCFOPs(formData.tipo_documento_nfe);
  }, [formData.tipo_documento_nfe]);

  // Se for correção, carregar dados da NF-e com erro
  useEffect(() => {
    if (corrigirRef) carregarNfeParaCorrecao(corrigirRef);
  }, [corrigirRef]);

  const carregarCFOPs = async (tipoNfe) => {
    try {
      const res = await api.post("/api/obter-cfops", { tipo_documento_nfe: tipoNfe });
      const data = await res.json();
      if (data.sucesso) {
        setCfopsDisponiveis(
          Object.entries(data.cfops).map(([codigo, info]) => ({
            value: codigo,
            label: `${codigo} - ${info.descricao}`,
          }))
        );
      }
    } catch { /* ignore */ }
  };

  const carregarNfeParaCorrecao = async (ref) => {
    setLoading(true);
    try {
      const res = await api.get(`/api/nfe/corrigir/${ref}`);
      const data = await res.json();
      if (data.sucesso && data.nfe) {
        const req = data.nfe.requisicao || {};
        setFormData({
          tipo_documento: req.cpf_destinatario ? "CPF" : "CNPJ",
          documento: req.cpf_destinatario || req.cnpj_destinatario || "",
          nome_destinatario: req.nome_destinatario || "",
          inscricao_estadual: req.inscricao_estadual_destinatario || "",
          logradouro: req.logradouro_destinatario || "",
          numero: req.numero_destinatario || "",
          complemento: req.complemento_destinatario || "",
          bairro: req.bairro_destinatario || "",
          municipio: req.municipio_destinatario || "",
          uf: req.uf_destinatario || "SP",
          cep: req.cep_destinatario || "",
          telefone: req.telefone_destinatario || "",
          email: req.email_destinatario || "",
          tipo_documento_nfe: req.tipo_documento || "1",
          natureza_operacao: req.natureza_operacao || "VENDA DE MERCADORIA",
          modalidade_frete: req.modalidade_frete || "9",
          informacoes_adicionais_contribuinte: req.informacoes_adicionais_contribuinte || "",
          forma_pagamento: req.forma_pagamento || "0",
        });

        if (req.itens && req.itens.length > 0) {
          const prods = req.itens.map((item) => ({
            codigo: item.codigo_produto || "",
            descricao: item.descricao || "",
            ncm: item.codigo_ncm || "",
            cfop: item.cfop || "",
            cst: item.icms_situacao_tributaria || "",
            cest: item.codigo_cest || "",
            quantidade: String(item.quantidade_comercial || 1),
            unidade: item.unidade_comercial || "UN",
            valor_unitario: String(item.valor_unitario_comercial || ""),
            ean: item.codigo_barras_comercial || "",
            valor_frete: String(item.valor_frete || ""),
            produto_importado: false,
            aliquota_st_manual: "",
            icms_base_calculo_st: String(item.icms_base_calculo_st || ""),
            icms_valor_st: String(item.icms_valor_st || ""),
          }));
          setProdutos(prods);
        }

        setMensagem({
          tipo: "aviso",
          texto: `Carregados dados da NF-e REF ${ref} (${data.nfe.status}). ${data.nfe.mensagem_sefaz || ""}. Corrija e reenvie.`,
        });
      }
    } catch {
      setMensagem({ tipo: "erro", texto: "Erro ao carregar NF-e para correção." });
    } finally {
      setLoading(false);
    }
  };

  // Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    let v = value;

    if (name === "documento") {
      if (formData.tipo_documento === "CPF") v = aplicarMascaraCPF(value);
      else if (formData.tipo_documento === "CNPJ") v = aplicarMascaraCNPJ(value);
    }
    if (name === "cep") v = aplicarMascaraCEP(value);

    setFormData((prev) => ({ ...prev, [name]: v }));
  };

  const handleDropdownChange = (name, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "tipo_documento") {
        updated.documento = "";
        updated.inscricao_estadual = "";
      }
      if (name === "tipo_documento_nfe") {
        updated.natureza_operacao = value === "1" ? "VENDA DE MERCADORIA" : "COMPRA DE MERCADORIA";
      }
      return updated;
    });
  };

  // Consultar CNPJ
  const consultarCNPJ = async () => {
    const cnpj = limparMascara(formData.documento);
    if (cnpj.length !== 14) {
      setMensagem({ tipo: "erro", texto: "CNPJ deve ter 14 dígitos." });
      return;
    }
    setConsultandoCNPJ(true);
    try {
      const res = await api.get(`/api/consultar-cnpj/${cnpj}`);
      const data = await res.json();
      if (data.sucesso && data.dados) {
        const d = data.dados;
        setFormData((prev) => ({
          ...prev,
          nome_destinatario: (d.razao_social || d.nome_fantasia || prev.nome_destinatario).substring(0, 60),
          logradouro: d.logradouro || prev.logradouro,
          numero: d.numero || prev.numero,
          complemento: d.complemento || prev.complemento,
          bairro: d.bairro || prev.bairro,
          municipio: d.municipio || prev.municipio,
          uf: d.uf || prev.uf,
          cep: d.cep ? aplicarMascaraCEP(d.cep) : prev.cep,
          telefone: d.telefone || prev.telefone,
          email: d.email || prev.email,
          inscricao_estadual: d.inscricao_estadual || prev.inscricao_estadual,
        }));
        setMensagem({ tipo: "sucesso", texto: "Dados do CNPJ preenchidos!" });
      } else {
        setMensagem({ tipo: "erro", texto: data.mensagem || "CNPJ não encontrado." });
      }
    } catch {
      setMensagem({ tipo: "erro", texto: "Erro ao consultar CNPJ." });
    } finally {
      setConsultandoCNPJ(false);
    }
  };

  // Consultar CNPJ da Transportadora
  const consultarCNPJTransportadora = async () => {
    const cnpj = limparMascara(dadosTransporte.cnpj_transportador);
    if (cnpj.length !== 14) {
      setMensagem({ tipo: "erro", texto: "CNPJ da transportadora deve ter 14 dígitos." });
      return;
    }
    setConsultandoCNPJTransp(true);
    try {
      const res = await api.get(`/api/consultar-cnpj/${cnpj}`);
      const data = await res.json();
      if (data.sucesso && data.dados) {
        const d = data.dados;
        setDadosTransporte((prev) => ({
          ...prev,
          nome_transportador: (d.razao_social || d.nome_fantasia || prev.nome_transportador).substring(0, 60),
          endereco_transportador: d.logradouro ? `${d.logradouro}, ${d.numero || 'S/N'}` : prev.endereco_transportador,
          municipio_transportador: d.municipio || prev.municipio_transportador,
          uf_transportador: d.uf || prev.uf_transportador,
          inscricao_estadual_transportador: d.inscricao_estadual || prev.inscricao_estadual_transportador,
        }));
        setMensagem({ tipo: "sucesso", texto: "Dados da transportadora preenchidos!" });
      } else {
        setMensagem({ tipo: "erro", texto: data.mensagem || "CNPJ da transportadora não encontrado." });
      }
    } catch {
      setMensagem({ tipo: "erro", texto: "Erro ao consultar CNPJ da transportadora." });
    } finally {
      setConsultandoCNPJTransp(false);
    }
  };

  // Produto
  const handleProdutoChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProdutoForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleProdutoDropdown = (name, value) => {
    setProdutoForm((prev) => ({ ...prev, [name]: value }));
  };

  const salvarProduto = () => {
    const { codigo, descricao, ncm, cfop, cst, quantidade, valor_unitario } = produtoForm;
    if (!codigo || !descricao || !ncm || !cfop || !cst || !quantidade || !valor_unitario) {
      setMensagem({ tipo: "erro", texto: "Preencha todos os campos obrigatórios do produto." });
      return;
    }
    if (!validarNCM(ncm)) {
      setMensagem({ tipo: "erro", texto: "NCM deve ter 8 dígitos numéricos." });
      return;
    }
    if ((cst === "10" || cst === "60") && produtoForm.cest && !validarCEST(produtoForm.cest)) {
      setMensagem({ tipo: "erro", texto: "CEST deve ter 7 dígitos numéricos." });
      return;
    }

    const valorTotal = (parseInt(quantidade) * parseFloat(valor_unitario)).toFixed(2);
    const novoProduto = { ...produtoForm, valor_total: valorTotal };

    if (editIndex >= 0) {
      setProdutos((prev) => prev.map((p, i) => (i === editIndex ? novoProduto : p)));
    } else {
      setProdutos((prev) => [...prev, novoProduto]);
    }

    setProdutoForm({ ...INITIAL_PRODUTO });
    setEditIndex(-1);
    setShowProdutoModal(false);
    setMensagem(null);
  };

  const editarProduto = (index) => {
    setProdutoForm({ ...produtos[index] });
    setEditIndex(index);
    setShowProdutoModal(true);
  };

  const removerProduto = (index) => {
    if (window.confirm("Remover este produto?")) {
      setProdutos((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // Duplicata
  const formatarNumeroDuplicata = (valor) => {
    // Remove tudo que não é dígito
    const apenasNumeros = valor.replace(/\D/g, "").slice(0, 3);
    return apenasNumeros;
  };

  const padNumeroDuplicata = (valor) => {
    // Pad com zeros à esquerda para 3 dígitos (ex: "1" -> "001", "12" -> "012")
    return valor.replace(/\D/g, "").padStart(3, "0").slice(0, 3);
  };

  const salvarDuplicata = () => {
    const { numero, data_vencimento, valor } = duplicataForm;
    if (!numero || !data_vencimento || !valor) {
      setMensagem({ tipo: "erro", texto: "Preencha todos os campos da duplicata." });
      return;
    }
    const duplicataFinal = { ...duplicataForm, numero: padNumeroDuplicata(numero) };
    if (editDupIndex >= 0) {
      setDuplicatas((prev) => prev.map((d, i) => (i === editDupIndex ? duplicataFinal : d)));
    } else {
      setDuplicatas((prev) => [...prev, duplicataFinal]);
    }
    setDuplicataForm({ numero: "", data_vencimento: "", valor: "" });
    setEditDupIndex(-1);
    setShowDuplicataModal(false);
  };

  // Validação em tempo real de CPF/CNPJ do destinatário
  const docDestinatarioLimpo = limparMascara(formData.documento);
  const docDestinatarioCompleto = formData.tipo_documento === "CPF" ? docDestinatarioLimpo.length === 11 : docDestinatarioLimpo.length === 14;
  const docDestinatarioValido = docDestinatarioCompleto && (
    formData.tipo_documento === "CPF" ? validarDigitosCPF(docDestinatarioLimpo) : validarDigitosCNPJ(docDestinatarioLimpo)
  );

  // Validação em tempo real de CPF/CNPJ da transportadora
  const docTranspLimpo = dadosTransporte.tipo_documento === "CPF"
    ? limparMascara(dadosTransporte.cpf_transportador || "")
    : limparMascara(dadosTransporte.cnpj_transportador || "");
  const docTranspCompleto = dadosTransporte.tipo_documento === "CPF" ? docTranspLimpo.length === 11 : docTranspLimpo.length === 14;
  const docTranspValido = dadosTransporte.tipo_documento && docTranspCompleto && (
    dadosTransporte.tipo_documento === "CPF" ? validarDigitosCPF(docTranspLimpo) : validarDigitosCNPJ(docTranspLimpo)
  );

  // Alíquotas internas por UF (espelha backend CalculoICMS.ALIQUOTA_INTERNA)
  const ALIQUOTA_INTERNA_UF = {
    SP: 18, RJ: 20, MG: 18, ES: 17, PR: 19.5, SC: 17, RS: 17,
    MT: 17, MS: 17, GO: 19, DF: 20, BA: 20.5, CE: 20, PE: 20.5,
    RN: 20, PB: 20, AL: 19, SE: 19, PI: 22.5, MA: 23, PA: 19,
    AP: 18, AM: 20, RR: 20, RO: 19.5, AC: 19, TO: 20,
  };
  const ALIQUOTA_12_UFS = ['SP', 'RJ', 'MG', 'PR', 'SC', 'RS'];

  const obterAliquotaInterestadual = (ufDest, importado = false) => {
    if (importado) return 4;
    return ALIQUOTA_12_UFS.includes(ufDest) ? 12 : 7;
  };

  // Totais
  const totalProdutos = produtos.reduce((acc, p) => acc + (parseInt(p.quantidade) * parseFloat(p.valor_unitario || 0)), 0);
  const totalFrete = produtos.reduce((acc, p) => acc + parseFloat(p.valor_frete || 0), 0);
  const totalGeral = totalProdutos + totalFrete;
  const totalST = produtos
    .filter((p) => p.cst === "10")
    .reduce((acc, p) => acc + parseFloat(p.icms_valor_st || 0), 0);

  // DIFAL "por dentro" para CFOP 6108 + CST 00
  const ufDestino = formData.uf;
  const produtosDifal = produtos.filter((p) => p.cfop === "6108" && p.cst === "00");
  const temDifal = produtosDifal.length > 0 && ufDestino !== "SP";

  const calculoDifal = temDifal ? (() => {
    const aliqInterna = ALIQUOTA_INTERNA_UF[ufDestino] || 18;
    const totais = produtosDifal.reduce((acc, p) => {
      const valorBase = parseInt(p.quantidade) * parseFloat(p.valor_unitario || 0);
      const importado = p.produto_importado || false;
      const aliqInter = obterAliquotaInterestadual(ufDestino, importado);
      // Base Dupla (Econet): base ajustada embute ICMS interno
      const baseAjustada = +(valorBase / (1 - aliqInterna / 100)).toFixed(2);
      // ICMS interestadual sobre a base ajustada (Base Dupla)
      const icmsInter = +(baseAjustada * aliqInter / 100).toFixed(2);
      const valorDifal = +((baseAjustada * aliqInterna / 100) - icmsInter).toFixed(2);
      return {
        valorBase: acc.valorBase + valorBase,
        baseAjustada: acc.baseAjustada + baseAjustada,
        icmsInter: acc.icmsInter + icmsInter,
        valorDifal: acc.valorDifal + valorDifal,
        aliqInter: aliqInter,
      };
    }, { valorBase: 0, baseAjustada: 0, icmsInter: 0, valorDifal: 0, aliqInter: 0 });
    return { ...totais, aliqInterna };
  })() : null;

  // GNRE ICMS ST para CST=10 (CFOP 6403/6404)
  const produtosGNRE = produtos.filter((p) => p.cst === "10" && ["6403", "6404"].includes(p.cfop));
  const temGNRE = produtosGNRE.length > 0 && ufDestino && ufDestino !== "SP";

  const calculoGNRE = temGNRE ? (() => {
    const aliqInterna = ALIQUOTA_INTERNA_UF[ufDestino] || 18;
    const totais = produtosGNRE.reduce((acc, p) => {
      const valorBase = parseInt(p.quantidade) * parseFloat(p.valor_unitario || 0);
      const importado = p.produto_importado || false;
      const aliqInter = obterAliquotaInterestadual(ufDestino, importado);
      const icmsProprio = +(valorBase * aliqInter / 100).toFixed(2);
      const baseST = parseFloat(p.icms_base_calculo_st || 0) || valorBase;
      const aliqST = parseFloat(p.aliquota_st_manual || 0) || aliqInterna;
      const icmsST = parseFloat(p.icms_valor_st || 0) || +((baseST * aliqST / 100) - icmsProprio).toFixed(2);
      return {
        valorBase: acc.valorBase + valorBase,
        icmsProprio: acc.icmsProprio + icmsProprio,
        baseST: acc.baseST + baseST,
        icmsST: acc.icmsST + icmsST,
        aliqInter: aliqInter,
      };
    }, { valorBase: 0, icmsProprio: 0, baseST: 0, icmsST: 0, aliqInter: 0 });
    return { ...totais, aliqInterna, produtosGNRE };
  })() : null;

  // Import JSON
  const importarJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        // Preencher destinatário
        if (data.cpf_destinatario || data.cnpj_destinatario) {
          setFormData((prev) => ({
            ...prev,
            tipo_documento: data.cpf_destinatario ? "CPF" : "CNPJ",
            documento: data.cpf_destinatario || data.cnpj_destinatario || "",
            nome_destinatario: data.nome_destinatario || "",
            logradouro: data.logradouro_destinatario || "",
            numero: data.numero_destinatario || "",
            complemento: data.complemento_destinatario || "",
            bairro: data.bairro_destinatario || "",
            municipio: data.municipio_destinatario || "",
            uf: data.uf_destinatario || "SP",
            cep: data.cep_destinatario || "",
            telefone: data.telefone_destinatario || "",
            email: data.email_destinatario || "",
            inscricao_estadual: data.inscricao_estadual_destinatario || "",
            natureza_operacao: data.natureza_operacao || "VENDA DE MERCADORIA",
            modalidade_frete: data.modalidade_frete || "9",
            forma_pagamento: data.forma_pagamento || "0",
            informacoes_adicionais_contribuinte: data.informacoes_adicionais_contribuinte || "",
          }));
        }
        // Preencher produtos
        if (data.itens && data.itens.length > 0) {
          const prods = data.itens.map((item) => ({
            codigo: item.codigo_produto || item.codigo || "",
            descricao: item.descricao || "",
            ncm: item.codigo_ncm || item.ncm || "",
            cfop: item.cfop || "",
            cst: item.icms_situacao_tributaria || item.cst || "",
            cest: item.codigo_cest || item.cest || "",
            quantidade: String(item.quantidade_comercial || item.quantidade || 1),
            unidade: item.unidade_comercial || item.unidade || "UN",
            valor_unitario: String(item.valor_unitario_comercial || item.valor_unitario || ""),
            ean: item.codigo_barras_comercial || item.ean || "",
            valor_frete: String(item.valor_frete || ""),
            produto_importado: false,
            aliquota_st_manual: "",
            icms_base_calculo_st: String(item.icms_base_calculo_st || ""),
            icms_valor_st: String(item.icms_valor_st || ""),
          }));
          setProdutos(prods);
        }
        setMensagem({ tipo: "sucesso", texto: "JSON importado com sucesso!" });
        setShowImportJSON(false);
      } catch {
        setMensagem({ tipo: "erro", texto: "Arquivo JSON inválido." });
      }
    };
    reader.readAsText(file);
  };

  // Submeter
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem(null);
    setResultado(null);

    // Validações
    const docLimpo = limparMascara(formData.documento);
    if (formData.tipo_documento === "CPF" && !validarDigitosCPF(docLimpo)) {
      setMensagem({ tipo: "erro", texto: "CPF inválido." });
      return;
    }
    if (formData.tipo_documento === "CNPJ" && !validarDigitosCNPJ(docLimpo)) {
      setMensagem({ tipo: "erro", texto: "CNPJ inválido." });
      return;
    }
    if (produtos.length === 0) {
      setMensagem({ tipo: "erro", texto: "Adicione pelo menos um produto." });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        documento: docLimpo,
        cep: limparMascara(formData.cep),
        produtos: produtos.map((p) => ({
          ...p,
          quantidade: parseInt(p.quantidade),
          valor_unitario: parseFloat(p.valor_unitario),
          valor_frete: parseFloat(p.valor_frete || 0),
          icms_base_calculo_st: parseFloat(p.icms_base_calculo_st || 0),
          icms_valor_st: parseFloat(p.icms_valor_st || 0),
          aliquota_st_manual: p.aliquota_st_manual ? parseFloat(p.aliquota_st_manual) : null,
        })),
        duplicatas: formData.forma_pagamento === "15" ? duplicatas : undefined,
      };

      // Incluir dados de transporte se modalidade exige
      if (freteComTransportadora && dadosTransporte.tipo_documento) {
        payload.dados_transporte = {
          cpf_transportador: dadosTransporte.cpf_transportador ? limparMascara(dadosTransporte.cpf_transportador) : "",
          cnpj_transportador: dadosTransporte.cnpj_transportador ? limparMascara(dadosTransporte.cnpj_transportador) : "",
          nome_transportador: dadosTransporte.nome_transportador,
          inscricao_estadual_transportador: dadosTransporte.inscricao_estadual_transportador,
          endereco_transportador: dadosTransporte.endereco_transportador,
          municipio_transportador: dadosTransporte.municipio_transportador,
          uf_transportador: dadosTransporte.uf_transportador,
          volumes: {
            quantidade: dadosTransporte.volumes_quantidade,
            especie: dadosTransporte.volumes_especie,
            peso_liquido: dadosTransporte.volumes_peso_liquido,
            peso_bruto: dadosTransporte.volumes_peso_bruto,
          },
        };
      }

      // Se for correção ou retentativa, usar a rota de reenvio com a mesma referência
      const refReenvio = corrigirRef || refFalha;
      const endpoint = refReenvio ? "/api/nfe/reenviar" : "/api/nfe/emitir";
      if (refReenvio) payload.referencia_original = refReenvio;

      const res = await api.post(endpoint, payload);
      const data = await res.json();

      if (data.sucesso) {
        setRefFalha(null);
        setResultado(data);
        setMensagem({ tipo: "sucesso", texto: data.mensagem || "NF-e emitida com sucesso!" });
      } else {
        // Guardar a ref que falhou para reenviar com a mesma referência na próxima tentativa
        if (data.ref) setRefFalha(data.ref);
        setMensagem({ tipo: "erro", texto: data.mensagem || "Erro na emissão." });
        if (data.resposta) setResultado(data);
      }
    } catch {
      setMensagem({ tipo: "erro", texto: "Erro de conexão com o servidor." });
    } finally {
      setLoading(false);
    }
  };

  const limparTudo = () => {
    setFormData({ ...INITIAL_FORM });
    setProdutos([]);
    setDuplicatas([]);
    setDadosTransporte({
      tipo_documento: "", cpf_transportador: "", cnpj_transportador: "",
      nome_transportador: "", inscricao_estadual_transportador: "",
      endereco_transportador: "", municipio_transportador: "", uf_transportador: "",
      volumes_quantidade: "", volumes_especie: "", volumes_peso_liquido: "", volumes_peso_bruto: "",
    });
    setMensagem(null);
    setResultado(null);
    setRefFalha(null);
  };

  const CST_OPTIONS = [
    { value: "00", label: "00 - Tributada integralmente" },
    { value: "10", label: "10 - Tributada com cobrança de ICMS por ST" },
    { value: "60", label: "60 - ICMS cobrado anteriormente por ST" },
  ];

  // Auto-polling quando status é processando_autorizacao
  useEffect(() => {
    if (!resultado?.sucesso || resultado.status !== "processando_autorizacao") return;

    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/api/nfe/consultar/${resultado.ref}`);
        const data = await res.json();
        if (data.sucesso && data.dados) {
          const status = data.dados.status;
          if (status === "autorizado" || status === "erro_autorizacao" || status === "cancelado") {
            clearInterval(interval);
            if (status === "autorizado") {
              setResultado({
                ...resultado,
                status: "autorizado",
                numero: data.dados.numero || resultado.numero,
                chave_nfe: data.dados.chave_nfe || resultado.chave_nfe,
                caminho_danfe: data.dados.caminho_danfe || "",
                caminho_xml: data.dados.caminho_xml_nota_fiscal || "",
              });
              setMensagem({ tipo: "sucesso", texto: "NF-e autorizada com sucesso!" });
            } else if (status === "erro_autorizacao") {
              setResultado({ ...resultado, sucesso: false, status: "erro_autorizacao" });
              setMensagem({
                tipo: "erro",
                texto: `NF-e rejeitada pela SEFAZ: ${data.dados.mensagem_sefaz || "Erro na autorização"}`,
              });
            }
          }
        }
      } catch {
        // Silently retry on next interval
      }
    }, 5000);

    // Timeout after 60 seconds
    const timeout = setTimeout(() => clearInterval(interval), 60000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [resultado?.sucesso, resultado?.status, resultado?.ref]);

  // Se já emitiu com sucesso, mostrar resultado
  if (resultado && resultado.sucesso) {
    const getUrl = (url) => {
      if (!url) return null;
      return url.startsWith("http") ? url : `https://api.focusnfe.com.br${url}`;
    };

    const isProcessando = resultado.status === "processando_autorizacao";

    return (
      <div className="emitir-container">
        <Card>
          <div className="resultado-emissao">
            {isProcessando ? (
              <>
                <Clock size={48} color="var(--color-warning)" className="resultado-icon-pulse" />
                <h2>NF-e Enviada para Processamento</h2>
                <p className="resultado-aguardando">Aguardando resposta da SEFAZ...</p>
              </>
            ) : (
              <>
                <CheckCircle size={48} color="#10b981" />
                <h2>NF-e Emitida com Sucesso!</h2>
              </>
            )}
            <p className="resultado-ref">Referência: <strong>{resultado.ref}</strong></p>
            {resultado.numero && <p>Número: <strong>{resultado.numero}</strong></p>}
            {resultado.chave_nfe && (
              <p className="resultado-chave">
                Chave: <code>{resultado.chave_nfe}</code>
              </p>
            )}
            <div className="resultado-buttons">
              {getUrl(resultado.caminho_danfe) && (
                <a href={getUrl(resultado.caminho_danfe)} target="_blank" rel="noreferrer" className="btn-download">
                  <Download size={16} /> DANFE (PDF)
                </a>
              )}
              {getUrl(resultado.caminho_xml) && (
                <a href={getUrl(resultado.caminho_xml)} target="_blank" rel="noreferrer" className="btn-download secondary">
                  <FileText size={16} /> XML
                </a>
              )}
            </div>
            <div className="resultado-nav">
              {isProcessando ? (
                <Button text="Verificar Status" icon={<RefreshCw size={16} />} variant="primary" onClick={() => navigate(`/consultar`)} />
              ) : (
                <Button text="Emitir Nova NF-e" variant="primary" onClick={limparTudo} />
              )}
              <Button text="Consultar" variant="secondary" onClick={() => navigate(`/consultar`)} />
              <Button text="Listar NF-es" variant="secondary" onClick={() => navigate(`/listnfe`)} />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="emitir-container">
      <div className="emitir-header">
        <FilePlus size={32} color="var(--primary)" />
        <div className="emitir-header-text">
          <h1>{corrigirRef ? `Corrigir NF-e REF ${corrigirRef}` : refFalha ? `Corrigir NF-e REF ${refFalha}` : "Emissão de NF-e"}</h1>
          <p>{refFalha ? "Corrija os dados e reenvie — a referência será mantida" : "Preencha os dados e emita sua nota fiscal eletrônica"}</p>
        </div>
        <div className="emitir-header-actions">
          <button className="btn-header" onClick={() => setShowImportJSON(!showImportJSON)}>
            <Upload size={16} /> Importar JSON
          </button>
          <button className="btn-header outline" onClick={limparTudo}>
            <X size={16} /> Limpar
          </button>
        </div>
      </div>

      {mensagem && (
        <div className={`emitir-msg ${mensagem.tipo}`}>
          {mensagem.tipo === "sucesso" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{mensagem.texto}</span>
          <button onClick={() => setMensagem(null)}>×</button>
        </div>
      )}

      {showImportJSON && (
        <Card>
          <div className="import-json-section">
            <h3><Upload size={18} /> Importar NF-e via JSON</h3>
            <input type="file" accept=".json" onChange={importarJSON} />
          </div>
        </Card>
      )}

      {loading && <Loading fullScreen message={corrigirRef ? "Reenviando NF-e..." : "Emitindo NF-e..."} />}

      <form onSubmit={handleSubmit}>
        <div className="emitir-grid">
          {/* COLUNA ESQUERDA */}
          <div className="emitir-col">
            {/* Destinatário */}
            <Card title="Destinatário">
              <div className="form-section">
                <div className="form-row">
                  <Dropdown label="Tipo de Documento *" options={[{ value: "CPF", label: "CPF" }, { value: "CNPJ", label: "CNPJ" }]} value={formData.tipo_documento} onChange={(v) => handleDropdownChange("tipo_documento", v)} />
                </div>
                <div className="form-row">
                  <div className="input-with-action">
                    <Input label="CPF/CNPJ *" name="documento" value={formData.documento} onChange={handleChange} placeholder={formData.tipo_documento === "CNPJ" ? "00.000.000/0000-00" : "000.000.000-00"} required />
                    {docDestinatarioCompleto && (
                      <span className={`doc-icone ${docDestinatarioValido ? 'doc-valido' : 'doc-invalido'}`} title={docDestinatarioValido ? `${formData.tipo_documento} válido` : `${formData.tipo_documento} inválido`}>
                        {docDestinatarioValido ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                      </span>
                    )}
                    {formData.tipo_documento === "CNPJ" && (
                      <button type="button" className="btn-consultar-cnpj" onClick={consultarCNPJ} disabled={consultandoCNPJ} title="Consultar CNPJ">
                        {consultandoCNPJ ? "..." : <Search size={16} />}
                      </button>
                    )}
                  </div>
                </div>
                {formData.tipo_documento === "CNPJ" && (
                  <div className="form-row">
                    <Input label="Inscrição Estadual" name="inscricao_estadual" value={formData.inscricao_estadual} onChange={handleChange} />
                  </div>
                )}
                <div className="form-row">
                  <Input label="Nome / Razão Social *" name="nome_destinatario" value={formData.nome_destinatario} onChange={handleChange} required maxLength={60} />
                </div>
                <div className="form-row two-cols">
                  <Input label="Logradouro *" name="logradouro" value={formData.logradouro} onChange={handleChange} required />
                  <Input label="Número *" name="numero" value={formData.numero} onChange={handleChange} required style={{ maxWidth: 120 }} />
                </div>
                <div className="form-row two-cols">
                  <Input label="Complemento" name="complemento" value={formData.complemento} onChange={handleChange} />
                  <Input label="Bairro *" name="bairro" value={formData.bairro} onChange={handleChange} required />
                </div>
                <div className="form-row two-cols">
                  <Input label="Município *" name="municipio" value={formData.municipio} onChange={handleChange} required />
                  <Dropdown label="UF *" options={UFS.map((u) => ({ value: u, label: u }))} value={formData.uf} onChange={(v) => handleDropdownChange("uf", v)} />
                </div>
                <div className="form-row two-cols">
                  <Input label="CEP *" name="cep" value={formData.cep} onChange={handleChange} placeholder="00000-000" required />
                  <Input label="Telefone" name="telefone" value={formData.telefone} onChange={handleChange} />
                </div>
                <div className="form-row">
                  <Input label="Email" name="email" type="email" value={formData.email} onChange={handleChange} />
                </div>
              </div>
            </Card>

            {/* Produtos */}
            <Card title="Produtos">
              <div className="produtos-header">
                <span>{produtos.length} produto(s) — Total: {formatarMoeda(totalProdutos)}</span>
                <button type="button" className="btn-adicionar" onClick={() => { setProdutoForm({ ...INITIAL_PRODUTO }); setEditIndex(-1); setShowProdutoModal(true); }}>
                  <Plus size={16} /> Adicionar Produto
                </button>
              </div>

              {produtos.length > 0 && (
                <div className="produtos-lista">
                  {produtos.map((p, i) => (
                    <div key={i} className="produto-item">
                      <div className="produto-info">
                        <strong>{p.codigo}</strong> — {p.descricao}
                        <span className="produto-detalhe">
                          CFOP: {p.cfop} | CST: {p.cst} | NCM: {p.ncm}
                        </span>
                        <span className="produto-detalhe">
                          {p.quantidade} × {formatarMoeda(parseFloat(p.valor_unitario))} = {formatarMoeda(parseInt(p.quantidade) * parseFloat(p.valor_unitario))}
                          {parseFloat(p.valor_frete || 0) > 0 && ` + Frete: ${formatarMoeda(parseFloat(p.valor_frete))}`}
                        </span>
                      </div>
                      <div className="produto-acoes">
                        <button type="button" onClick={() => editarProduto(i)} title="Editar"><Edit3 size={16} /></button>
                        <button type="button" onClick={() => removerProduto(i)} title="Remover"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* COLUNA DIREITA */}
          <div className="emitir-col">
            {/* Dados da Nota */}
            <Card title="Dados da Nota">
              <div className="form-section">
                <div className="form-row two-cols">
                  <Dropdown label="Tipo da NF-e *" options={[{ value: "1", label: "1 - Saída" }, { value: "0", label: "0 - Entrada" }]} value={formData.tipo_documento_nfe} onChange={(v) => handleDropdownChange("tipo_documento_nfe", v)} />
                  <Input label="Natureza da Operação *" name="natureza_operacao" value={formData.natureza_operacao} onChange={handleChange} required />
                </div>
                <div className="form-row">
                  <Dropdown label="Modalidade de Frete *" options={MODALIDADES_FRETE} value={formData.modalidade_frete} onChange={(v) => handleDropdownChange("modalidade_frete", v)} />
                </div>

                {/* Dados de Transporte — aparece quando frete != Sem Ocorrência */}
                {freteComTransportadora && (
                  <div className="transporte-section">
                    <div className="transporte-header">
                      <Truck size={18} /> <strong>Dados da Transportadora</strong>
                    </div>
                    <p className="transporte-info">Preencha os dados da transportadora. Todos os campos são opcionais.</p>

                    <div className="form-row">
                      <Dropdown
                        label="Tipo de Documento"
                        options={[
                          { value: "", label: "Não informar transportadora" },
                          { value: "CPF", label: "CPF - Pessoa Física" },
                          { value: "CNPJ", label: "CNPJ - Pessoa Jurídica" },
                        ]}
                        value={dadosTransporte.tipo_documento}
                        onChange={(v) => handleTransporteDropdown("tipo_documento", v)}
                      />
                    </div>

                    {dadosTransporte.tipo_documento === "CPF" && (
                      <div className="form-row">
                        <div className="input-with-action">
                          <Input label="CPF da Transportadora" name="cpf_transportador" value={dadosTransporte.cpf_transportador} onChange={handleTransporteChange} placeholder="000.000.000-00" />
                          {docTranspCompleto && (
                            <span className={`doc-icone ${docTranspValido ? 'doc-valido' : 'doc-invalido'}`} title={docTranspValido ? 'CPF válido' : 'CPF inválido'}>
                              {docTranspValido ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    {dadosTransporte.tipo_documento === "CNPJ" && (
                      <>
                        <div className="form-row">
                          <div className="input-with-action">
                            <Input label="CNPJ da Transportadora" name="cnpj_transportador" value={dadosTransporte.cnpj_transportador} onChange={handleTransporteChange} placeholder="00.000.000/0000-00" />
                            {docTranspCompleto && (
                              <span className={`doc-icone ${docTranspValido ? 'doc-valido' : 'doc-invalido'}`} title={docTranspValido ? 'CNPJ válido' : 'CNPJ inválido'}>
                                {docTranspValido ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                              </span>
                            )}
                            <button type="button" className="btn-consultar-cnpj" onClick={consultarCNPJTransportadora} disabled={consultandoCNPJTransp} title="Consultar CNPJ">
                              {consultandoCNPJTransp ? "..." : <Search size={16} />}
                            </button>
                          </div>
                        </div>
                        <div className="form-row">
                          <Input label="Inscrição Estadual" name="inscricao_estadual_transportador" value={dadosTransporte.inscricao_estadual_transportador} onChange={handleTransporteChange} />
                        </div>
                      </>
                    )}

                    {dadosTransporte.tipo_documento && (
                      <>
                        <div className="form-row">
                          <Input label="Nome / Razão Social" name="nome_transportador" value={dadosTransporte.nome_transportador} onChange={handleTransporteChange} maxLength={60} />
                        </div>
                        <div className="form-row two-cols">
                          <Input label="Endereço" name="endereco_transportador" value={dadosTransporte.endereco_transportador} onChange={handleTransporteChange} maxLength={60} />
                          <Dropdown label="UF" options={UFS.map((u) => ({ value: u, label: u }))} value={dadosTransporte.uf_transportador} onChange={(v) => handleTransporteDropdown("uf_transportador", v)} />
                        </div>
                        <div className="form-row">
                          <Input label="Município" name="municipio_transportador" value={dadosTransporte.municipio_transportador} onChange={handleTransporteChange} maxLength={60} />
                        </div>

                        <h4 className="transporte-volumes-title">Dados dos Volumes</h4>
                        <div className="form-row two-cols">
                          <Input label="Quantidade de Volumes" name="volumes_quantidade" type="number" min="1" step="1" value={dadosTransporte.volumes_quantidade} onChange={handleTransporteChange} />
                          <Input label="Espécie" name="volumes_especie" value={dadosTransporte.volumes_especie} onChange={handleTransporteChange} placeholder="Caixa, Pacote..." maxLength={60} />
                        </div>
                        <div className="form-row two-cols">
                          <Input label="Peso Líquido (kg)" name="volumes_peso_liquido" type="number" step="0.001" min="0" value={dadosTransporte.volumes_peso_liquido} onChange={handleTransporteChange} />
                          <Input label="Peso Bruto (kg)" name="volumes_peso_bruto" type="number" step="0.001" min="0" value={dadosTransporte.volumes_peso_bruto} onChange={handleTransporteChange} />
                        </div>
                      </>
                    )}
                  </div>
                )}
                <div className="form-row">
                  <Dropdown label="Forma de Pagamento *" options={FORMAS_PAGAMENTO} value={formData.forma_pagamento} onChange={(v) => handleDropdownChange("forma_pagamento", v)} />
                </div>
                <div className="form-row">
                  <Input
                    label="Informações Adicionais"
                    multiline
                    name="informacoes_adicionais_contribuinte"
                    value={formData.informacoes_adicionais_contribuinte}
                    onChange={handleChange}
                    rows={3}
                    maxLength={2000}
                    placeholder="Informações complementares..."
                  />
                    <span className="char-count">{formData.informacoes_adicionais_contribuinte.length}/2000</span>
                </div>
              </div>
            </Card>

            {/* Totalizadores */}
            <Card title="Totalizadores">
              <div className="totalizadores">
                <div className="total-row">
                  <span>Total Produtos:</span>
                  <strong>{formatarMoeda(totalProdutos)}</strong>
                </div>
                {totalFrete > 0 && (
                  <div className="total-row">
                    <span>Total Frete:</span>
                    <strong>{formatarMoeda(totalFrete)}</strong>
                  </div>
                )}
                {totalST > 0 && (
                  <div className="total-row st">
                    <span>Total ICMS ST:</span>
                    <strong>{formatarMoeda(totalST)}</strong>
                  </div>
                )}
                <div className="total-row geral">
                  <span>TOTAL GERAL:</span>
                  <strong>{formatarMoeda(totalGeral)}</strong>
                </div>
              </div>
            </Card>

            {/* DIFAL por dentro - feedback visual */}
            {temDifal && calculoDifal && (
              <Card title="DIFAL — Diferencial de Alíquota (por dentro)">
                <div className="difal-card">
                  <div className="difal-badge">
                    <AlertCircle size={16} />
                    CFOP 6108 · CST 00 · Destino: {ufDestino}
                  </div>
                  <div className="difal-detalhes">
                    <div className="difal-row">
                      <span>Valor dos produtos (base ICMS):</span>
                      <strong>{formatarMoeda(calculoDifal.valorBase)}</strong>
                    </div>
                    <div className="difal-row">
                      <span>Alíquota interestadual (SP → {ufDestino}):</span>
                      <strong>{calculoDifal.aliqInter}%</strong>
                    </div>
                    <div className="difal-row">
                      <span>ICMS interestadual:</span>
                      <strong>{formatarMoeda(calculoDifal.icmsInter)}</strong>
                    </div>
                    <div className="difal-separator" />
                    <div className="difal-row destaque">
                      <span>Base ajustada (por dentro):</span>
                      <strong>{formatarMoeda(calculoDifal.baseAjustada)}</strong>
                    </div>
                    <div className="difal-formula">
                      {formatarMoeda(calculoDifal.valorBase)} ÷ (1 − {calculoDifal.aliqInterna}%) = {formatarMoeda(calculoDifal.baseAjustada)}
                    </div>
                    <div className="difal-row">
                      <span>Alíquota interna {ufDestino}:</span>
                      <strong>{calculoDifal.aliqInterna}%</strong>
                    </div>
                    <div className="difal-row difal-total">
                      <span>DIFAL UF Destino (vICMSUFDest):</span>
                      <strong>{formatarMoeda(calculoDifal.valorDifal)}</strong>
                    </div>
                    <div className="difal-formula">
                      ({formatarMoeda(calculoDifal.baseAjustada)} × {calculoDifal.aliqInterna}%) − {formatarMoeda(calculoDifal.icmsInter)} = {formatarMoeda(calculoDifal.valorDifal)}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* GNRE ICMS ST - feedback visual para CST=10 */}
            {temGNRE && calculoGNRE && (
              <Card title="GNRE ICMS ST — Substituição Tributária">
                <div className="difal-card gnre-card">
                  <div className="difal-badge gnre-badge">
                    <AlertCircle size={16} />
                    CFOP 6403/6404 · CST 10 · Destino: {ufDestino}
                  </div>
                  <div className="gnre-alert">
                    <strong>⚠️ Atenção:</strong> O ICMS ST deve ser recolhido via GNRE para o estado de destino.
                  </div>
                  <div className="difal-detalhes">
                    <div className="difal-row">
                      <span>Valor dos produtos (base ICMS):</span>
                      <strong>{formatarMoeda(calculoGNRE.valorBase)}</strong>
                    </div>
                    <div className="difal-row">
                      <span>Alíquota interestadual (SP → {ufDestino}):</span>
                      <strong>{calculoGNRE.aliqInter}%</strong>
                    </div>
                    <div className="difal-row">
                      <span>ICMS Próprio:</span>
                      <strong>{formatarMoeda(calculoGNRE.icmsProprio)}</strong>
                    </div>
                    <div className="difal-separator" />
                    <div className="difal-row">
                      <span>Base Cálculo ST:</span>
                      <strong>{formatarMoeda(calculoGNRE.baseST)}</strong>
                    </div>
                    <div className="difal-row">
                      <span>Alíquota interna {ufDestino}:</span>
                      <strong>{calculoGNRE.aliqInterna}%</strong>
                    </div>
                    <div className="difal-row difal-total gnre-total">
                      <span>ICMS ST a Recolher (GNRE):</span>
                      <strong>{formatarMoeda(calculoGNRE.icmsST)}</strong>
                    </div>
                    <div className="difal-formula">
                      ({formatarMoeda(calculoGNRE.baseST)} × {calculoGNRE.aliqInterna}%) − {formatarMoeda(calculoGNRE.icmsProprio)} = {formatarMoeda(calculoGNRE.icmsST)}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Duplicatas (apenas para Boleto) */}
            {formData.forma_pagamento === "15" && (
              <Card title="Duplicatas">
                <div className="produtos-header">
                  <span>{duplicatas.length} duplicata(s)</span>
                  <button type="button" className="btn-adicionar" onClick={() => { setDuplicataForm({ numero: "", data_vencimento: "", valor: "" }); setEditDupIndex(-1); setShowDuplicataModal(true); }}>
                    <Plus size={16} /> Adicionar
                  </button>
                </div>
                {duplicatas.length > 0 && (
                  <div className="produtos-lista">
                    {duplicatas.map((d, i) => (
                      <div key={i} className="produto-item">
                        <div className="produto-info">
                          <strong>Parcela {d.numero}</strong> — Venc: {d.data_vencimento} — {formatarMoeda(parseFloat(d.valor))}
                        </div>
                        <div className="produto-acoes">
                          <button type="button" onClick={() => { setDuplicataForm({ ...d }); setEditDupIndex(i); setShowDuplicataModal(true); }}><Edit3 size={16} /></button>
                          <button type="button" onClick={() => setDuplicatas((prev) => prev.filter((_, j) => j !== i))}><Trash2 size={16} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}

            {/* Botão Emitir */}
            <div className="emitir-submit">
              <Button
                text={loading ? "Processando..." : corrigirRef ? "Reenviar NF-e" : "Emitir NF-e"}
                type="submit"
                variant="primary"
                disabled={loading || produtos.length === 0}
              />
            </div>
          </div>
        </div>
      </form>

      {/* MODAL PRODUTO */}
      {showProdutoModal && (
        <div className="modal-overlay" onClick={() => setShowProdutoModal(false)}>
          <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><Package size={20} /> {editIndex >= 0 ? "Editar Produto" : "Adicionar Produto"}</h3>
              <button className="modal-close" onClick={() => setShowProdutoModal(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="form-row two-cols">
                <Input label="Código *" name="codigo" value={produtoForm.codigo} onChange={handleProdutoChange} required />
                <Input label="NCM * (8 dígitos)" name="ncm" value={produtoForm.ncm} onChange={handleProdutoChange} maxLength={8} required />
              </div>
              <div className="form-row">
                <Input label="Descrição *" name="descricao" value={produtoForm.descricao} onChange={handleProdutoChange} required />
              </div>
              <div className="form-row two-cols">
                <Dropdown label="CFOP *" options={cfopsDisponiveis} value={produtoForm.cfop} onChange={(v) => handleProdutoDropdown("cfop", v)} />
                <Dropdown label="CST *" options={CST_OPTIONS} value={produtoForm.cst} onChange={(v) => handleProdutoDropdown("cst", v)} />
              </div>
              {(produtoForm.cst === "10" || produtoForm.cst === "60") && (
                <div className="form-row">
                  <Input label="CEST (7 dígitos)" name="cest" value={produtoForm.cest} onChange={handleProdutoChange} maxLength={7} />
                </div>
              )}
              <div className="form-row three-cols">
                <Input label="Quantidade *" name="quantidade" type="number" value={produtoForm.quantidade} onChange={handleProdutoChange} min="1" required />
                <Input label="Unidade" name="unidade" value={produtoForm.unidade} onChange={handleProdutoChange} />
                <Input label="Valor Unitário *" name="valor_unitario" type="number" step="0.01" value={produtoForm.valor_unitario} onChange={handleProdutoChange} required />
              </div>
              <div className="form-row total-calculated">
                <span>Valor Total: <strong>{formatarMoeda((parseInt(produtoForm.quantidade || 0) * parseFloat(produtoForm.valor_unitario || 0)))}</strong></span>
              </div>
              <div className="form-row two-cols">
                <Input label="EAN" name="ean" value={produtoForm.ean} onChange={handleProdutoChange} />
                <Input label="Valor Frete (R$)" name="valor_frete" type="number" step="0.01" min="0" value={produtoForm.valor_frete} onChange={handleProdutoChange} />
              </div>
              <div className="form-row">
                <label className="checkbox-label">
                  <input type="checkbox" name="produto_importado" checked={produtoForm.produto_importado} onChange={handleProdutoChange} />
                  Produto Importado
                </label>
              </div>
              {produtoForm.cst === "10" && (
                <div className="form-section-divider">
                  <h4>ICMS Substituição Tributária</h4>
                  <div className="form-row three-cols">
                    <Input label="Alíquota ST (%)" name="aliquota_st_manual" type="number" step="0.01" value={produtoForm.aliquota_st_manual} onChange={handleProdutoChange} />
                    <Input label="Base Cálculo ST" name="icms_base_calculo_st" type="number" step="0.01" value={produtoForm.icms_base_calculo_st} onChange={handleProdutoChange} />
                    <Input label="Valor ICMS ST" name="icms_valor_st" type="number" step="0.01" value={produtoForm.icms_valor_st} onChange={handleProdutoChange} />
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <Button text="Cancelar" variant="secondary" onClick={() => setShowProdutoModal(false)} />
              <Button text={editIndex >= 0 ? "Atualizar" : "Adicionar"} variant="primary" onClick={salvarProduto} />
            </div>
          </div>
        </div>
      )}

      {/* MODAL DUPLICATA */}
      {showDuplicataModal && (
        <div className="modal-overlay" onClick={() => setShowDuplicataModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><CreditCard size={20} /> {editDupIndex >= 0 ? "Editar Duplicata" : "Adicionar Duplicata"}</h3>
              <button className="modal-close" onClick={() => setShowDuplicataModal(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <Input label="Número * (3 dígitos: 001, 002...)" name="numero" value={duplicataForm.numero} onChange={(e) => setDuplicataForm((p) => ({ ...p, numero: formatarNumeroDuplicata(e.target.value) }))} onBlur={(e) => { if (e.target.value) setDuplicataForm((p) => ({ ...p, numero: padNumeroDuplicata(e.target.value) })); }} maxLength={3} placeholder="001" required />
              <Calendar label="Data Vencimento *" name="data_vencimento" value={duplicataForm.data_vencimento} onChange={(e) => setDuplicataForm((p) => ({ ...p, [e.target.name]: e.target.value }))} required />
              <Input label="Valor (R$) *" name="valor" type="number" step="0.01" min="0.01" value={duplicataForm.valor} onChange={(e) => setDuplicataForm((p) => ({ ...p, [e.target.name]: e.target.value }))} required />
            </div>
            <div className="modal-footer">
              <Button text="Cancelar" variant="secondary" onClick={() => setShowDuplicataModal(false)} />
              <Button text={editDupIndex >= 0 ? "Atualizar" : "Adicionar"} variant="primary" onClick={salvarDuplicata} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
