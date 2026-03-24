import React, { useState } from 'react';
import { Card } from '../components/Card';
import './Home.css'; 

export const Vendas = () => {
  const [cliente, setCliente] = useState('');
  const [produto, setProduto] = useState('');
  const [quantidade, setQuantidade] = useState('');

  const handleVender = (e) => {
    e.preventDefault();
    alert('Venda finalizada! Estoque diminuído e conta a receber gerada.');
  };

  return (
    <div className="home-container">
      <div className="home-header">
        <h1>Módulo de Vendas</h1>
        <p className="home-subtitle">Selecione cliente e produtos para venda</p>
      </div>

      <Card className="form-card">
        <form onSubmit={handleVender} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label>Cliente</label>
            <input 
              type="text" 
              value={cliente} 
              onChange={e => setCliente(e.target.value)} 
              className="form-input" 
              placeholder="Nome do Cliente"
              required 
            />
          </div>
          <div>
            <label>Produto Final / Revenda</label>
            <input 
              type="text" 
              value={produto} 
              onChange={e => setProduto(e.target.value)} 
              className="form-input" 
              placeholder="Nome do Produto"
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
            Vender
          </button>
        </form>
      </Card>
    </div>
  );
};
