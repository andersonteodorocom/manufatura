import React, { useState } from 'react';
import { Card } from '../components/Card';
import './Home.css'; 

export const Producao = () => {
  const [produtoX, setProdutoX] = useState('');
  const [quantidade, setQuantidade] = useState('');

  const handleFabricar = (e) => {
    e.preventDefault();
    alert(`Iniciando fabricação de ${quantidade} unidades de ${produtoX}. O sistema irá verificar peças e atualizar estoque.`);
  };

  return (
    <div className="home-container">
      <div className="home-header">
        <h1>Módulo de Produção</h1>
        <p className="home-subtitle">Controle de manufatura e baixa de peças</p>
      </div>

      <Card className="form-card">
        <form onSubmit={handleFabricar} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label>Produto Final a Fabricar</label>
            <input 
              type="text" 
              value={produtoX} 
              onChange={e => setProdutoX(e.target.value)} 
              className="form-input" 
              placeholder="Produto X"
              required 
            />
          </div>
          <div>
            <label>Quantidade de Unidades</label>
            <input 
              type="number" 
              value={quantidade} 
              onChange={e => setQuantidade(e.target.value)} 
              className="form-input" 
              placeholder="10"
              required 
            />
          </div>
          <button type="submit" className="acao-item" style={{ width: 'fit-content', background: 'var(--primary)', color: 'white' }}>
            Fabricar
          </button>
        </form>
      </Card>
    </div>
  );
};
