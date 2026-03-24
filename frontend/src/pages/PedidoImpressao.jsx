import React, { useState } from 'react';
import './PedidoImpressao.css';

export const PedidoImpressao = () => {
  // Dados de exemplo, posteriormente podem vir via props ou context/API
  const emitente = {
    razaoSocial: "SUA EMPRESA LTDA",
    cnpj: "00.000.000/0001-00",
    endereco: "Rua Exemplo, 123 - Centro, São Paulo/SP",
    telefone: "(11) 99999-9999",
    email: "contato@suaempresa.com.br"
  };

  const destinatario = {
    nome: "Cliente Exemplo S.A.",
    cpfCnpj: "11.111.111/0001-11",
    endereco: "Av. Comercial, 456 - Bairro Novo, Rio de Janeiro/RJ",
    telefone: "(21) 88888-8888",
    email: "compras@clienteexemplo.com.br"
  };

  const itens = [
    { codigo: "001", descricao: "Produto Exemplo A", qtd: 2, valorUnitario: 150.00 },
    { codigo: "002", descricao: "Produto Exemplo B", qtd: 1, valorUnitario: 300.00 },
    { codigo: "003", descricao: "Serviço de Instalação", qtd: 1, valorUnitario: 100.00 },
  ];

  const total = itens.reduce((acc, item) => acc + (item.qtd * item.valorUnitario), 0);

  const [formaPagamento, setFormaPagamento] = useState('');
  const [observacao, setObservacao] = useState('');

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="pedido-impressao-container">
      <div className="print-controls no-print">
        <button className="btn-print" onClick={handlePrint}>🖨️ Imprimir Pedido</button>
        <p className="print-tip">Dica: Selecione a opção "A4" e marque "Imprimir gráficos de plano de fundo" nas configurações da impressora.</p>
      </div>

      <div className="a4-page">
        <header className="page-header">
          <h1>PEDIDO DE VENDA</h1>
          <div className="pedido-info">
            <p><strong>Nº do Pedido:</strong> 001234</p>
            <p><strong>Data:</strong> {new Date().toLocaleDateString('pt-BR')}</p>
          </div>
        </header>

        <section className="info-section emitente-section">
          <h2>EMITENTE</h2>
          <div className="info-grid">
            <p><strong>Razão Social:</strong> {emitente.razaoSocial}</p>
            <p><strong>CNPJ:</strong> {emitente.cnpj}</p>
            <p><strong>Endereço:</strong> {emitente.endereco}</p>
            <p><strong>Telefone:</strong> {emitente.telefone}</p>
            <p><strong>E-mail:</strong> {emitente.email}</p>
          </div>
        </section>

        <section className="info-section destinatario-section">
          <h2>DESTINATÁRIO / CLIENTE</h2>
          <div className="info-grid">
            <p><strong>Nome/Razão Social:</strong> {destinatario.nome}</p>
            <p><strong>CPF/CNPJ:</strong> {destinatario.cpfCnpj}</p>
            <p><strong>Endereço:</strong> {destinatario.endereco}</p>
            <p><strong>Telefone:</strong> {destinatario.telefone}</p>
            <p><strong>E-mail:</strong> {destinatario.email}</p>
          </div>
        </section>

        <section className="itens-section">
          <h2>ITENS DO PEDIDO</h2>
          <table className="print-table">
            <thead>
              <tr>
                <th>Cód.</th>
                <th>Descrição do Produto</th>
                <th className="text-center">Qtd.</th>
                <th className="text-right">V. Unitário</th>
                <th className="text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {itens.map((item, index) => (
                <tr key={index}>
                  <td>{item.codigo}</td>
                  <td>{item.descricao}</td>
                  <td className="text-center">{item.qtd}</td>
                  <td className="text-right">{formatCurrency(item.valorUnitario)}</td>
                  <td className="text-right">{formatCurrency(item.qtd * item.valorUnitario)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="4" className="text-right"><strong>TOTAL DO PEDIDO:</strong></td>
                <td className="text-right total-value"><strong>{formatCurrency(total)}</strong></td>
              </tr>
            </tfoot>
          </table>
        </section>

        <section className="footer-section">
          <div className="pagamento-box">
            <h2>FORMA DE PAGAMENTO</h2>
            <select 
              value={formaPagamento} 
              onChange={(e) => setFormaPagamento(e.target.value)}
              className="print-input select-pagamento"
            >
              <option value="">Selecione uma forma de pagamento...</option>
              <option value="dinheiro">Dinheiro</option>
              <option value="pix">PIX</option>
              <option value="cartao_credito">Cartão de Crédito</option>
              <option value="cartao_debito">Cartão de Débito</option>
              <option value="boleto">Boleto Bancário</option>
              <option value="transferencia">Transferência Bancária</option>
            </select>
            <p className="print-only-text">
              <strong>Selecionado:</strong> {formaPagamento ? formaPagamento.toUpperCase().replace('_', ' ') : '________________________________________'}
            </p>
          </div>

          <div className="observacao-box">
            <h2>OBSERVAÇÕES</h2>
            <textarea 
              value={observacao} 
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="Digite aqui alguma observação sobre o pedido..."
              className="print-input textarea-obs"
              rows="4"
            ></textarea>
            <p className="print-only-text">
              {observacao ? observacao : <span style={{display: 'block', minHeight: '60px'}}></span>}
            </p>
          </div>
        </section>

        <div className="signatures">
          <div className="signature-line">
            <span>Assinatura do Emitente</span>
          </div>
          <div className="signature-line">
            <span>Assinatura do Cliente</span>
          </div>
        </div>
      </div>
    </div>
  );
};
