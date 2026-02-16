# 🌟 Cofre Mágico Kids

Um aplicativo web progressivo (PWA) desenvolvido pela **Franz TI Services** para revolucionar a forma como os pais ensinam educação financeira e responsabilidade aos filhos. Através de um sistema gamificado, as crianças aprendem o valor do esforço, enquanto os pais têm total controlo sobre tarefas e recompensas.

## 🚀 Funcionalidades Principais

O sistema foi desenhado com uma arquitetura **SaaS (Software as a Service)** Multi-Inquilino, garantindo que cada família tenha o seu ambiente isolado.

* **👨‍🏫 Painel do Pai (Admin):**
  * Criação e edição de tarefas financeiras (Obrigatórias e Extras).
  * Gestão de cofres de múltiplos filhos.
  * Aplicação de penalidades rápidas (comportamentais).
  * Histórico diário e cálculo automático de ganhos mensais.

* **🎮 Painel da Criança:**
  * Interface amigável e focada (sem distrações).
  * Bloqueio de tarefas Extras até que as Obrigações Matinais/Noturnas sejam cumpridas.
  * Consulta em tempo real do "Dinheirinho" acumulado.
  * Histórico de conquistas e alertas de comportamento.

* **📱 Progressive Web App (PWA):**
  * Instalação direta no smartphone (Android e iOS) sem passar pelas lojas de aplicativos.
  * Banner inteligente de convite à instalação.

## 🛠️ Tecnologias e Arquitetura

Este projeto foi construído focando em alta performance, segurança e ausência de dependências pesadas no front-end:

* **Frontend:** HTML5, CSS3 Responsivo (Mobile-First) e Vanilla JavaScript.
* **Backend & Banco de Dados:** [Supabase](https://supabase.com/) (PostgreSQL).
* **Autenticação:** Supabase Auth integrado.
* **Segurança:** Implementação rígida de **RLS (Row Level Security)** diretamente no banco de dados. Um utilizador só tem acesso de leitura/escrita aos dados da sua própria família, impossibilitando fugas de informação mesmo que a chave de API pública seja intercetada.
* **Hospedagem Frontend:** Vercel / GitHub Pages.

## 🔒 Proteção de Dados (LGPD)

O aplicativo foi desenhado respeitando o **Artigo 14 da LGPD**, garantindo que nenhum dado comportamental ou pessoal das crianças seja utilizado para rastreamento, venda ou publicidade. A coleta de métricas de negócio é restrita ao perfil dos Pais, com aceite explícito de Termos de Uso no momento do registo.

---

**Desenvolvido com 💻 e ☕ por Franz TI Services.**
