// Máscaras e validações - migrado de nfe.js

export const aplicarMascaraCPF = (valor) => {
  const nums = valor.replace(/\D/g, "").slice(0, 11);
  return nums
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
};

export const aplicarMascaraCNPJ = (valor) => {
  const nums = valor.replace(/\D/g, "").slice(0, 14);
  return nums
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
};

export const aplicarMascaraCEP = (valor) => {
  const nums = valor.replace(/\D/g, "").slice(0, 8);
  return nums.replace(/(\d{5})(\d)/, "$1-$2");
};

export const limparMascara = (valor) => valor.replace(/\D/g, "");

export const validarDigitosCPF = (cpf) => {
  const nums = cpf.replace(/\D/g, "");
  if (nums.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(nums)) return false;
  
  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(nums[i]) * (10 - i);
  let d1 = (soma * 10) % 11;
  if (d1 === 10) d1 = 0;
  if (d1 !== parseInt(nums[9])) return false;
  
  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(nums[i]) * (11 - i);
  let d2 = (soma * 10) % 11;
  if (d2 === 10) d2 = 0;
  return d2 === parseInt(nums[10]);
};

export const validarDigitosCNPJ = (cnpj) => {
  const nums = cnpj.replace(/\D/g, "");
  if (nums.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(nums)) return false;
  
  const pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let soma = 0;
  for (let i = 0; i < 12; i++) soma += parseInt(nums[i]) * pesos1[i];
  let d1 = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (d1 !== parseInt(nums[12])) return false;
  
  const pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  soma = 0;
  for (let i = 0; i < 13; i++) soma += parseInt(nums[i]) * pesos2[i];
  let d2 = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  return d2 === parseInt(nums[13]);
};

export const validarNCM = (ncm) => /^\d{8}$/.test(ncm);
export const validarCEST = (cest) => /^\d{7}$/.test(cest);

export const formatarMoeda = (valor) => {
  const num = parseFloat(valor) || 0;
  return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};

export const formatarData = (data) => {
  if (!data) return "-";
  try {
    const d = new Date(data);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("pt-BR");
  } catch {
    return data;
  }
};

export const formatarDocumento = (doc) => {
  if (!doc) return "-";
  const nums = doc.replace(/\D/g, "");
  if (nums.length === 11) return aplicarMascaraCPF(nums);
  if (nums.length === 14) return aplicarMascaraCNPJ(nums);
  return doc;
};

export const UFS = [
  "AC", "AL", "AM", "AP", "BA", "CE", "DF", "ES", "GO", "MA", 
  "MG", "MS", "MT", "PA", "PB", "PE", "PI", "PR", "RJ", "RN",
  "RO", "RR", "RS", "SC", "SE", "SP", "TO"
];

export const FORMAS_PAGAMENTO = [
  { value: "0", label: "Pagamento à Vista" },
  { value: "1", label: "Dinheiro" },
  { value: "2", label: "Cheque" },
  // Cartão de Crédito (3) e Débito (4) ocultados - requerem dados adicionais da credenciadora
  { value: "5", label: "Crédito Loja" },
  { value: "10", label: "Vale Alimentação" },
  { value: "11", label: "Vale Refeição" },
  { value: "12", label: "Vale Presente" },
  { value: "13", label: "Vale Combustível" },
  { value: "14", label: "Duplicata Mercantil" },
  { value: "15", label: "Boleto Bancário" },
  { value: "16", label: "Depósito Bancário" },
  { value: "17", label: "PIX" },
  { value: "18", label: "Transferência bancária, Carteira Digital" },
  { value: "19", label: "Programa de fidelidade, Cashback, Crédito Virtual" },
  { value: "90", label: "Sem Pagamento" },
  { value: "99", label: "Outros" },
];

export const MODALIDADES_FRETE = [
  { value: "0", label: "0 - Contratação do Frete por conta do Remetente (CIF)" },
  { value: "1", label: "1 - Contratação do Frete por conta do Destinatário (FOB)" },
  { value: "2", label: "2 - Contratação do Frete por conta de Terceiros" },
  { value: "3", label: "3 - Transporte Próprio por conta do Remetente" },
  { value: "4", label: "4 - Transporte Próprio por conta do Destinatário" },
  { value: "9", label: "9 - Sem Ocorrência de Transporte" },
];
