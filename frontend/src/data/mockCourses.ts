// Dados mockados para cursos - Sistema Militar/Policial
export interface MockCourse {
  id: number;
  title: string;
  category: string;
  instructor: {
    name: string;
    avatar: string;
    rank: string;
  };
  status: 'PUBLICADO' | 'RASCUNHO' | 'ARQUIVADO';
  price: number;
  duration: {
    months: number;
    hours: number;
  };
  description: string;
  thumbnail: string;
  stats: {
    enrollments: number;
    modules: number;
    lessons: number;
    rating: number;
    completion: number;
    views: number;
  };
  resources: {
    videos: number;
    questions: number;
    flashcards: number;
    summaries: number;
    laws: number;
    documents: number;
  };
  tags: string[];
  level: 'OPERACIONAL' | 'TÁTICO' | 'COMANDO';
  nextBatch: string;
  createdAt: string;
  updatedAt: string;
  difficulty: 'INICIANTE' | 'INTERMEDIÁRIO' | 'AVANÇADO';
  certification: boolean;
  requirements: string[];
  objectives: string[];
}

export const mockCourses: MockCourse[] = [
  {
    id: 1,
    title: 'CURSO COMPLETO POLÍCIA FEDERAL - AGENTE',
    category: 'POLÍCIA FEDERAL',
    instructor: {
      name: 'Delegado Carlos Lima',
      avatar: 'https://ui-avatars.com/api/?name=Carlos+Lima&background=14242f&color=fff',
      rank: 'DELEGADO FEDERAL'
    },
    status: 'PUBLICADO',
    price: 497,
    duration: { months: 6, hours: 280 },
    description: 'Preparação completa para o concurso de Agente da Polícia Federal com simulados, questões e materiais atualizados conforme o novo edital.',
    thumbnail: '',
    stats: {
      enrollments: 1234,
      modules: 24,
      lessons: 186,
      rating: 4.9,
      completion: 87,
      views: 15420
    },
    resources: {
      videos: 186,
      questions: 3500,
      flashcards: 1200,
      summaries: 48,
      laws: 156,
      documents: 89
    },
    tags: ['PF', 'Agente', 'Concurso', 'Federal', 'Investigação'],
    level: 'OPERACIONAL',
    nextBatch: '2024-03-01',
    createdAt: '2024-01-15',
    updatedAt: '2024-02-20',
    difficulty: 'INTERMEDIÁRIO',
    certification: true,
    requirements: [
      'Ensino superior completo',
      'Conhecimentos básicos em direito',
      'Disponibilidade para estudos dedicados'
    ],
    objectives: [
      'Dominar todas as disciplinas do concurso da PF',
      'Resolver questões de provas anteriores',
      'Preparar-se para a prova física e psicotécnica'
    ]
  },
  {
    id: 2,
    title: 'PREPARAÇÃO TÁTICA - POLÍCIA MILITAR SP',
    category: 'POLÍCIA MILITAR',
    instructor: {
      name: 'Major Ana Santos',
      avatar: 'https://ui-avatars.com/api/?name=Ana+Santos&background=14242f&color=fff',
      rank: 'MAJOR PM'
    },
    status: 'PUBLICADO',
    price: 397,
    duration: { months: 4, hours: 180 },
    description: 'Treinamento intensivo para concurso da Polícia Militar do Estado de São Paulo com foco em preparação física e conhecimentos específicos.',
    thumbnail: '',
    stats: {
      enrollments: 892,
      modules: 18,
      lessons: 142,
      rating: 4.8,
      completion: 92,
      views: 8760
    },
    resources: {
      videos: 142,
      questions: 2800,
      flashcards: 800,
      summaries: 36,
      laws: 98,
      documents: 67
    },
    tags: ['PM', 'São Paulo', 'Soldado', 'Estadual', 'TAF'],
    level: 'TÁTICO',
    nextBatch: '2024-02-15',
    createdAt: '2024-01-08',
    updatedAt: '2024-02-18',
    difficulty: 'INTERMEDIÁRIO',
    certification: true,
    requirements: [
      'Ensino médio completo',
      'Idade entre 18 e 30 anos',
      'Preparo físico básico'
    ],
    objectives: [
      'Aprovação no concurso da PM-SP',
      'Preparação para o TAF (Teste de Aptidão Física)',
      'Conhecimento da legislação militar'
    ]
  },
  {
    id: 3,
    title: 'ELITE - DELEGADO POLÍCIA CIVIL',
    category: 'POLÍCIA CIVIL',
    instructor: {
      name: 'Dr. Roberto Mendes',
      avatar: 'https://ui-avatars.com/api/?name=Roberto+Mendes&background=14242f&color=fff',
      rank: 'DELEGADO CIVIL'
    },
    status: 'RASCUNHO',
    price: 897,
    duration: { months: 8, hours: 420 },
    description: 'Formação completa para o cargo de Delegado de Polícia Civil com foco em direito penal, processual penal e técnicas de investigação.',
    thumbnail: '',
    stats: {
      enrollments: 0,
      modules: 32,
      lessons: 245,
      rating: 0,
      completion: 0,
      views: 234
    },
    resources: {
      videos: 245,
      questions: 4200,
      flashcards: 1800,
      summaries: 64,
      laws: 189,
      documents: 156
    },
    tags: ['PC', 'Delegado', 'Civil', 'Direito', 'Investigação'],
    level: 'COMANDO',
    nextBatch: '2024-04-01',
    createdAt: '2024-02-01',
    updatedAt: '2024-02-20',
    difficulty: 'AVANÇADO',
    certification: true,
    requirements: [
      'Bacharel em Direito',
      'Experiência em área jurídica (desejável)',
      'Dedicação integral aos estudos'
    ],
    objectives: [
      'Dominar direito penal e processual penal',
      'Aprender técnicas de investigação criminal',
      'Preparar-se para liderança policial'
    ]
  },
  {
    id: 4,
    title: 'OPERAÇÕES ESPECIAIS - FORÇAS ARMADAS',
    category: 'FORÇAS ARMADAS',
    instructor: {
      name: 'Coronel Silva',
      avatar: 'https://ui-avatars.com/api/?name=Coronel+Silva&background=14242f&color=fff',
      rank: 'CORONEL'
    },
    status: 'PUBLICADO',
    price: 697,
    duration: { months: 6, hours: 360 },
    description: 'Preparação para concursos das Forças Armadas: Exército, Marinha e Aeronáutica. Inclui estratégia militar e liderança.',
    thumbnail: '',
    stats: {
      enrollments: 567,
      modules: 28,
      lessons: 224,
      rating: 4.7,
      completion: 85,
      views: 6890
    },
    resources: {
      videos: 224,
      questions: 4200,
      flashcards: 1500,
      summaries: 56,
      laws: 178,
      documents: 134
    },
    tags: ['Exército', 'Marinha', 'Aeronáutica', 'Militar', 'EsPCEx'],
    level: 'OPERACIONAL',
    nextBatch: '2024-03-15',
    createdAt: '2024-01-20',
    updatedAt: '2024-02-22',
    difficulty: 'AVANÇADO',
    certification: true,
    requirements: [
      'Ensino médio completo',
      'Aptidão física',
      'Disciplina militar'
    ],
    objectives: [
      'Aprovar em concursos militares',
      'Desenvolver liderança militar',
      'Conhecer estratégia e tática'
    ]
  },
  {
    id: 5,
    title: 'RECEITA FEDERAL - AUDITOR FISCAL',
    category: 'RECEITA FEDERAL',
    instructor: {
      name: 'Auditor Pedro Costa',
      avatar: 'https://ui-avatars.com/api/?name=Pedro+Costa&background=14242f&color=fff',
      rank: 'AUDITOR FISCAL'
    },
    status: 'PUBLICADO',
    price: 797,
    duration: { months: 10, hours: 450 },
    description: 'Preparação completa para Auditor Fiscal da Receita Federal com foco em direito tributário, contabilidade e auditoria.',
    thumbnail: '',
    stats: {
      enrollments: 456,
      modules: 35,
      lessons: 298,
      rating: 4.9,
      completion: 78,
      views: 5670
    },
    resources: {
      videos: 298,
      questions: 5200,
      flashcards: 2100,
      summaries: 70,
      laws: 245,
      documents: 189
    },
    tags: ['RF', 'Auditor', 'Fiscal', 'Tributário', 'Contabilidade'],
    level: 'COMANDO',
    nextBatch: '2024-05-01',
    createdAt: '2024-01-10',
    updatedAt: '2024-02-25',
    difficulty: 'AVANÇADO',
    certification: true,
    requirements: [
      'Superior em área específica',
      'Conhecimentos em contabilidade',
      'Dedicação mínima de 6h/dia'
    ],
    objectives: [
      'Dominar direito tributário',
      'Conhecer técnicas de auditoria',
      'Preparar-se para um dos melhores concursos'
    ]
  },
  {
    id: 6,
    title: 'TRIBUNAL DE JUSTIÇA - ANALISTA',
    category: 'TRIBUNAIS',
    instructor: {
      name: 'Dra. Maria Oliveira',
      avatar: 'https://ui-avatars.com/api/?name=Maria+Oliveira&background=14242f&color=fff',
      rank: 'DESEMBARGADORA'
    },
    status: 'PUBLICADO',
    price: 547,
    duration: { months: 5, hours: 240 },
    description: 'Preparação para concursos de Tribunais de Justiça com foco em direito processual civil, administrativo e conhecimentos específicos.',
    thumbnail: '',
    stats: {
      enrollments: 789,
      modules: 22,
      lessons: 178,
      rating: 4.6,
      completion: 91,
      views: 9870
    },
    resources: {
      videos: 178,
      questions: 3200,
      flashcards: 1100,
      summaries: 44,
      laws: 167,
      documents: 98
    },
    tags: ['TJ', 'Analista', 'Tribunal', 'Processual', 'Judiciário'],
    level: 'TÁTICO',
    nextBatch: '2024-03-20',
    createdAt: '2024-01-25',
    updatedAt: '2024-02-19',
    difficulty: 'INTERMEDIÁRIO',
    certification: true,
    requirements: [
      'Superior em Direito ou área afim',
      'Conhecimentos em informática',
      'Disponibilidade para estudos'
    ],
    objectives: [
      'Aprovação em tribunais',
      'Dominar direito processual',
      'Conhecer rotinas judiciárias'
    ]
  },
  {
    id: 7,
    title: 'GUARDA MUNICIPAL - OPERAÇÕES URBANAS',
    category: 'GUARDA MUNICIPAL',
    instructor: {
      name: 'Comandante João Silva',
      avatar: 'https://ui-avatars.com/api/?name=João+Silva&background=14242f&color=fff',
      rank: 'COMANDANTE GM'
    },
    status: 'RASCUNHO',
    price: 297,
    duration: { months: 3, hours: 120 },
    description: 'Preparação para concursos de Guarda Municipal com foco em legislação urbana, primeiros socorros e operações de trânsito.',
    thumbnail: '',
    stats: {
      enrollments: 0,
      modules: 12,
      lessons: 89,
      rating: 0,
      completion: 0,
      views: 45
    },
    resources: {
      videos: 89,
      questions: 1800,
      flashcards: 600,
      summaries: 24,
      laws: 78,
      documents: 45
    },
    tags: ['GM', 'Municipal', 'Urbana', 'Trânsito', 'Segurança'],
    level: 'OPERACIONAL',
    nextBatch: '2024-04-15',
    createdAt: '2024-02-10',
    updatedAt: '2024-02-15',
    difficulty: 'INICIANTE',
    certification: true,
    requirements: [
      'Ensino médio completo',
      'Idade mínima 18 anos',
      'Residir no município'
    ],
    objectives: [
      'Conhecer legislação municipal',
      'Aprender primeiros socorros',
      'Dominar código de trânsito'
    ]
  },
  {
    id: 8,
    title: 'PRF - POLICIAL RODOVIÁRIO FEDERAL',
    category: 'POLÍCIA RODOVIÁRIA FEDERAL',
    instructor: {
      name: 'Inspetor Carlos Rocha',
      avatar: 'https://ui-avatars.com/api/?name=Carlos+Rocha&background=14242f&color=fff',
      rank: 'INSPETOR PRF'
    },
    status: 'PUBLICADO',
    price: 447,
    duration: { months: 5, hours: 200 },
    description: 'Preparação completa para Policial Rodoviário Federal com foco em legislação de trânsito, direito penal e conhecimentos específicos.',
    thumbnail: '',
    stats: {
      enrollments: 1089,
      modules: 20,
      lessons: 156,
      rating: 4.8,
      completion: 89,
      views: 12340
    },
    resources: {
      videos: 156,
      questions: 2900,
      flashcards: 950,
      summaries: 40,
      laws: 124,
      documents: 78
    },
    tags: ['PRF', 'Rodoviária', 'Trânsito', 'Federal', 'Operações'],
    level: 'TÁTICO',
    nextBatch: '2024-02-28',
    createdAt: '2024-01-12',
    updatedAt: '2024-02-21',
    difficulty: 'INTERMEDIÁRIO',
    certification: true,
    requirements: [
      'Ensino médio completo',
      'CNH categoria B',
      'Preparo físico'
    ],
    objectives: [
      'Dominar legislação de trânsito',
      'Conhecer técnicas de policiamento rodoviário',
      'Preparar-se para fiscalização'
    ]
  }
];

// Categorias disponíveis
export const courseCategories = [
  'TODOS',
  'POLÍCIA FEDERAL',
  'POLÍCIA MILITAR', 
  'POLÍCIA CIVIL',
  'FORÇAS ARMADAS',
  'RECEITA FEDERAL',
  'TRIBUNAIS',
  'GUARDA MUNICIPAL',
  'POLÍCIA RODOVIÁRIA FEDERAL'
];

// Status disponíveis
export const courseStatuses = [
  'TODOS',
  'PUBLICADO',
  'RASCUNHO', 
  'ARQUIVADO'
];

// Utilitários para filtros
export const filterCourses = (
  courses: MockCourse[],
  searchTerm: string,
  category: string,
  status: string
) => {
  return courses.filter(course => {
    const instructorName = course.instructor?.name || '';
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         instructorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = category === 'TODOS' || course.category === category;
    const matchesStatus = status === 'TODOS' || course.status === status;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });
};