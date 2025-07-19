### **Projeto: Plataforma de Estudos Interativa**

**1\. Visão Geral do Projeto**

O objetivo é criar uma plataforma web educacional (SaaS) voltada para a preparação de estudantes para concursos e exames. O sistema oferecerá acesso a um vasto banco de questões, flashcards com repetição espaçada, resumos interativos, simulados e planos de estudo personalizados, gerenciados através de um modelo de assinatura.

**2\. Papéis de Usuário (User Roles)**

* **Administrador:** Responsável por gerenciar todo o conteúdo da plataforma (cursos, questões, flashcards, resumos, legislação), gerenciar assinaturas e visualizar dados de uso da plataforma.  
* **Aluno (Usuário Registrado):** Acessa a plataforma através de uma assinatura paga, consome o conteúdo, resolve questões/flashcards e acompanha seu próprio desempenho e evolução.  
* **Visitante (Usuário Não Autenticado):** Navega pela página pública (landing page), visualiza informações sobre cursos e funcionalidades, mas não tem acesso ao conteúdo de estudo.

**3\. Estrutura da Plataforma**

#### **3.1. Área Pública (Acessível a Visitantes)**

* **Página Inicial (Landing Page):**  
  * **Seções:** Apresentação do projeto, catálogo de cursos, descrição dos materiais (questões, flashcards, etc.), depoimentos de alunos, FAQ, e contatos.  
  * **CTAs (Call to Action):** Botões para "Assinar Agora" (levando ao checkout) e "Área do Aluno" (levando à página de login).

#### **3.2. Área do Aluno (Acessível a Alunos com Assinatura Ativa)**

* **3.2.1. Autenticação:**  
  * Página de **Login** com e-mail e senha.  
  * Fluxo de recuperação de senha.  
* **3.2.2. Painel Principal (Dashboard):**  
  * **Visão Geral:** Exibe um resumo do progresso do aluno.  
    * Cursos/Turmas em que está matriculado.  
    * Estatísticas de aproveitamento geral (percentual de acertos).  
    * Gráficos com a quantidade de questões e flashcards resolvidos por período (dia, semana).  
    * Calendário de estudos (integrado com o cronograma).  
* **3.2.3. Barra de Navegação Lateral (Sidebar):**  
  * **Home:** Retorna ao Dashboard do aluno.  
  * **Cursos:** Catálogo completo de cursos disponíveis na plataforma.  
  * **Cronograma:** Exibe o plano de estudos personalizado.  
  * **Simulados:** Acesso aos simulados vinculados aos cursos do aluno.  
  * **Flashcards:** Acesso ao módulo de flashcards.  
  * **Questões:** Acesso ao banco de questões.  
  * **Resumos Interativos:** Acesso aos resumos das matérias.  
  * **Legislação:** Acesso aos textos de leis relevantes para os cursos.  
  * **Painel Tático:** Dashboard detalhado de desempenho.  
  * **Gerenciar Assinatura:** Página para o aluno visualizar, atualizar ou cancelar sua assinatura.

#### **3.3. Detalhamento das Funcionalidades**

* **3.3.1. Cronograma Personalizado (Integração com IA):**  
  * **Input do Aluno:** O aluno informa a data da prova e o edital/curso desejado.  
  * **Processamento (IA):** A IA analisa o conteúdo programático do edital e o tempo disponível.  
  * **Output:** Gera um cronograma de estudos diário e semanal, distribuindo as matérias e revisões de forma otimizada para que o aluno cubra todo o conteúdo até a data da prova.  
* **3.3.2. Módulo de Flashcards:**  
  * **Algoritmo:** Utiliza um sistema de **Repetição Espaçada (SRS)**, similar ao Anki, para otimizar a memorização.  
  * **Conteúdo:** Os flashcards são criados e inseridos exclusivamente pelo **Administrador**.  
  * **Interação do Aluno:**  
    * O aluno pode criar seus próprios "decks" (conjuntos de estudo) a partir dos flashcards existentes na plataforma.  
    * Pode filtrar flashcards por matéria, assunto, etc.  
    * Resolve os cards, classificando sua dificuldade (Ex: "Errei", "Bom", "Fácil") para o algoritmo calcular a próxima revisão.  
  * **Dashboard de Flashcards:** Exibe estatísticas de desempenho, cards a revisar e histórico.  
  * **Funcionalidade Extra:** Permitir que o aluno importe seus próprios decks do Anki.  
* **3.3.3. Módulo de Questões:**  
  * **Conteúdo:** Banco de questões inseridas e categorizadas pelo **Administrador**.  
  * **Interação do Aluno:**  
    * Pode criar cadernos de questões usando filtros avançados (matéria, assunto, banca, ano, etc.).  
    * Pode acessar listas de questões pré-selecionadas pelo Administrador para carreiras ou cursos específicos.  
    * Resolve as questões, vê o gabarito, comentários (se houver) e estatísticas.  
* **3.3.4. Resumos Interativos:**  
  * **Criação (Administrador):** O Administrador cria resumos em um editor de texto rico, onde pode formatar o texto (negrito, sublinhado) e **incorporar flashcards e questões** diretamente do banco de dados da plataforma.  
  * **Interação do Aluno:** O aluno estuda pelo resumo e pode resolver os cards e questões incorporados no próprio texto. O progresso é sincronizado com os módulos principais (as questões/cards resolvidos aqui contam nas estatísticas gerais).  
* **3.3.5. Painel Tático:**  
  * Um dashboard avançado que cruza informações de desempenho, mostrando a evolução do aluno por disciplina, o avanço no edital, pontos fortes e fracos, e comparação de desempenho entre questões e flashcards.

**4\. Requisitos Técnicos e de Negócio**

* **Modelo de Assinatura:**  
  * Implementar um sistema de checkout integrado para pagamento de assinaturas (cartão de crédito, Pix).  
  * Após a confirmação do pagamento, o acesso ao curso/plataforma é liberado automaticamente.  
  * O acesso do aluno possui uma data de expiração, vinculada ao plano de assinatura adquirido.  
  * O acesso a qualquer funcionalidade paga por um não assinante deve redirecioná-lo para a página de vendas/assinatura.  
* **Design e UX/UI:**  
  * O site deve ser totalmente **responsivo**, adaptando-se a desktops, tablets e smartphones.  
  * Implementar um botão para alternar entre os temas **Claro (Light Mode) e Escuro (Dark Mode)**.