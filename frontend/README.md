# Frontend Template - React + Vite

Este é um template frontend reutilizável extraído do projeto NFSe Nacional. Contém todos os componentes, páginas e configurações necessárias para iniciar um novo projeto React com Vite.

## 📋 O que está incluído

### Estrutura de Arquivos
```
frontend-template/
├── public/              # Arquivos públicos estáticos
├── src/
│   ├── assets/         # Imagens, ícones e outros assets
│   ├── components/     # Componentes reutilizáveis
│   │   ├── Button.jsx/css
│   │   ├── Calendar.jsx/css
│   │   ├── Card.jsx/css
│   │   ├── Dropdown.jsx/css
│   │   ├── HamburgerButton.jsx/css
│   │   ├── Input.jsx/css
│   │   ├── Loading.jsx/css
│   │   ├── Sidebar.jsx/css
│   │   └── Table.jsx/css
│   ├── pages/          # Páginas da aplicação
│   │   ├── Clientes.jsx/css
│   │   ├── Configuracoes.jsx/css
│   │   ├── EmitirNfse.jsx/css
│   │   ├── Home.jsx/css
│   │   ├── ListNfe.jsx/css
│   │   ├── Login.jsx/css
│   │   ├── Servicos.jsx/css
│   │   └── Usuarios.jsx/css
│   ├── App.jsx         # Componente principal com rotas
│   ├── main.jsx        # Ponto de entrada da aplicação
│   └── index.css       # Estilos globais e variáveis CSS
├── index.html          # HTML base
├── package.json        # Dependências e scripts
├── vite.config.js      # Configuração do Vite
└── eslint.config.js    # Configuração do ESLint
```

## 🎨 Design System

### Tokens de Cores (CSS Variables)
```css
--primary: #605BFF       /* Cor primária (roxo) */
--background: #F5F3FF    /* Cor de fundo */
--background-card: #FFFFFF /* Fundo de cards */
--text: #0F0F1A         /* Cor do texto */
--secondary: #FF7D7D     /* Cor secundária (coral) */
--success: #34D399       /* Verde de sucesso */
--alert: #FBBF24        /* Amarelo de alerta */
--border-form: #dadada   /* Borda de formulários */
```

### Tipografia
- Fonte: **Be Vietnam Pro** (Google Fonts)
- Pesos: 300 (Light), 400 (Regular), 700 (Bold)

## 🚀 Como Usar

### 1. Instalação
```bash
cd frontend-template
npm install
```

### 2. Desenvolvimento
```bash
npm run dev
```
O servidor de desenvolvimento será iniciado em `http://localhost:5173`

### 3. Build para Produção
```bash
npm run build
```

### 4. Preview da Build
```bash
npm run preview
```

## 📦 Dependências Principais

- **React 19.2.0** - Biblioteca principal
- **React Router DOM 7.13.0** - Roteamento
- **Lucide React 0.563.0** - Biblioteca de ícones
- **Vite 7.2.4** - Build tool e dev server

## 🧩 Componentes Disponíveis

### Button
Botão customizável com variantes de estilo.

### Calendar
Componente de calendário para seleção de datas.

### Card
Container de card para organizar conteúdo.

### Dropdown
Menu dropdown para seleção de opções.

### HamburgerButton
Botão hamburger para menu mobile.

### Input
Campo de input com estilização customizada.

### Loading
Indicador de carregamento.

### Sidebar
Barra lateral de navegação responsiva.

### Table
Tabela responsiva para exibição de dados.

## 📱 Responsividade

O template é totalmente responsivo com breakpoints:
- **Desktop**: > 768px
- **Mobile/Tablet**: ≤ 768px

No mobile, a sidebar pode ser aberta/fechada através do HamburgerButton.

## 🛠️ Customização

### Alterando Cores
Edite as variáveis CSS em `src/index.css`:
```css
:root {
  --primary: #605BFF;
  /* ... outras cores ... */
}
```

### Adicionando Novas Rotas
Edite `src/App.jsx`:
```jsx
<Route path="/nova-rota" element={<NovaPage />} />
```

### Criando Novos Componentes
1. Crie o arquivo `.jsx` e `.css` em `src/components/`
2. Importe e use em suas páginas

## 📝 Estrutura de Páginas

Cada página já está configurada com:
- Estrutura base de layout
- Estilos CSS correspondentes
- Integração com a Sidebar
- Responsividade

### Páginas Incluídas
- **Home** - Página inicial
- **Login** - Página de autenticação
- **Clientes** - Gerenciamento de clientes
- **Configurações** - Configurações do sistema
- **EmitirNfse** - Emissão de notas fiscais
- **ListNfe** - Listagem de notas fiscais
- **Servicos** - Gerenciamento de serviços
- **Usuários** - Gerenciamento de usuários

## 🔧 Scripts NPM

```bash
npm run dev      # Inicia servidor de desenvolvimento
npm run build    # Cria build de produção
npm run preview  # Preview da build de produção
npm run lint     # Executa linter
```

## 💡 Dicas

1. **Adapte o conteúdo**: As páginas são exemplos, adapte o conteúdo conforme sua necessidade
2. **Remova o que não precisa**: Exclua páginas e componentes não utilizados
3. **Backend**: Configure a URL da API conforme seu backend
4. **Autenticação**: A página de Login é um exemplo, implemente sua lógica de autenticação

## 📄 Licença

Este template está disponível para uso em seus projetos.

---

**Criado a partir do projeto NFSe Nacional**
