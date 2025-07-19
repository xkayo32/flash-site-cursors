// Dados mockados para desenvolvimento do frontend

export const mockUser = {
  id: '1',
  name: 'João Silva',
  email: 'joao@email.com',
  avatar: 'https://ui-avatars.com/api/?name=João+Silva&background=14242f&color=fff',
  role: 'student' as const,
  subscription: {
    plan: 'Premium',
    expiresAt: '2024-12-31',
    status: 'active'
  }
};

export const mockCourses = [
  {
    id: '1',
    name: 'Agente da Polícia Federal',
    category: 'Polícia',
    progress: 65,
    totalQuestions: 2500,
    totalFlashcards: 800,
    enrolledAt: '2024-01-15'
  },
  {
    id: '2',
    name: 'Auditor Fiscal da Receita Federal',
    category: 'Fiscal',
    progress: 30,
    totalQuestions: 3200,
    totalFlashcards: 1200,
    enrolledAt: '2024-02-01'
  }
];

export const mockQuestions = [
  {
    id: '1',
    statement: 'Qual é o princípio constitucional que estabelece que a Administração Pública deve obedecer aos princípios de legalidade, impessoalidade, moralidade, publicidade e eficiência?',
    subject: 'Direito Constitucional',
    topic: 'Princípios da Administração Pública',
    year: 2023,
    exam: 'CESPE',
    difficulty: 'medium',
    alternatives: [
      { id: 'a', text: 'Princípio da Supremacia do Interesse Público', correct: false },
      { id: 'b', text: 'Princípio da Eficiência Administrativa', correct: false },
      { id: 'c', text: 'Artigo 37 da CF/88', correct: true },
      { id: 'd', text: 'Princípio da Continuidade', correct: false }
    ],
    explanation: 'O artigo 37 da Constituição Federal de 1988 estabelece expressamente os princípios da administração pública: LIMPE.',
    answered: false,
    userAnswer: null
  },
  // Mais questões...
];

export const mockFlashcards = [
  {
    id: '1',
    deckId: '1',
    deckName: 'Direito Constitucional - Princípios',
    front: 'Quais são os princípios da Administração Pública (LIMPE)?',
    back: 'Legalidade, Impessoalidade, Moralidade, Publicidade, Eficiência',
    difficulty: 2.5,
    interval: 1,
    nextReview: new Date().toISOString(),
    reviews: 0
  },
  {
    id: '2',
    deckId: '1',
    deckName: 'Direito Constitucional - Princípios',
    front: 'O que é o princípio da impessoalidade?',
    back: 'A Administração deve tratar todos os administrados sem discriminações. Nem favoritismos nem perseguições são toleráveis.',
    difficulty: 2.5,
    interval: 1,
    nextReview: new Date().toISOString(),
    reviews: 0
  }
];

export const mockDecks = [
  {
    id: '1',
    name: 'Direito Constitucional - Princípios',
    category: 'Direito Constitucional',
    cardCount: 45,
    dueToday: 12,
    newToday: 5,
    learnToday: 8
  },
  {
    id: '2',
    name: 'Português - Regência',
    category: 'Português',
    cardCount: 30,
    dueToday: 5,
    newToday: 3,
    learnToday: 2
  }
];

export const mockStatistics = {
  questionsAnswered: 1234,
  correctAnswers: 987,
  flashcardsReviewed: 456,
  studyStreak: 15,
  totalStudyTime: 3456, // minutos
  performanceBySubject: [
    { subject: 'Direito Constitucional', percentage: 78 },
    { subject: 'Português', percentage: 85 },
    { subject: 'Direito Administrativo', percentage: 72 },
    { subject: 'Informática', percentage: 90 },
    { subject: 'Raciocínio Lógico', percentage: 65 }
  ],
  studyCalendar: [
    { date: '2024-01-01', minutes: 120 },
    { date: '2024-01-02', minutes: 90 },
    { date: '2024-01-03', minutes: 150 },
    // ... mais dias
  ]
};

export const mockSimulations = [
  {
    id: '1',
    name: 'Simulado PF - Agente',
    questions: 120,
    duration: 240, // minutos
    attempts: 2,
    bestScore: 78,
    lastAttempt: '2024-01-20'
  },
  {
    id: '2',
    name: 'Simulado RFB - Auditor',
    questions: 150,
    duration: 300,
    attempts: 1,
    bestScore: 65,
    lastAttempt: '2024-01-15'
  }
];