# Projeto CardFácil (Estudo de Desenvolvimento Web)

Este é o **CardFácil**, um projeto desenvolvido para praticar e aplicar conceitos de desenvolvimento web. A aplicação simula uma plataforma para criação e visualização de cardápios digitais.

## 🎯 Objetivos de Estudo

O desenvolvimento deste projeto foca na aplicação prática dos seguintes tópicos:

* **Backend:** Criação de APIs RESTful com Node.js e Express.js, incluindo roteamento, middlewares e lógica de servidor.
* **Frontend:** Renderização de páginas no servidor com Handlebars.js, manipulação do DOM com JavaScript e estilização com CSS.
* **Banco de Dados:** Operações CRUD e interação com um banco de dados SQLite usando `better-sqlite3`.
* **Autenticação:** Implementação de cadastro, login e gerenciamento de sessões.
* **Upload de Arquivos:** Tratamento de uploads de imagens.
* **Validação de Dados:** Validações no cliente e no servidor.

## ✨ Funcionalidades Implementadas

Como exercício prático, algumas funcionalidades foram desenvolvidas, por exemplo:

* Sistema de cadastro e login para administradores de cardápios.
* Gerenciamento de sessão de usuário.
* Formulário para adição de novos pratos, incluindo upload de imagem.
* Renderização condicional de elementos no frontend (Handlebars) com base no status de login.
* Notificações (toasts) para feedback de ações.

## 💻 Tecnologias Utilizadas

* **Backend:** Node.js, Express.js
* **Frontend:** HTML, CSS (com Variáveis CSS), JavaScript (Vanilla)
* **Template Engine:** Handlebars.js (com `express-handlebars`)
* **Sessões:** `express-session` (utilizando `connect-better-sqlite3` para persistência em SQLite)
* **Uploads:** `multiparty`
* **Banco de Dados:** SQLite (através da biblioteca `better-sqlite3`)
* **Ícones:** Font Awesome

## 🚀 Como Rodar o Projeto Localmente

Para configurar e executar o projeto em um ambiente de desenvolvimento local:

### Pré-requisitos:
* Node.js (versão LTS recomendada)
* npm (geralmente incluído com o Node.js)

### Passos:
1.  Clone o repositório:
    ```bash
    git clone [SUA_URL_DO_REPOSITORIO_AQUI]
    cd cardFacil
    ```
2.  Instale as dependências:
    ```bash
    npm install
    ```
3.  **Configuração do Banco de Dados (SQLite - arquivo `.db`):**
    * O projeto utiliza `better-sqlite3` para interagir com um arquivo de banco de dados SQLite (com extensão `.db`).
    * No código de conexão com o banco (geralmente onde você instancia `new Database('caminho/do/arquivo.db')`), o arquivo `.db` será criado automaticamente se não existir, na primeira vez que a aplicação tentar acessá-lo.
    * **Estrutura das Tabelas:** [Se você tiver um script SQL (ex: `schema.sql`) para definir a estrutura das tabelas, mencione aqui como executá-lo. Por exemplo: "Para criar as tabelas, você pode usar um cliente SQLite para executar os comandos em `schema.sql` no arquivo `.db` gerado, ou se houver um script de inicialização como `node scripts/init-db.js`, execute-o."]

4.  **Variáveis de Ambiente (se aplicável):**
    * Se um arquivo `.env.example` existir, copie-o para `.env` e preencha as variáveis necessárias, como `SESSION_SECRET` e o caminho para o seu arquivo de banco de dados.
    ```env
    PORT=3000
    SESSION_SECRET='seu_segredo_aqui_bem_seguro'
    DB_PATH='./nome_do_seu_banco.db' # Exemplo de caminho para o arquivo .db
    ```
5.  Inicie o servidor:
    ```bash
    node index.js
    ```
    (Se você tiver um script `start` configurado no seu `package.json` para rodar `node index.js`, você também poderá usar `npm start`.)

    A aplicação estará acessível em: `http://localhost:3000` (ou na porta configurada).

## 🚧 Status e Próximos Passos do Estudo

Este projeto está em desenvolvimento como parte de um contínuo aprendizado.
* **Implementado:** [Ex: Autenticação de usuários, funcionalidade básica de adição de pratos com `better-sqlite3`].
* **Planejado para estudo futuro:** [Ex: Funcionalidades de edição/exclusão usando `better-sqlite3`, melhorias na API, implementação de testes, deploy].

---
O código-fonte está disponível para exploração e como referência para estudos em desenvolvimento web.