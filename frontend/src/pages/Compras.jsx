import React, { useState } from 'react';
import { Card } from '../components/Card';
import './Home.css'; // Reusing some styles

export const Compras = () => {
  const [fornecedor, setFornecedor] = useState('');
  const [produto, setProduto] = useState('');
  const [quantidade, setQuantidade] = useState('');

  const handleFinalizar = (e) => {
    e.preventDefault();
    alert('Compra finalizada! Estoque das peças aumentado e conta a pagar gerada.');
  };

  return (
    <div className="home-container">
      <div className="home-header">
        <h1>Módulo de Compras</h1>
        <p className="home-subtitle">Cadastre pedidos aos fornecedores</p>
      </div>

      <Card className="form-card">
        <form onSubmit={handleFinalizar} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label>Fornecedor</label>
            <input 
              type="text" 
              value={fornecedor} 
              onChange={e => setFornecedor(e.target.value)} 
              className="form-input" 
              placeholder="Nome do Fornecedor"
              required 
            />
          </div>
          <div>
            <label>Peça / Produto</label>
            <input 
              type="text" 
              value={produto} 
              onChange={e => setProduto(e.target.value)} 
              className="form-input" 
              placeholder="Nome da Peça"
              required 
            />
          </div>
          <div>
            <label>Quantidade</label>
            <input 
              type="number" 
              value={quantidade} 
              onChange={e => setQuantidade(e.target.value)} 
              className="form-input" 
              placeholder="0"
              required 
            />
          </div>
          <button type="submit" className="acao-item" style={{ width: 'fit-content', background: 'var(--primary)', color: 'white' }}>
            Finalizar Compra
          </button>
        </form>
      </Card>
    </div>
  );
};
