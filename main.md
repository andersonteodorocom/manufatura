Para que seus agentes de IA (seja no Trae, Antigravit ou Cursor) entendam exatamente o que construir sem alucinar, você precisa de um PRD (Product Requirements Document) técnico e direto.

Copie e cole o conteúdo abaixo em um arquivo chamado CONTEXTO_PROJETO.md na raiz do seu repositório.

📑 Contexto do Projeto: ERP Micro-Manufatura & Revenda
🎯 Objetivo Geral
Desenvolver um sistema de gestão (ERP) simplificado para uma microempresa que opera em dois modelos:

Manufatura: Compra peças de fornecedores (A, B, C), monta o produto final e vende.

Revenda Direta: Compra produtos acabados e revende sem transformação.

🛠️ Stack Tecnológica
Frontend: React + Vite (utilizando o Design System #frontend-template).

Backend: Python (FastAPI recomendado pela performance e tipagem).

Banco de Dados: SQLite (persistido em volume Docker).

Infra: Docker / Coolify.

🏗️ Arquitetura de Dados (Database Schema)
1. Núcleo de Estoque (products)
Diferenciar itens através do campo type:

RAW_MATERIAL: Peças compradas para produção.

FINISHED_GOOD: Produto final fruto de manufatura.

RESALE: Produto comprado pronto para revenda.

2. Estrutura de Produto (BOM - Bill of Materials)
Tabela product_composition para definir a "receita" dos produtos manufaturados:

parent_id (Produto Final) -> child_id (Peça) -> quantity_needed.

3. Fluxo de Movimentação
Compras (purchase_orders): Entrada de estoque + Geração de Contas a Pagar.

Vendas (sales_orders): Saída de estoque + Geração de Contas a Receber.

Produção (production_logs): Ato de "Fabricar". Lógica: Decrementar RAW_MATERIAL e Incrementar FINISHED_GOOD.

📋 Requisitos Funcionais (Backlog)
Módulo 01: Cadastros Base
[ ] CRUD de Fornecedores e Clientes.

[ ] CRUD de Produtos com marcação de categoria e preço de custo/venda.

[ ] Definição da composição (quais peças compõem o Produto X).

Módulo 02: Gestão de Compras (Entrada)
[ ] Registro de Pedido de Compra.

[ ] Atualização automática de estoque ao confirmar recebimento.

[ ] Gatilho automático para o Financeiro (Contas a Pagar).

Módulo 03: Manufatura (Transformação)
[ ] Ordem de Produção: Verificar se há peças em estoque antes de produzir.

[ ] Baixa automática de insumos e entrada do produto acabado.

Módulo 04: Gestão de Vendas (Saída)
[ ] Registro de Pedido de Venda.

[ ] Baixa de estoque (seja revenda ou produto próprio).

[ ] Gatilho automático para o Financeiro (Contas a Receber).

Módulo 05: Financeiro
[ ] Listagem de Contas a Pagar/Receber com status (Pendente/Pago).

[ ] Fluxo de caixa simplificado.

🎨 Padrões de Interface (Frontend)
Nota para a IA: Use os componentes do #frontend-template.

Cards: Para KPIs financeiros no topo.

Tabelas: Para listagem de estoque e pedidos com filtros.

Modais: Para novos cadastros rápidos.

Status Tags: Cores para pedidos (Aberto, Concluído, Cancelado).

🐳 Diretrizes de Deploy
Docker: O backend deve servir os arquivos estáticos do React (build) em produção.

SQLite: O arquivo database.db deve residir na pasta /data para mapeamento de volume.

🚨 Regra de Ouro para a IA:
Ao gerar código de movimentação de estoque, sempre utilize transações (Atomic). Nunca dê baixa em uma peça sem garantir que o produto final foi incrementado.