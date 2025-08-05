import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  TrendingUp,
  Award,
  RotateCcw,
  Eye,
  EyeOff,
  BookOpen,
  Star,
  Zap,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Settings,
  BarChart3,
  Target,
  Flame,
  AlertTriangle,
  AlertCircle,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';

// Tipos
interface Flashcard {
  id: string;
  type: 'basic' | 'basic_inverted' | 'cloze' | 'multiple_choice' | 'true_false' | 'type_answer' | 'image_occlusion';
  front: string;
  back: string;
  subject: string;
  tags: string[];
  difficulty: 'Fácil' | 'Médio' | 'Difícil';
  createdAt: string;
  // Campos específicos para tipos avançados
  clozeText?: string;
  clozeAnswers?: string[];
  multipleChoiceOptions?: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
  explanation?: string;
  truefalseStatement?: string;
  typeAnswerHint?: string;
  correctAnswer?: string;
  imageUrl?: string;
  occlusionAreas?: {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    answer: string;
  }[];
  srsData: {
    interval: number; // dias até próxima revisão
    repetitions: number; // número de repetições
    easeFactor: number; // fator de facilidade (1.3 - 2.5)
    nextReview: string; // data da próxima revisão
    lastReviewed?: string;
    quality?: number; // última qualidade da resposta (0-5)
  };
  stats: {
    totalReviews: number;
    correctReviews: number;
    streak: number;
    averageTime: number; // em segundos
  };
}

interface FlashcardDeck {
  id: string;
  name: string;
  description: string;
  subject: string;
  totalCards: number;
  dueCards: number;
  newCards: number;
  color: string;
  createdAt: string;
  lastStudied?: string;
  isUserDeck?: boolean; // true se criado pelo usuário, false/undefined se do sistema
  author?: string;
}

interface StudySession {
  deckId: string;
  startedAt: string;
  cardsStudied: number;
  averageTime: number;
  accuracy: number;
  isActive: boolean;
}

// Dados mockados
const mockDecks: FlashcardDeck[] = [
  // DECK ESPECIAL: Guia dos Tipos de Flashcards
  {
    id: 'guide-flashcard-types',
    name: 'GUIA TÁTICO - TIPOS DE FLASHCARDS',
    description: 'Aprenda todos os 6 tipos de flashcards disponíveis para criação. Deck educativo com exemplos práticos de cada tipo.',
    subject: 'Tutorial/Guia',
    totalCards: 6,
    dueCards: 6,
    newCards: 6,
    color: 'bg-gradient-to-r from-purple-500 to-pink-500',
    createdAt: '2024-01-01',
    isUserDeck: false,
    author: 'SISTEMA TÁTICO'
  },
  {
    id: '1',
    name: 'OPERAÇÃO CONSTITUCIONAL - Direitos Fundamentais',
    description: 'Flashcards sobre os direitos e garantias fundamentais da CF/88',
    subject: 'Direito Constitucional',
    totalCards: 156,
    dueCards: 23,
    newCards: 12,
    color: 'bg-blue-500',
    createdAt: '2024-01-10',
    lastStudied: '2024-01-18',
    isUserDeck: false,
    author: 'COMANDANTE CARLOS MENDEZ'
  },
  {
    id: '2',
    name: 'OPERAÇÃO PENAL - Crimes contra a Administração',
    description: 'Conceitos e tipificações dos crimes contra a administração pública',
    subject: 'Direito Penal',
    totalCards: 89,
    dueCards: 15,
    newCards: 8,
    color: 'bg-red-500',
    createdAt: '2024-01-08',
    lastStudied: '2024-01-17',
    isUserDeck: false,
    author: 'COMANDANTE ANA SILVA'
  },
  {
    id: '3',
    name: 'INTELIGÊNCIA DIGITAL - Segurança da Informação',
    description: 'Conceitos fundamentais de segurança da informação',
    subject: 'Informática',
    totalCards: 67,
    dueCards: 31,
    newCards: 5,
    color: 'bg-green-500',
    createdAt: '2024-01-05',
    lastStudied: '2024-01-16',
    isUserDeck: false,
    author: 'ESQUADRÃO STUDYPRO'
  },
  {
    id: '4',
    name: 'COMUNICAÇÃO TÁTICA - Concordância Verbal',
    description: 'Regras de concordância verbal e casos especiais',
    subject: 'Português',
    totalCards: 45,
    dueCards: 8,
    newCards: 18,
    color: 'bg-purple-500',
    createdAt: '2024-01-12',
    isUserDeck: false,
    author: 'COMANDANTE MARIA SANTOS'
  },
  {
    id: '5',
    name: 'ARSENAL PESSOAL - Direito Administrativo',
    description: 'Cards pessoais sobre princípios e atos administrativos',
    subject: 'Direito Administrativo',
    totalCards: 32,
    dueCards: 5,
    newCards: 0,
    color: 'bg-orange-500',
    createdAt: '2024-01-15',
    lastStudied: '2024-01-18',
    isUserDeck: true,
    author: 'Você'
  }
];

const mockFlashcards: Flashcard[] = [
  // ===== DECK GUIA: TIPOS DE FLASHCARDS =====
  
  // 1. EXEMPLO: Flashcard BÁSICO
  {
    id: 'guide-basic-1',
    type: 'basic',
    front: '🔵 FLASHCARD BÁSICO\n\nEste é um exemplo de flashcard básico. É o tipo mais simples - uma pergunta na frente e a resposta no verso.\n\nPERGUNTA: Qual é a capital do Brasil?',
    back: 'RESPOSTA: Brasília\n\n💡 DICA DE USO:\n• Ideal para definições simples\n• Fatos e conceitos diretos\n• Vocabulário e traduções\n• Datas históricas',
    subject: 'Tutorial/Guia',
    tags: ['tutorial', 'tipo básico', 'exemplo'],
    difficulty: 'Fácil',
    createdAt: '2024-01-01',
    srsData: { interval: 1, repetitions: 0, easeFactor: 2.5, nextReview: '2024-01-19', quality: 0 },
    stats: { totalReviews: 0, correctReviews: 0, streak: 0, averageTime: 0 }
  },

  // 2. EXEMPLO: Flashcard BÁSICO INVERTIDO
  {
    id: 'guide-basic-inverted-1',
    type: 'basic_inverted',
    front: '🟢 FLASHCARD BÁSICO INVERTIDO\n\nEste tipo cria DOIS cartões automaticamente - um normal e outro invertido.\n\nPERGUNTA: Qual órgão é responsável pela fiscalização constitucional no Brasil?',
    back: 'RESPOSTA: Supremo Tribunal Federal (STF)\n\n✨ CARTÃO INVERTIDO AUTOMÁTICO:\n• Pergunta: "Supremo Tribunal Federal (STF)"\n• Resposta: "Órgão responsável pela fiscalização constitucional"\n\n💡 IDEAL PARA: Associações bidirecionais',
    subject: 'Tutorial/Guia',
    tags: ['tutorial', 'básico invertido', 'automático'],
    difficulty: 'Fácil',
    explanation: 'Este tipo é perfeito quando você precisa lembrar da associação nos dois sentidos: pergunta→resposta e resposta→pergunta.',
    createdAt: '2024-01-01',
    srsData: { interval: 1, repetitions: 0, easeFactor: 2.5, nextReview: '2024-01-19', quality: 0 },
    stats: { totalReviews: 0, correctReviews: 0, streak: 0, averageTime: 0 }
  },

  // 3. EXEMPLO: Flashcard CLOZE (Lacunas)
  {
    id: 'guide-cloze-1',
    type: 'cloze',
    front: '🟡 FLASHCARD LACUNAS (CLOZE)\n\nEste tipo permite que você teste o preenchimento de lacunas no texto. Clique nas lacunas para revelar as respostas uma por vez.\n\nCOMPLETE O TEXTO ABAIXO:',
    back: 'A Constituição Federal de 1988 é conhecida como {{c1::Constituição Cidadã}} porque {{c2::ampliou significativamente os direitos e garantias fundamentais}} dos brasileiros, estabelecendo uma base sólida para a {{c3::democracia}} moderna.',
    subject: 'Tutorial/Guia',
    tags: ['tutorial', 'cloze', 'lacunas', 'completar'],
    difficulty: 'Médio',
    clozeText: 'A Constituição Federal de 1988 é conhecida como {{c1::Constituição Cidadã}} porque {{c2::ampliou significativamente os direitos e garantias fundamentais}} dos brasileiros, estabelecendo uma base sólida para a {{c3::democracia}} moderna.',
    clozeAnswers: ['Constituição Cidadã', 'ampliou significativamente os direitos e garantias fundamentais', 'democracia'],
    explanation: '💡 DICA DE USO: Flashcards tipo CLOZE são ideais para: • Memorizar textos legais • Completar definições • Fixar conceitos em contexto • Estudar artigos de lei',
    createdAt: '2024-01-01',
    srsData: { interval: 1, repetitions: 0, easeFactor: 2.5, nextReview: '2024-01-19', quality: 0 },
    stats: { totalReviews: 0, correctReviews: 0, streak: 0, averageTime: 0 }
  },

  // 4. EXEMPLO: Flashcard MÚLTIPLA ESCOLHA
  {
    id: 'guide-multiple-choice-1',
    type: 'multiple_choice',
    front: '🟣 FLASHCARD MÚLTIPLA ESCOLHA\n\nApresenta uma pergunta com 4 alternativas.\n\nQual dos poderes abaixo NÃO existe na estrutura constitucional brasileira?',
    back: 'A) Poder Executivo\nB) Poder Legislativo\nC) Poder Judiciário\nD) Poder Moderador ✓\n\nRESPOSTA CORRETA: D',
    subject: 'Tutorial/Guia',
    tags: ['tutorial', 'múltipla escolha', 'alternativas'],
    difficulty: 'Médio',
    multipleChoiceOptions: [
      { id: 'a', text: 'Poder Executivo', isCorrect: false },
      { id: 'b', text: 'Poder Legislativo', isCorrect: false },
      { id: 'c', text: 'Poder Judiciário', isCorrect: false },
      { id: 'd', text: 'Poder Moderador', isCorrect: true }
    ],
    explanation: '💡 O Poder Moderador existiu apenas no Brasil Império (1822-1889). A atual Constituição prevê apenas 3 poderes: Executivo, Legislativo e Judiciário.',
    createdAt: '2024-01-01',
    srsData: { interval: 1, repetitions: 0, easeFactor: 2.5, nextReview: '2024-01-19', quality: 0 },
    stats: { totalReviews: 0, correctReviews: 0, streak: 0, averageTime: 0 }
  },

  // 5. EXEMPLO: Flashcard VERDADEIRO/FALSO
  {
    id: 'guide-true-false-1',
    type: 'true_false',
    front: '🔴 FLASHCARD VERDADEIRO/FALSO\n\nAvalie se a afirmação está correta ou incorreta.\n\nAFIRMAÇÃO:\n"O Presidente da República pode ser reeleito quantas vezes quiser."',
    back: '❌ FALSO\n\nEXPLICAÇÃO:\nO Presidente da República pode ser reeleito apenas UMA vez para o período subsequente (reeleição consecutiva). Após cumprir dois mandatos seguidos, deve aguardar um período antes de poder concorrer novamente.',
    subject: 'Tutorial/Guia',
    tags: ['tutorial', 'verdadeiro falso', 'avaliação'],
    difficulty: 'Médio',
    truefalseStatement: 'O Presidente da República pode ser reeleito quantas vezes quiser.',
    explanation: 'Segundo o art. 14, §5º da CF/88, é permitida a reeleição para apenas UM período subsequente.',
    createdAt: '2024-01-01',
    srsData: { interval: 1, repetitions: 0, easeFactor: 2.5, nextReview: '2024-01-19', quality: 0 },
    stats: { totalReviews: 0, correctReviews: 0, streak: 0, averageTime: 0 }
  },

  // 6. EXEMPLO: Flashcard DIGITAR RESPOSTA
  {
    id: 'guide-type-answer-1',
    type: 'type_answer',
    front: '🟦 FLASHCARD DIGITAR RESPOSTA\n\nVocê deve digitar a resposta exata no campo de texto.\n\nPERGUNTA:\nQuem foi o primeiro Presidente da República do Brasil?',
    back: 'RESPOSTA ESPERADA: Deodoro da Fonseca\n\n💡 DICAS DE USO:\n• Nomes próprios e termos específicos\n• Fórmulas e códigos\n• Números e estatísticas\n• Citações textuais',
    subject: 'Tutorial/Guia',
    tags: ['tutorial', 'digitar resposta', 'texto livre'],
    difficulty: 'Médio',
    correctAnswer: 'Deodoro da Fonseca',
    typeAnswerHint: 'Marechal que proclamou a República em 1889',
    createdAt: '2024-01-01',
    srsData: { interval: 1, repetitions: 0, easeFactor: 2.5, nextReview: '2024-01-19', quality: 0 },
    stats: { totalReviews: 0, correctReviews: 0, streak: 0, averageTime: 0 }
  },

  // ===== FLASHCARDS ORIGINAIS =====
  // 1. BASIC - Cartão Básico Tradicional
  {
    id: '1',
    type: 'basic',
    front: 'O que são direitos fundamentais de primeira geração?',
    back: 'São os direitos civis e políticos, também chamados de direitos de liberdade. Incluem direito à vida, liberdade, propriedade, liberdade de expressão, direito ao voto, etc. Surgiram no século XVIII com as revoluções liberais.',
    subject: 'Direito Constitucional',
    tags: ['direitos fundamentais', 'gerações de direitos', 'liberdades'],
    difficulty: 'Médio',
    createdAt: '2024-01-10',
    srsData: {
      interval: 3,
      repetitions: 2,
      easeFactor: 2.2,
      nextReview: '2024-01-19',
      lastReviewed: '2024-01-18',
      quality: 4
    },
    stats: {
      totalReviews: 5,
      correctReviews: 4,
      streak: 2,
      averageTime: 12
    }
  },
  // 2. BASIC INVERTED - Cartão com Informação Extra e Reverso
  {
    id: '2',
    type: 'basic_inverted',
    front: 'Crime de Corrupção Passiva - Art. 317 CP',
    back: 'Solicitar ou receber vantagem indevida em razão da função pública. Pena: reclusão de 2 a 12 anos e multa.',
    subject: 'Direito Penal',
    tags: ['corrupção passiva', 'crimes contra administração'],
    difficulty: 'Difícil',
    explanation: 'Também gera cartão reverso: "Qual crime: solicitar vantagem indevida como funcionário público?" → "Corrupção Passiva"',
    createdAt: '2024-01-08',
    srsData: {
      interval: 1,
      repetitions: 1,
      easeFactor: 1.8,
      nextReview: '2024-01-19',
      lastReviewed: '2024-01-18',
      quality: 2
    },
    stats: {
      totalReviews: 3,
      correctReviews: 1,
      streak: 0,
      averageTime: 18
    }
  },
  // 3. CLOZE - Lacunas (Fill-in-the-blank)
  {
    id: '3',
    type: 'cloze',
    front: 'Preencha as lacunas sobre os Princípios da Administração Pública',
    back: 'Art. 37 da CF/88 estabelece os princípios: Legalidade, Impessoalidade, Moralidade, Publicidade e Eficiência',
    clozeText: 'Art. 37 da CF/88 estabelece os princípios: {{c1::Legalidade}}, {{c2::Impessoalidade}}, {{c3::Moralidade}}, {{c4::Publicidade}} e {{c5::Eficiência}}',
    clozeAnswers: ['Legalidade', 'Impessoalidade', 'Moralidade', 'Publicidade', 'Eficiência'],
    subject: 'Direito Constitucional',
    tags: ['administração pública', 'princípios', 'LIMPE'],
    difficulty: 'Fácil',
    createdAt: '2024-01-15',
    srsData: {
      interval: 1,
      repetitions: 0,
      easeFactor: 2.5,
      nextReview: '2024-01-19',
      lastReviewed: '2024-01-18',
      quality: 1
    },
    stats: {
      totalReviews: 1,
      correctReviews: 0,
      streak: 0,
      averageTime: 20
    }
  },
  // 4. MULTIPLE CHOICE - Múltipla Escolha
  {
    id: '4',
    type: 'multiple_choice',
    front: 'Qual é a função principal de um firewall em segurança da informação?',
    back: 'Monitorar e controlar o tráfego de rede baseado em regras de segurança',
    multipleChoiceOptions: [
      { id: 'a', text: 'Criptografar todos os dados da rede', isCorrect: false },
      { id: 'b', text: 'Monitorar e controlar o tráfego de rede baseado em regras de segurança', isCorrect: true },
      { id: 'c', text: 'Fazer backup automático dos sistemas', isCorrect: false },
      { id: 'd', text: 'Detectar vírus em arquivos executáveis', isCorrect: false }
    ],
    explanation: 'Firewall atua como uma barreira entre redes confiáveis e não confiáveis, filtrando o tráfego conforme regras estabelecidas.',
    subject: 'Informática',
    tags: ['firewall', 'segurança', 'rede'],
    difficulty: 'Fácil',
    createdAt: '2024-01-12',
    srsData: {
      interval: 7,
      repetitions: 3,
      easeFactor: 2.5,
      nextReview: '2024-01-20',
      lastReviewed: '2024-01-13',
      quality: 5
    },
    stats: {
      totalReviews: 4,
      correctReviews: 4,
      streak: 4,
      averageTime: 8
    }
  },
  // 5. TRUE/FALSE - Verdadeiro ou Falso
  {
    id: '5',
    type: 'true_false',
    front: 'Avalie a afirmação sobre concordância verbal',
    back: 'FALSO - A regra pode variar conforme a posição do sujeito composto',
    truefalseStatement: 'Com sujeito composto, o verbo SEMPRE deve ir para o plural, independentemente da posição.',
    correctAnswer: 'false',
    explanation: 'FALSO: Com sujeito composto anteposto, o verbo vai para o plural. Com sujeito posposto, pode concordar com o núcleo mais próximo OU ir para o plural. Ex: "Chegou João e Maria" (singular) ou "Chegaram João e Maria" (plural).',
    subject: 'Português',
    tags: ['concordância verbal', 'sujeito composto', 'gramática'],
    difficulty: 'Médio',
    createdAt: '2024-01-14',
    srsData: {
      interval: 2,
      repetitions: 1,
      easeFactor: 2.0,
      nextReview: '2024-01-21',
      lastReviewed: '2024-01-19',
      quality: 3
    },
    stats: {
      totalReviews: 2,
      correctReviews: 1,
      streak: 1,
      averageTime: 15
    }
  },
  // 6. TYPE ANSWER - Digite a Resposta
  {
    id: '6',
    type: 'type_answer',
    front: 'Digite o nome do princípio constitucional que determina que todos devem ser tratados de forma igual perante a lei',
    back: 'ISONOMIA (ou IGUALDADE)',
    correctAnswer: 'isonomia',
    typeAnswerHint: 'Dica: Começa com "I" e é sinônimo de igualdade',
    explanation: 'O princípio da isonomia (ou igualdade) está previsto no caput do art. 5º da CF/88: "Todos são iguais perante a lei".',
    subject: 'Direito Constitucional',
    tags: ['princípios constitucionais', 'isonomia', 'igualdade'],
    difficulty: 'Médio',
    createdAt: '2024-01-16',
    srsData: {
      interval: 4,
      repetitions: 2,
      easeFactor: 2.3,
      nextReview: '2024-01-22',
      lastReviewed: '2024-01-18',
      quality: 4
    },
    stats: {
      totalReviews: 3,
      correctReviews: 2,
      streak: 2,
      averageTime: 25
    }
  },
  // 7. IMAGE OCCLUSION - Oclusão de Imagem
  {
    id: '7',
    type: 'image_occlusion',
    front: 'Identifique as partes ocultas da estrutura hierárquica dos poderes',
    back: 'Poder Executivo, Poder Legislativo, Poder Judiciário',
    imageUrl: '/images/poderes-republica.jpg', // Imagem exemplo
    occlusionAreas: [
      { id: '1', x: 50, y: 100, width: 120, height: 40, answer: 'Poder Executivo' },
      { id: '2', x: 200, y: 100, width: 120, height: 40, answer: 'Poder Legislativo' },
      { id: '3', x: 350, y: 100, width: 120, height: 40, answer: 'Poder Judiciário' }
    ],
    explanation: 'A separação dos poderes é um princípio fundamental da República Federativa do Brasil, estabelecido no art. 2º da CF/88.',
    subject: 'Direito Constitucional',
    tags: ['separação de poderes', 'estrutura estatal', 'constituição'],
    difficulty: 'Fácil',
    createdAt: '2024-01-17',
    srsData: {
      interval: 1,
      repetitions: 0,
      easeFactor: 2.5,
      nextReview: '2024-01-20',
      lastReviewed: '2024-01-19',
      quality: 3
    },
    stats: {
      totalReviews: 1,
      correctReviews: 1,
      streak: 1,
      averageTime: 30
    }
  },
  // Cartões adicionais para demonstrar variedade
  {
    id: '8',
    type: 'basic',
    front: 'O que significa o princípio da legalidade na Administração Pública?',
    back: 'A Administração só pode fazer o que a lei permite ou autoriza. Enquanto o particular pode fazer tudo que a lei não proíbe, o administrador público só pode agir com base em lei.',
    subject: 'Direito Administrativo',
    tags: ['legalidade', 'administração pública', 'princípios'],
    difficulty: 'Médio',
    createdAt: '2024-01-18',
    srsData: {
      interval: 2,
      repetitions: 1,
      easeFactor: 2.1,
      nextReview: '2024-01-21',
      lastReviewed: '2024-01-19',
      quality: 3
    },
    stats: {
      totalReviews: 2,
      correctReviews: 1,
      streak: 1,
      averageTime: 14
    }
  },
  {
    id: '9',
    type: 'cloze',
    front: 'Complete a frase sobre criptografia',
    back: 'A criptografia simétrica usa a mesma chave para cifrar e decifrar',
    clozeText: 'A criptografia {{c1::simétrica}} usa a {{c2::mesma}} chave para {{c3::cifrar}} e {{c4::decifrar}}',
    clozeAnswers: ['simétrica', 'mesma', 'cifrar', 'decifrar'],
    subject: 'Informática',
    tags: ['criptografia', 'segurança', 'simétrica'],
    difficulty: 'Médio',
    createdAt: '2024-01-19',
    srsData: {
      interval: 1,
      repetitions: 0,
      easeFactor: 2.5,
      nextReview: '2024-01-21',
      quality: 0
    },
    stats: {
      totalReviews: 1,
      correctReviews: 0,
      streak: 0,
      averageTime: 22
    }
  },
  {
    id: '10',
    type: 'multiple_choice',
    front: 'Qual é a pena para o crime de corrupção passiva?',
    back: 'Reclusão de 2 a 12 anos e multa',
    multipleChoiceOptions: [
      { id: 'a', text: 'Detenção de 6 meses a 2 anos', isCorrect: false },
      { id: 'b', text: 'Reclusão de 2 a 12 anos e multa', isCorrect: true },
      { id: 'c', text: 'Reclusão de 1 a 4 anos', isCorrect: false },
      { id: 'd', text: 'Multa apenas', isCorrect: false }
    ],
    explanation: 'Art. 317 do Código Penal estabelece pena de reclusão de 2 a 12 anos e multa para corrupção passiva.',
    subject: 'Direito Penal',
    tags: ['corrupção passiva', 'penas', 'código penal'],
    difficulty: 'Difícil',
    createdAt: '2024-01-20',
    srsData: {
      interval: 3,
      repetitions: 2,
      easeFactor: 1.9,
      nextReview: '2024-01-23',
      lastReviewed: '2024-01-20',
      quality: 3
    },
    stats: {
      totalReviews: 3,
      correctReviews: 2,
      streak: 1,
      averageTime: 16
    }
  }
];

// Estatísticas gerais
const studyStats = {
  totalCards: 487,
  dueToday: 89,
  newCards: 56,
  dailyStreak: 12,
  totalStudyTime: 1548, // minutos
  averageAccuracy: 82.3,
  cardsStudiedToday: 73,
  timeStudiedToday: 42 // minutos
};

export default function FlashcardsPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'study' | 'create' | 'create-card' | 'stats'>('overview');
  const [selectedDeck, setSelectedDeck] = useState<FlashcardDeck | null>(null);
  const [currentCard, setCurrentCard] = useState<Flashcard | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [studyCards, setStudyCards] = useState<Flashcard[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [studySession, setStudySession] = useState<StudySession | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [deckFilter, setDeckFilter] = useState<'all' | 'my' | 'system'>('all');
  const [sessionStats, setSessionStats] = useState({
    correct: 0,
    total: 0,
    startTime: Date.now()
  });
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckDescription, setNewDeckDescription] = useState('');
  const [newDeckSubject, setNewDeckSubject] = useState('');
  
  // Estados para criação de flashcard individual
  const [newCardType, setNewCardType] = useState<'basic' | 'basic_inverted' | 'cloze' | 'multiple_choice' | 'true_false' | 'type_answer'>('basic');
  const [newCardFront, setNewCardFront] = useState('');
  const [newCardBack, setNewCardBack] = useState('');
  const [newCardSubject, setNewCardSubject] = useState('');
  const [newCardTags, setNewCardTags] = useState('');
  const [newCardDifficulty, setNewCardDifficulty] = useState<'Fácil' | 'Médio' | 'Difícil'>('Médio');
  const [newCardExplanation, setNewCardExplanation] = useState('');
  const [newCardHint, setNewCardHint] = useState('');

  // Filtrar decks
  const filteredDecks = mockDecks.filter(deck => {
    const matchesSearch = deck.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deck.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = filterSubject === 'all' || deck.subject === filterSubject;
    const matchesOrigin = deckFilter === 'all' || 
                         (deckFilter === 'my' && deck.isUserDeck) || 
                         (deckFilter === 'system' && !deck.isUserDeck);
    return matchesSearch && matchesSubject && matchesOrigin;
  });

  const subjects = ['all', ...new Set(mockDecks.map(deck => deck.subject))];

  // Handle card selection
  const handleCardSelection = (cardId: string) => {
    setSelectedCards(prev => {
      if (prev.includes(cardId)) {
        return prev.filter(id => id !== cardId);
      } else {
        return [...prev, cardId];
      }
    });
  };

  // Create new deck with selected cards
  const handleCreateCard = () => {
    if (!newCardFront.trim() || !newCardBack.trim() || !newCardSubject.trim()) {
      toast.error('PREENCHA TODOS OS CAMPOS OBRIGATÓRIOS!', {
        icon: '⚠️',
        duration: 3000
      });
      return;
    }

    const newCard: Flashcard = {
      id: `card-${Date.now()}`,
      type: newCardType,
      front: newCardFront.trim(),
      back: newCardBack.trim(),
      subject: newCardSubject.trim(),
      tags: newCardTags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
      difficulty: newCardDifficulty,
      createdAt: new Date().toISOString(),
      explanation: newCardExplanation.trim() || undefined,
      typeAnswerHint: newCardHint.trim() || undefined,
      srsData: {
        interval: 1,
        repetitions: 0,
        easeFactor: 2.5,
        nextReview: new Date().toISOString(),
        quality: 0
      },
      stats: {
        totalReviews: 0,
        correctReviews: 0,
        streak: 0,
        averageTime: 0
      }
    };

    // Adicionar ao mockFlashcards (simulação)
    mockFlashcards.push(newCard);
    
    toast.success('CARTÃO TÁTICO CRIADO COM SUCESSO!', {
      icon: '🎯',
      duration: 3000
    });

    // Limpar formulário
    setNewCardFront('');
    setNewCardBack('');
    setNewCardSubject('');
    setNewCardTags('');
    setNewCardDifficulty('Médio');
    setNewCardExplanation('');
    setNewCardHint('');
    setNewCardType('basic');
    setActiveTab('overview');
  };

  const handleCreateDeck = () => {
    if (selectedCards.length === 0 || !newDeckName.trim()) {
      return;
    }

    // Simula criação do deck
    const newDeck: FlashcardDeck = {
      id: Date.now().toString(),
      name: newDeckName,
      description: newDeckDescription,
      subject: newDeckSubject || 'Misto/Várias matérias',
      totalCards: selectedCards.length,
      dueCards: selectedCards.length,
      newCards: selectedCards.length,
      color: 'bg-indigo-500',
      createdAt: new Date().toISOString(),
      isUserDeck: true,
      author: 'Você'
    };

    toast.success(`ARSENAL "${newDeckName}" CRIADO COM SUCESSO!`, {
      description: `${selectedCards.length} flashcard${selectedCards.length > 1 ? 's' : ''} adicionado${selectedCards.length > 1 ? 's' : ''}`,
      icon: '🎯'
    });
    
    // Reset form
    setNewDeckName('');
    setNewDeckDescription('');
    setNewDeckSubject('');
    setSelectedCards([]);
    setActiveTab('overview');
  };

  // Algoritmo SM-2 (SuperMemo 2) - Implementação completa como no Anki
  const calculateNextReview = (quality: number, card: Flashcard) => {
    const { interval, repetitions, easeFactor } = card.srsData;
    
    let newInterval = interval;
    let newRepetitions = repetitions;
    let newEaseFactor = easeFactor;

    // Quality: 0 = Esqueci completamente, 1 = Esqueci, 2 = Difícil, 3 = Bom, 4 = Fácil, 5 = Muito fácil
    
    if (quality >= 3) {
      // Resposta correta (Bom, Fácil ou Muito fácil)
      
      // Calcula novo intervalo baseado no algoritmo SM-2
      switch (repetitions) {
        case 0:
          newInterval = 1; // 1 dia
          break;
        case 1:
          newInterval = 6; // 6 dias
          break;
        default:
          // Aplica o fator de facilidade ao intervalo anterior
          newInterval = Math.round(interval * newEaseFactor);
          
          // Adiciona variação aleatória (fuzz factor) como no Anki
          // Evita que muitos cards apareçam no mesmo dia
          const fuzzRange = Math.max(1, Math.floor(newInterval * 0.05));
          const fuzz = Math.floor(Math.random() * (2 * fuzzRange + 1)) - fuzzRange;
          newInterval = Math.max(1, newInterval + fuzz);
          break;
      }
      
      // Aplica multiplicador baseado na qualidade da resposta
      if (quality === 5) {
        // Muito fácil - aumenta intervalo em 30%
        newInterval = Math.round(newInterval * 1.3);
      } else if (quality === 4) {
        // Fácil - aumenta intervalo em 15%
        newInterval = Math.round(newInterval * 1.15);
      }
      // quality === 3 (Bom) mantém o intervalo calculado
      
      newRepetitions = repetitions + 1;
      
    } else {
      // Resposta incorreta (Esqueci completamente, Esqueci ou Difícil)
      newRepetitions = 0;
      
      // Define novo intervalo baseado na dificuldade
      if (quality === 2) {
        // Difícil - novo intervalo é 60% do anterior
        newInterval = Math.max(1, Math.round(interval * 0.6));
      } else if (quality === 1) {
        // Esqueci - intervalo de 1 dia
        newInterval = 1;
      } else {
        // Esqueci completamente - mostrar novamente em 10 minutos
        newInterval = 0.007; // ~10 minutos em dias
      }
    }

    // Ajusta o fator de facilidade usando a fórmula SM-2
    // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    const qFactor = 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02);
    newEaseFactor = Math.max(1.3, easeFactor + qFactor);
    
    // Limita o fator de facilidade máximo
    newEaseFactor = Math.min(2.5, newEaseFactor);

    // Calcula a próxima data de revisão
    const nextReviewDate = new Date();
    if (newInterval < 1) {
      // Para intervalos menores que 1 dia, converte para minutos
      nextReviewDate.setMinutes(nextReviewDate.getMinutes() + Math.round(newInterval * 24 * 60));
    } else {
      nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);
    }

    return {
      interval: newInterval,
      repetitions: newRepetitions,
      easeFactor: newEaseFactor,
      nextReview: nextReviewDate.toISOString(),
      lastReviewed: new Date().toISOString(),
      quality
    };
  };

  const handleAnswer = (quality: number) => {
    if (!currentCard || !studySession) return;

    // Atualiza estatísticas da sessão
    const isCorrect = quality >= 3;
    setSessionStats(prev => ({
      ...prev,
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));

    // Simula atualização do card com SRS
    const updatedSRS = calculateNextReview(quality, currentCard);
    // Atualiza o card atual com novos dados SRS
    const updatedCard = {
      ...currentCard,
      srsData: updatedSRS,
      stats: {
        ...currentCard.stats,
        totalReviews: currentCard.stats.totalReviews + 1,
        correctReviews: currentCard.stats.correctReviews + (isCorrect ? 1 : 0),
        streak: isCorrect ? currentCard.stats.streak + 1 : 0
      }
    };

    // Atualiza o array de cards
    const newStudyCards = [...studyCards];
    newStudyCards[currentCardIndex] = updatedCard;
    setStudyCards(newStudyCards);

    // Próximo card
    const nextIndex = currentCardIndex + 1;
    if (nextIndex < studyCards.length) {
      setCurrentCardIndex(nextIndex);
      setCurrentCard(studyCards[nextIndex]);
      setShowAnswer(false);
    } else {
      // Sessão finalizada
      finishStudySession();
    }

    // Atualiza estatísticas da sessão
    setStudySession({
      ...studySession,
      cardsStudied: studySession.cardsStudied + 1,
      accuracy: Math.round(((sessionStats.correct + (isCorrect ? 1 : 0)) / (sessionStats.total + 1)) * 100)
    });
  };

  const finishStudySession = () => {
    const timeSpent = Math.round((Date.now() - sessionStats.startTime) / 1000 / 60); // em minutos
    const accuracy = Math.round((sessionStats.correct / sessionStats.total) * 100);
    
    // Mostra estatísticas finais com um modal mais atrativo
    // Mostra estatísticas finais
    toast.success('MISSÃO CONCLUÍDA!', {
      description: `📚 ${sessionStats.total} cards | ✅ ${sessionStats.correct} acertos | 🎯 ${accuracy}% precisão | ⏱️ ${timeSpent}min`,
      duration: 5000,
      icon: accuracy >= 80 ? '🌟' : accuracy >= 60 ? '👍' : '💪'
    });
    
    // Reset da sessão
    setStudySession(null);
    setCurrentCard(null);
    setCurrentCardIndex(0);
    setStudyCards([]);
    setShowAnswer(false);
    setSessionStats({ correct: 0, total: 0, startTime: Date.now() });
    setActiveTab('overview');
  };

  const startStudySession = (deck: FlashcardDeck) => {
    // Filtra cards do deck selecionado + alguns cards exemplo
    const deckCards = [...mockFlashcards]; // Em produção, filtraria por deck.id
    
    // Ordena cards por prioridade SRS (cards vencidos primeiro)
    const sortedCards = deckCards.sort((a, b) => {
      const aDate = new Date(a.srsData.nextReview);
      const bDate = new Date(b.srsData.nextReview);
      return aDate.getTime() - bDate.getTime();
    });

    setSelectedDeck(deck);
    setStudyCards(sortedCards);
    setCurrentCardIndex(0);
    setCurrentCard(sortedCards[0]);
    setSessionStats({ correct: 0, total: 0, startTime: Date.now() });
    setStudySession({
      deckId: deck.id,
      startedAt: new Date().toISOString(),
      cardsStudied: 0,
      averageTime: 0,
      accuracy: 0,
      isActive: true
    });
    setActiveTab('study');
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins}min`;
  };

  const DeckCard = ({ deck }: { deck: FlashcardDeck }) => {
    // Estilo especial para o deck guia
    const isGuideDeck = deck.id === 'guide-flashcard-types';
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5, scale: isGuideDeck ? 1.02 : 1 }}
        transition={{ duration: 0.3 }}
        className={isGuideDeck ? 'relative' : ''}
      >
        {isGuideDeck && (
          <>
            {/* Efeito de brilho especial */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20 rounded-lg blur-sm animate-pulse" />
            <div className="absolute -top-2 -right-2 z-10">
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-police-body text-xs uppercase tracking-wider animate-bounce">
                🎓 TUTORIAL
              </Badge>
            </div>
          </>
        )}
        
        <Card className={cn(
          "h-full hover:shadow-xl transition-all duration-300 overflow-hidden border-2 relative",
          isGuideDeck 
            ? "border-purple-500 dark:border-purple-400 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-900/20 dark:to-pink-900/20 shadow-lg shadow-purple-200/50 dark:shadow-purple-900/30" 
            : "border-gray-200 dark:border-gray-800"
        )}>
          {/* Tactical stripe */}
          <div className={cn(
            "absolute top-0 right-0 w-1 h-full",
            isGuideDeck ? "bg-gradient-to-b from-purple-500 to-pink-500" : "bg-accent-500"
          )} />
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", deck.color)}>
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col items-end gap-1">
              <Badge variant="secondary" className="font-police-body border-accent-500 text-accent-500">{deck.subject}</Badge>
              {deck.isUserDeck && (
                <Badge className="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-700 text-xs font-police-subtitle tracking-wider border-2 border-current">
                  MEU ARSENAL
                </Badge>
              )}
            </div>
          </div>

          <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 line-clamp-2 font-police-subtitle uppercase tracking-wider">
            {deck.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2 font-police-body">
            {deck.description}
          </p>
          {deck.author && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 font-police-body uppercase tracking-wider">
              COMANDANTE: {deck.author}
            </p>
          )}

          {/* Estatísticas */}
          <div className="grid grid-cols-3 gap-3 mb-4 text-sm">
            <div className="text-center">
              <div className="font-bold text-gray-900 dark:text-white font-police-numbers">{deck.totalCards}</div>
              <div className="text-gray-600 dark:text-gray-400 font-police-body uppercase tracking-wider text-xs">TOTAL</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-red-600 font-police-numbers">{deck.dueCards}</div>
              <div className="text-gray-600 dark:text-gray-400 font-police-body uppercase tracking-wider text-xs">PENDENTES</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-green-600 font-police-numbers">{deck.newCards}</div>
              <div className="text-gray-600 dark:text-gray-400 font-police-body uppercase tracking-wider text-xs">NOVOS</div>
            </div>
          </div>

          {/* Data do último estudo */}
          {deck.lastStudied && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 font-police-body uppercase tracking-wider">
              ÚLTIMA OPERAÇÃO: {new Date(deck.lastStudied).toLocaleDateString('pt-BR')}
            </p>
          )}

          {/* Botão de estudo */}
          <Button
            onClick={() => startStudySession(deck)}
            className="w-full gap-2 bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-semibold uppercase tracking-wider"
            disabled={deck.dueCards === 0 && deck.newCards === 0}
          >
            <Play className="w-4 h-4" />
            {deck.dueCards > 0 ? `EXECUTAR OPERAÇÃO (${deck.dueCards + deck.newCards})` : 'SEM ALVOS PENDENTES'}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
    );
  };

  // Componente para renderizar texto com lacunas (CLOZE)
  const ClozeRenderer = ({ text, showAnswers }: { text: string; showAnswers: boolean }) => {
    const [visibleClozes, setVisibleClozes] = useState<Set<string>>(new Set());

    const toggleCloze = (clozeId: string) => {
      const newVisible = new Set(visibleClozes);
      if (newVisible.has(clozeId)) {
        newVisible.delete(clozeId);
      } else {
        newVisible.add(clozeId);
      }
      setVisibleClozes(newVisible);
    };

    const renderClozeText = (text: string) => {
      // Regex para encontrar padrões {{c1::texto}} ou {{c2::texto}}
      const clozeRegex = /\{\{c(\d+)::([^}]+)\}\}/g;
      const parts = [];
      let lastIndex = 0;
      let match;

      while ((match = clozeRegex.exec(text)) !== null) {
        // Adicionar texto antes da lacuna
        if (match.index > lastIndex) {
          parts.push(text.substring(lastIndex, match.index));
        }

        const clozeId = `c${match[1]}`;
        const clozeContent = match[2];
        const isVisible = showAnswers || visibleClozes.has(clozeId);

        // Criar o elemento da lacuna
        parts.push(
          <span key={`${clozeId}-${match.index}`} className="inline-block">
            <motion.button
              onClick={() => !showAnswers && toggleCloze(clozeId)}
              className={cn(
                "mx-1 px-3 py-1 rounded-lg font-police-body font-semibold transition-all",
                isVisible
                  ? "bg-yellow-200 dark:bg-yellow-800/50 text-yellow-900 dark:text-yellow-200 border-2 border-yellow-400"
                  : "bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 border-2 border-gray-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 cursor-pointer"
              )}
              whileHover={!showAnswers ? { scale: 1.05 } : {}}
              whileTap={!showAnswers ? { scale: 0.95 } : {}}
              disabled={showAnswers}
            >
              {isVisible ? clozeContent : `[LACUNA ${match[1]}]`}
            </motion.button>
          </span>
        );

        lastIndex = match.index + match[0].length;
      }

      // Adicionar texto restante
      if (lastIndex < text.length) {
        parts.push(text.substring(lastIndex));
      }

      return parts;
    };

    return (
      <div className="text-lg leading-relaxed text-gray-900 dark:text-white font-police-body">
        {renderClozeText(text)}
        {!showAnswers && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
            <p className="text-sm text-blue-700 dark:text-blue-300 font-police-body">
              💡 <strong>INSTRUÇÃO TÁTICA:</strong> Clique nas lacunas para revelar as respostas uma por vez.
            </p>
          </div>
        )}
      </div>
    );
  };

  const StudyCard = ({ card }: { card: Flashcard }) => {
    const getTypeColor = (type: string) => {
      switch (type) {
        case 'basic': return 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-300';
        case 'basic_inverted': return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-300';
        case 'cloze': return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-300';
        case 'multiple_choice': return 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-300';
        case 'true_false': return 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-300';
        case 'type_answer': return 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 border-indigo-300';
        case 'image_occlusion': return 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-300';
        default: return 'bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-400 border-gray-300';
      }
    };

    const getTypeName = (type: string) => {
      switch (type) {
        case 'basic': return 'CARTÃO BÁSICO';
        case 'basic_inverted': return 'BÁSICO INVERTIDO';
        case 'cloze': return 'LACUNAS (CLOZE)';
        case 'multiple_choice': return 'MÚLTIPLA ESCOLHA';
        case 'true_false': return 'VERDADEIRO/FALSO';
        case 'type_answer': return 'DIGITE RESPOSTA';
        case 'image_occlusion': return 'OCLUSÃO IMAGEM';
        default: return type.toUpperCase();
      }
    };

    return (
      <div className="max-w-2xl mx-auto">
        <Card className="min-h-[400px] border-2 border-gray-200 dark:border-gray-800 relative overflow-hidden">
          {/* Tactical stripe */}
          <div className="absolute top-0 right-0 w-1 h-full bg-accent-500" />
          <CardHeader className="text-center border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Badge 
                  className={cn(
                    "font-police-subtitle tracking-wider border-2",
                    getTypeColor(card.type)
                  )}
                >
                  {getTypeName(card.type)}
                </Badge>
                <Badge variant="secondary" className="font-police-body border-accent-500 text-accent-500">{card.subject}</Badge>
              </div>
              <Badge 
                className={cn(
                  "font-police-subtitle tracking-wider border-2 border-current",
                  card.difficulty === 'Fácil' && "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400",
                  card.difficulty === 'Médio' && "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400",
                  card.difficulty === 'Difícil' && "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                )}
              >
                {card.difficulty}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-8">
          <div className="text-center">
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 font-police-title uppercase tracking-wider">
                {showAnswer ? 'RESPOSTA TÁTICA:' : 'OBJETIVO OPERACIONAL:'}
              </h3>
              <motion.div
                key={showAnswer ? 'answer' : 'question'}
                initial={{ opacity: 0, rotateY: 90 }}
                animate={{ opacity: 1, rotateY: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 min-h-[200px] flex items-center justify-center border-2 border-gray-200 dark:border-gray-700"
              >
                {card.type === 'cloze' ? (
                  <div className="w-full">
                    {!showAnswer ? (
                      <div>
                        <p className="text-lg leading-relaxed text-gray-900 dark:text-white font-police-body mb-4">
                          {card.front}
                        </p>
                        <ClozeRenderer 
                          text={card.clozeText || card.back} 
                          showAnswers={false} 
                        />
                      </div>
                    ) : (
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 font-police-subtitle uppercase tracking-wider">
                          TEXTO COMPLETO:
                        </h4>
                        <ClozeRenderer 
                          text={card.clozeText || card.back} 
                          showAnswers={true} 
                        />
                        {card.explanation && (
                          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                            <p className="text-sm text-green-700 dark:text-green-300 font-police-body">
                              <strong>EXPLICAÇÃO TÁTICA:</strong> {card.explanation}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-lg leading-relaxed text-gray-900 dark:text-white font-police-body">
                    {showAnswer ? card.back : card.front}
                  </p>
                )}
              </motion.div>
            </div>

            {!showAnswer ? (
              card.type === 'cloze' ? (
                <div className="space-y-4">
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-2 border-yellow-200 dark:border-yellow-700">
                    <p className="text-yellow-800 dark:text-yellow-200 font-police-body font-semibold text-center">
                      🎯 <strong>MODO LACUNAS ATIVO</strong><br />
                      Clique nas lacunas para revelar as respostas ou veja o texto completo
                    </p>
                  </div>
                  <Button 
                    onClick={() => setShowAnswer(true)}
                    className="gap-2 bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-semibold uppercase tracking-wider"
                    size="lg"
                  >
                    <Eye className="w-5 h-5" />
                    VER TEXTO COMPLETO
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={() => setShowAnswer(true)}
                  className="gap-2 bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-semibold uppercase tracking-wider"
                  size="lg"
                >
                  <Eye className="w-5 h-5" />
                  REVELAR INTEL
                </Button>
              )
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 font-police-body uppercase tracking-wider">
                  AVALIE SUA PERFORMANCE OPERACIONAL:
                </p>
                <div className="space-y-2">
                  {/* Primeira linha - Respostas incorretas */}
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      onClick={() => handleAnswer(0)}
                      variant="outline"
                      className="flex-col h-auto p-3 border-red-300 hover:border-red-400 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30"
                    >
                      <XCircle className="w-5 h-5 text-red-600 mb-1" />
                      <span className="text-xs font-medium text-red-700 dark:text-red-400 font-police-subtitle uppercase tracking-wider">FALHA</span>
                      <span className="text-xs text-red-600 dark:text-red-500 font-police-body">TOTAL</span>
                      <span className="text-[10px] text-red-500 mt-1 font-police-numbers">10 min</span>
                    </Button>
                    <Button
                      onClick={() => handleAnswer(1)}
                      variant="outline"
                      className="flex-col h-auto p-3 border-orange-300 hover:border-orange-400 bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/20 dark:hover:bg-orange-900/30"
                    >
                      <AlertCircle className="w-5 h-5 text-orange-600 mb-1" />
                      <span className="text-xs font-medium text-orange-700 dark:text-orange-400 font-police-subtitle uppercase tracking-wider">ERRO</span>
                      <span className="text-xs text-orange-600 dark:text-orange-500 font-police-body">REVISAR</span>
                      <span className="text-[10px] text-orange-500 mt-1 font-police-numbers">1 dia</span>
                    </Button>
                    <Button
                      onClick={() => handleAnswer(2)}
                      variant="outline"
                      className="flex-col h-auto p-3 border-yellow-300 hover:border-yellow-400 bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/30"
                    >
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mb-1" />
                      <span className="text-xs font-medium text-yellow-700 dark:text-yellow-400 font-police-subtitle uppercase tracking-wider">DIFIC.</span>
                      <span className="text-xs text-yellow-600 dark:text-yellow-500 font-police-body">ESFORÇO</span>
                      <span className="text-[10px] text-yellow-500 mt-1 font-police-numbers">{Math.max(1, Math.round(currentCard.srsData.interval * 0.6))} dias</span>
                    </Button>
                  </div>
                  
                  {/* Segunda linha - Respostas corretas */}
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      onClick={() => handleAnswer(3)}
                      variant="outline"
                      className="flex-col h-auto p-3 border-blue-300 hover:border-blue-400 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30"
                    >
                      <CheckCircle className="w-5 h-5 text-blue-600 mb-1" />
                      <span className="text-xs font-medium text-blue-700 dark:text-blue-400 font-police-subtitle uppercase tracking-wider">BOM</span>
                      <span className="text-xs text-blue-600 dark:text-blue-500 font-police-body">ADEQUADO</span>
                      <span className="text-[10px] text-blue-500 mt-1">
                        {currentCard.srsData.repetitions === 0 ? '1 dia' : 
                         currentCard.srsData.repetitions === 1 ? '6 dias' : 
                         `${Math.round(currentCard.srsData.interval * currentCard.srsData.easeFactor)} dias`}
                      </span>
                    </Button>
                    <Button
                      onClick={() => handleAnswer(4)}
                      variant="outline"
                      className="flex-col h-auto p-3 border-green-300 hover:border-green-400 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30"
                    >
                      <Star className="w-5 h-5 text-green-600 mb-1" />
                      <span className="text-xs font-medium text-green-700 dark:text-green-400 font-police-subtitle uppercase tracking-wider">FÁCIL</span>
                      <span className="text-xs text-green-600 dark:text-green-500 font-police-body">SEM ESFORÇO</span>
                      <span className="text-[10px] text-green-500 mt-1">
                        {Math.round((currentCard.srsData.repetitions === 0 ? 1 : 
                         currentCard.srsData.repetitions === 1 ? 6 : 
                         currentCard.srsData.interval * currentCard.srsData.easeFactor) * 1.15)} dias
                      </span>
                    </Button>
                    <Button
                      onClick={() => handleAnswer(5)}
                      variant="outline"
                      className="flex-col h-auto p-3 border-emerald-300 hover:border-emerald-400 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/30"
                    >
                      <Zap className="w-5 h-5 text-emerald-600 mb-1" />
                      <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400 font-police-subtitle uppercase tracking-wider">EXPERT</span>
                      <span className="text-xs text-emerald-600 dark:text-emerald-500 font-police-body">INSTANTÂNEO</span>
                      <span className="text-[10px] text-emerald-500 mt-1">
                        {Math.round((currentCard.srsData.repetitions === 0 ? 1 : 
                         currentCard.srsData.repetitions === 1 ? 6 : 
                         currentCard.srsData.interval * currentCard.srsData.easeFactor) * 1.3)} dias
                      </span>
                    </Button>
                  </div>
                </div>
                
                {/* Informação adicional */}
                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-600 dark:text-gray-400 text-center font-police-body">
                    <Info className="w-3 h-3 inline mr-1" />
                    INTERVALO: {currentCard.srsData.interval} DIAS • 
                    FATOR: {currentCard.srsData.easeFactor.toFixed(2)} • 
                    REPETIÇÕES: {currentCard.srsData.repetitions}
                  </p>
                </div>
              </div>
            )}
          </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-black min-h-full relative">
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-5 dark:opacity-10 pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 35px,
            rgba(250, 204, 21, 0.05) 35px,
            rgba(250, 204, 21, 0.05) 70px
          )`
        }}
      />
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-police-title font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-ultra-wide">ARSENAL DE CARTÕES TÁTICOS</h1>
            <p className="text-gray-600 dark:text-gray-400 font-police-body uppercase tracking-wider">
              SISTEMA TÁTICO DE REPETIÇÃO ESPAÇADA PARA MEMORIZAÇÃO OPERACIONAL
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-lg px-4 py-2 font-police-subtitle tracking-wider border-2 border-current">
              <Flame className="w-5 h-5 mr-2 text-orange-500" />
              {studyStats.dailyStreak} DIAS DE OPERAÇÃO
            </Badge>
          </div>
        </div>

        {/* Cards de estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-2 border-gray-200 dark:border-gray-800 relative overflow-hidden">
            {/* Tactical stripe */}
            <div className="absolute top-0 right-0 w-1 h-full bg-accent-500" />
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-police-body uppercase tracking-wider">ARSENAL PENDENTE</p>
                  <p className="text-2xl font-bold text-red-600 font-police-numbers">{studyStats.dueToday}</p>
                </div>
                <Clock className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-gray-200 dark:border-gray-800 relative overflow-hidden">
            {/* Tactical stripe */}
            <div className="absolute top-0 right-0 w-1 h-full bg-accent-500" />
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-police-body uppercase tracking-wider">ARSENAL NOVO</p>
                  <p className="text-2xl font-bold text-green-600 font-police-numbers">{studyStats.newCards}</p>
                </div>
                <Plus className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-gray-200 dark:border-gray-800 relative overflow-hidden">
            {/* Tactical stripe */}
            <div className="absolute top-0 right-0 w-1 h-full bg-accent-500" />
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-police-body uppercase tracking-wider">EXECUTADOS HOJE</p>
                  <p className="text-2xl font-bold text-blue-600 font-police-numbers">{studyStats.cardsStudiedToday}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-gray-200 dark:border-gray-800 relative overflow-hidden">
            {/* Tactical stripe */}
            <div className="absolute top-0 right-0 w-1 h-full bg-accent-500" />
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-police-body uppercase tracking-wider">TEMPO OPERACIONAL</p>
                  <p className="text-2xl font-bold text-purple-600 font-police-numbers">{formatTime(studyStats.timeStudiedToday)}</p>
                </div>
                <Brain className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs de navegação */}
        <div className="flex gap-1 mb-6">
          {[
            { key: 'overview', label: 'ARSENAL DISPONÍVEL', icon: BookOpen },
            { key: 'study', label: 'EXECUTAR OPERAÇÃO', icon: Brain },
            { key: 'create', label: 'CRIAR ARSENAL', icon: Plus },
            { key: 'create-card', label: 'CRIAR CARD', icon: Zap },
            { key: 'stats', label: 'INTELIGÊNCIA', icon: BarChart3 }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all font-police-body uppercase tracking-wider",
                  activeTab === tab.key 
                    ? "bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black shadow-lg font-semibold" 
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Conteúdo das tabs */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.1 }}
          >
            {/* Filtros */}
            <div className="mb-6 space-y-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                    <input
                      type="text"
                      placeholder="BUSCAR ARSENAL DE CARTÕES TÁTICOS..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-accent-500/50 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent font-police-body placeholder:uppercase placeholder:tracking-wider hover:border-accent-500 transition-colors"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={deckFilter}
                    onChange={(e) => setDeckFilter(e.target.value as any)}
                    className="px-4 py-3 border border-gray-200 dark:border-accent-500/50 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-500 font-police-body uppercase tracking-wider hover:border-accent-500 transition-colors"
                  >
                    <option value="all">TODOS OS ARSENAIS</option>
                    <option value="my">MEUS ARSENAIS</option>
                    <option value="system">ARSENAIS DO SISTEMA</option>
                  </select>
                  <select
                    value={filterSubject}
                    onChange={(e) => setFilterSubject(e.target.value)}
                    className="px-4 py-3 border border-gray-200 dark:border-accent-500/50 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-500 font-police-body uppercase tracking-wider hover:border-accent-500 transition-colors"
                  >
                    {subjects.map(subject => (
                      <option key={subject} value={subject}>
                        {subject === 'all' ? 'TODAS AS ÁREAS' : subject}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Demonstração dos tipos de flashcards */}
            <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-1 h-full bg-blue-500" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 font-police-title uppercase tracking-wider">
                TIPOS DE CARTÕES TÁTICOS DISPONÍVEIS
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4 font-police-body">
                NOSSO SISTEMA SUPORTA 7 TIPOS DIFERENTES DE FLASHCARDS PARA MAXIMIZAR SEU APRENDIZADO:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { type: 'basic', name: 'BÁSICO', desc: 'Pergunta e resposta tradicional', count: mockFlashcards.filter(c => c.type === 'basic').length, color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' },
                  { type: 'basic_inverted', name: 'BÁSICO INVERTIDO', desc: 'Com cartão reverso automático', count: mockFlashcards.filter(c => c.type === 'basic_inverted').length, color: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' },
                  { type: 'cloze', name: 'LACUNAS', desc: 'Preencher espaços em branco', count: mockFlashcards.filter(c => c.type === 'cloze').length, color: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400' },
                  { type: 'multiple_choice', name: 'MÚLTIPLA ESCOLHA', desc: '4 alternativas com explicação', count: mockFlashcards.filter(c => c.type === 'multiple_choice').length, color: 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400' },
                  { type: 'true_false', name: 'VERDADEIRO/FALSO', desc: 'Avaliação de afirmações', count: mockFlashcards.filter(c => c.type === 'true_false').length, color: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400' },
                  { type: 'type_answer', name: 'DIGITE RESPOSTA', desc: 'Campo de texto com dica', count: mockFlashcards.filter(c => c.type === 'type_answer').length, color: 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400' },
                  { type: 'image_occlusion', name: 'OCLUSÃO IMAGEM', desc: 'Áreas ocultas em imagens', count: mockFlashcards.filter(c => c.type === 'image_occlusion').length, color: 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400' }
                ].map((cardType, index) => (
                  <div key={cardType.type} className={cn("p-3 rounded-lg border-2", cardType.color)}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-police-subtitle uppercase tracking-wider font-bold">{cardType.name}</span>
                      <Badge className="text-xs font-police-numbers bg-white/50 dark:bg-black/50 text-gray-700 dark:text-gray-300">
                        {cardType.count}
                      </Badge>
                    </div>
                    <p className="text-xs font-police-body">{cardType.desc}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <Button 
                  onClick={() => setActiveTab('create')}
                  variant="outline"
                  className="gap-2 font-police-body uppercase tracking-wider hover:border-blue-500 hover:text-blue-500"
                >
                  <Plus className="w-4 h-4" />
                  EXPLORAR TODOS OS TIPOS
                </Button>
              </div>
            </div>

            {/* Destaque especial para o deck tutorial */}
            <div className="mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 rounded-2xl blur-sm animate-pulse" />
                <Card className="relative border-2 border-purple-500 dark:border-purple-400 bg-gradient-to-br from-purple-50/80 to-pink-50/80 dark:from-purple-900/30 dark:to-pink-900/30 shadow-lg shadow-purple-200/50 dark:shadow-purple-900/30 overflow-hidden">
                  <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-purple-500 to-pink-500" />
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                        <span className="text-2xl">🎓</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white font-police-title uppercase tracking-wider">
                            GUIA TÁTICO - TIPOS DE FLASHCARDS
                          </h3>
                          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-police-body text-xs uppercase tracking-wider animate-bounce">
                            🎯 TUTORIAL OFICIAL
                          </Badge>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 font-police-body">
                          <strong>APRENDA TODOS OS 6 TIPOS DE FLASHCARDS</strong> disponíveis para criação. 
                          Deck educativo com exemplos práticos demonstrando quando e como usar cada tipo.
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-2 mb-4">
                      <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-police-body">🔵 BÁSICO</Badge>
                      <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-police-body">🟢 INVERTIDO</Badge>
                      <Badge className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-police-body">🟡 LACUNAS</Badge>
                      <Badge className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-police-body">🟣 MÚLTIPLA</Badge>
                      <Badge className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-police-body">🔴 V/F</Badge>
                      <Badge className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-xs font-police-body">🟦 DIGITAR</Badge>
                    </div>
                    
                    <div className="flex gap-3">
                      <Button 
                        onClick={() => {
                          const guideDeck = mockDecks.find(d => d.id === 'guide-flashcard-types');
                          if (guideDeck) {
                            const guideCards = mockFlashcards.filter(card => card.id.startsWith('guide-'));
                            setStudyCards(guideCards);
                            setCurrentCard(guideCards[0]);
                            setCurrentCardIndex(0);
                            setShowAnswer(false);
                            setStudySession({
                              deckName: guideDeck.name,
                              totalCards: guideCards.length,
                              cardsStudied: 0,
                              accuracy: 0,
                              startTime: Date.now(),
                              isActive: true
                            });
                            setActiveTab('study');
                          }
                        }}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-police-body font-semibold uppercase tracking-wider"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        INICIAR TUTORIAL (6 EXEMPLOS)
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => setActiveTab('create-card')}
                        className="border-purple-500 text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 font-police-body uppercase tracking-wider"
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        CRIAR MEU FLASHCARD
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Grid de decks */}
            {filteredDecks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDecks.map((deck) => (
                  <DeckCard key={deck.id} deck={deck} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Brain className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 font-police-subtitle uppercase tracking-wider">
                  NENHUM ARSENAL ENCONTRADO
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 font-police-body">
                  NÃO HÁ ARSENAIS DISPONÍVEIS PARA ESTA ÁREA NO MOMENTO.
                  <br />
                  NOVOS ARSENAIS SÃO ADICIONADOS REGULARMENTE PELOS COMANDANTES.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => setFilterSubject('all')}
                  className="font-police-body uppercase tracking-wider hover:border-accent-500 hover:text-accent-500"
                >
                  VER TODOS OS ARSENAIS
                </Button>
              </div>
            )}

            {/* Seção de Flashcards Individuais Criados pelo Usuário */}
            <div className="mt-12">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white font-police-title uppercase tracking-wider">
                    🎯 MEUS CARTÕES TÁTICOS
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 font-police-body">
                    FLASHCARDS INDIVIDUAIS CRIADOS POR VOCÊ
                  </p>
                </div>
                <Button 
                  onClick={() => setActiveTab('create-card')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-police-body uppercase tracking-wider"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  CRIAR CARTÃO
                </Button>
              </div>
              
              {/* Grid de flashcards individuais criados pelo usuário */}
              {mockFlashcards.filter(card => card.id.startsWith('card-')).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mockFlashcards
                    .filter(card => card.id.startsWith('card-'))
                    .slice(0, 6)
                    .map((card) => (
                    <motion.div
                      key={card.id}
                      whileHover={{ scale: 1.02 }}
                      className="bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-accent-500 dark:hover:border-accent-500 transition-colors cursor-pointer"
                      onClick={() => {
                        setStudyCards([card]);
                        setCurrentCard(card);
                        setCurrentCardIndex(0);
                        setShowAnswer(false);
                        setStudySession({
                          deckName: 'Cartão Individual',
                          totalCards: 1,
                          cardsStudied: 0,
                          accuracy: 0,
                          startTime: Date.now(),
                          isActive: true
                        });
                        setActiveTab('study');
                      }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <Badge className="bg-accent-500 text-black font-police-body text-xs uppercase tracking-wider">
                          {card.type === 'basic' && '🔵 BÁSICO'}
                          {card.type === 'basic_inverted' && '🟢 BÁSICO INV.'}
                          {card.type === 'cloze' && '🟡 LACUNAS'}
                          {card.type === 'multiple_choice' && '🟣 MÚLTIPLA'}
                          {card.type === 'true_false' && '🔴 V/F'}
                          {card.type === 'type_answer' && '🟦 DIGITAR'}
                        </Badge>
                        <Badge variant="outline" className="text-xs font-police-numbers">
                          {card.difficulty}
                        </Badge>
                      </div>
                      
                      <h4 className="font-police-subtitle font-semibold text-gray-900 dark:text-white mb-2 text-sm line-clamp-2">
                        {card.front}
                      </h4>
                      
                      <p className="text-gray-600 dark:text-gray-400 text-xs font-police-body mb-3 line-clamp-2">
                        {card.back.length > 60 ? `${card.back.substring(0, 60)}...` : card.back}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400 font-police-body uppercase tracking-wider">
                          {card.subject}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-green-600 dark:text-green-400 font-police-numbers">
                            {card.stats.totalReviews > 0 ? Math.round((card.stats.correctReviews / card.stats.totalReviews) * 100) : 0}%
                          </span>
                          <Eye className="w-3 h-3 text-gray-400" />
                          <span className="text-gray-500 dark:text-gray-400 font-police-numbers">
                            {card.stats.totalReviews}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                  <Zap className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 font-police-subtitle uppercase tracking-wider">
                    NENHUM CARTÃO CRIADO AINDA
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 font-police-body">
                    CRIE SEUS PRÓPRIOS FLASHCARDS PERSONALIZADOS PARA OTIMIZAR SEUS ESTUDOS
                  </p>
                  <Button 
                    onClick={() => setActiveTab('create-card')}
                    className="bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body uppercase tracking-wider"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    CRIAR PRIMEIRO CARTÃO
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'study' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.1 }}
          >
            {currentCard ? (
              <div>
                {/* Header da sessão */}
                {studySession && (
                  <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white font-police-title uppercase tracking-wider">
                          {selectedDeck?.name}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 font-police-body">
                          <span>CARTÃO {currentCardIndex + 1} DE {studyCards.length}</span>
                          <span>EXECUTADOS: {studySession.cardsStudied}</span>
                          <span>PRECISÃO: {studySession.accuracy}%</span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="font-police-body uppercase tracking-wider hover:border-accent-500 hover:text-accent-500"
                        onClick={() => {
                          if (confirm('TEM CERTEZA QUE DESEJA ABORTAR A OPERAÇÃO?')) {
                            finishStudySession();
                          }
                        }}
                      >
                        ABORTAR OPERAÇÃO
                      </Button>
                    </div>
                    
                    {/* Barra de progresso */}
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentCardIndex + 1) / studyCards.length) * 100}%` }}
                        className="bg-accent-500 h-full rounded-full transition-all duration-500"
                      />
                    </div>
                  </div>
                )}

                <StudyCard card={currentCard} />
              </div>
            ) : (
              <div className="text-center py-12">
                <Brain className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 font-police-subtitle uppercase tracking-wider">
                  SELECIONE UM ARSENAL PARA TREINAMENTO
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 font-police-body uppercase tracking-wider">
                  RETORNE AO ARSENAL DISPONÍVEL E ESCOLHA UMA OPERAÇÃO PARA INICIAR
                </p>
                <Button 
                  onClick={() => setActiveTab('overview')}
                  className="bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-semibold uppercase tracking-wider"
                >
                  VER ARSENAIS DISPONÍVEIS
                </Button>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'create' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-4xl mx-auto"
          >
            <Card className="border-2 border-gray-200 dark:border-gray-800 relative overflow-hidden">
              {/* Tactical stripe */}
              <div className="absolute top-0 right-0 w-1 h-full bg-accent-500" />
              <CardHeader>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white font-police-title uppercase tracking-ultra-wide">CRIAR NOVO ARSENAL</h3>
                <p className="text-gray-600 dark:text-gray-400 font-police-body">
                  MONTE SUA COLEÇÃO PERSONALIZADA SELECIONANDO CARTÕES EXISTENTES DO SISTEMA
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Informações básicas do deck */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-subtitle uppercase tracking-wider">
                      NOME DO ARSENAL
                    </label>
                    <input
                      type="text"
                      placeholder="EX: ARSENAL TÁTICO - CONSTITUCIONAL E PENAL"
                      value={newDeckName}
                      onChange={(e) => setNewDeckName(e.target.value)}
                      className="w-full p-3 border border-gray-200 dark:border-accent-500/50 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-500 font-police-body placeholder:uppercase placeholder:tracking-wider hover:border-accent-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-subtitle uppercase tracking-wider">
                      ÁREA OPERACIONAL
                    </label>
                    <select 
                      value={newDeckSubject}
                      onChange={(e) => setNewDeckSubject(e.target.value)}
                      className="w-full p-3 border border-gray-200 dark:border-accent-500/50 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-500 font-police-body uppercase tracking-wider hover:border-accent-500 transition-colors"
                    >
                      <option value="">SELECIONE UMA ÁREA</option>
                      <option value="Misto/Várias matérias">OPERAÇÃO MISTA/VÁRIAS ÁREAS</option>
                      <option value="Direito Constitucional">Direito Constitucional</option>
                      <option value="Direito Penal">Direito Penal</option>
                      <option value="Direito Administrativo">Direito Administrativo</option>
                      <option value="Informática">Informática</option>
                      <option value="Português">Português</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-subtitle uppercase tracking-wider">
                    BRIEFING OPERACIONAL
                  </label>
                  <textarea
                    placeholder="DESCREVA O OBJETIVO DO SEU ARSENAL PERSONALIZADO..."
                    value={newDeckDescription}
                    onChange={(e) => setNewDeckDescription(e.target.value)}
                    className="w-full p-3 border border-gray-200 dark:border-accent-500/50 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-500 min-h-[80px] font-police-body placeholder:uppercase placeholder:tracking-wider hover:border-accent-500 transition-colors"
                  />
                </div>

                {/* Seleção de cards existentes */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4 font-police-title uppercase tracking-wider">SELECIONAR CARTÕES TÁTICOS</h4>
                  
                  {/* Filtros para encontrar cards */}
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4 border border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-subtitle uppercase tracking-wider">
                          FILTRAR POR ÁREA
                        </label>
                        <select className="w-full p-2 border border-gray-200 dark:border-accent-500/50 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-500 font-police-body uppercase tracking-wider hover:border-accent-500 transition-colors">
                          <option>TODAS</option>
                          <option>Direito Constitucional</option>
                          <option>Direito Penal</option>
                          <option>Informática</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-subtitle uppercase tracking-wider">
                          NÍVEL TÁTICO
                        </label>
                        <select className="w-full p-2 border border-gray-200 dark:border-accent-500/50 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-500 font-police-body uppercase tracking-wider hover:border-accent-500 transition-colors">
                          <option>TODOS</option>
                          <option>FÁCIL</option>
                          <option>MÉDIO</option>
                          <option>DIFÍCIL</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-subtitle uppercase tracking-wider">
                          BUSCAR INTEL
                        </label>
                        <input
                          type="text"
                          placeholder="PALAVRAS-CHAVE..."
                          className="w-full p-2 border border-gray-200 dark:border-accent-500/50 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-500 font-police-body placeholder:uppercase placeholder:tracking-wider hover:border-accent-500 transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Lista de cards disponíveis */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-police-body uppercase tracking-wider">
                        {mockFlashcards.length} CARTÕES DISPONÍVEIS - TODOS OS 7 TIPOS IMPLEMENTADOS
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white font-police-numbers">
                        {selectedCards.length} SELECIONADO{selectedCards.length !== 1 ? 'S' : ''}
                      </p>
                    </div>

                    {/* Resumo dos tipos disponíveis */}
                    <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2 font-police-subtitle uppercase tracking-wider">
                        TIPOS DE CARTÕES TÁTICOS DISPONÍVEIS:
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="font-police-body text-blue-700 dark:text-blue-300">1. BÁSICO</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="font-police-body text-blue-700 dark:text-blue-300">2. BÁSICO INVERTIDO</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <span className="font-police-body text-blue-700 dark:text-blue-300">3. LACUNAS (CLOZE)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span className="font-police-body text-blue-700 dark:text-blue-300">4. MÚLTIPLA ESCOLHA</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span className="font-police-body text-blue-700 dark:text-blue-300">5. VERDADEIRO/FALSO</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                          <span className="font-police-body text-blue-700 dark:text-blue-300">6. DIGITE RESPOSTA</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          <span className="font-police-body text-blue-700 dark:text-blue-300">7. OCLUSÃO IMAGEM</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg max-h-96 overflow-y-auto bg-white dark:bg-gray-900">
                      {mockFlashcards.map((card) => {
                        const getTypeColor = (type: string) => {
                          switch (type) {
                            case 'basic': return 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-300';
                            case 'basic_inverted': return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-300';
                            case 'cloze': return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-300';
                            case 'multiple_choice': return 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-300';
                            case 'true_false': return 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-300';
                            case 'type_answer': return 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 border-indigo-300';
                            case 'image_occlusion': return 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-300';
                            default: return 'bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-400 border-gray-300';
                          }
                        };

                        const getTypeName = (type: string) => {
                          switch (type) {
                            case 'basic': return 'BÁSICO';
                            case 'basic_inverted': return 'BÁSICO INVERTIDO';
                            case 'cloze': return 'LACUNAS (CLOZE)';
                            case 'multiple_choice': return 'MÚLTIPLA ESCOLHA';
                            case 'true_false': return 'VERDADEIRO/FALSO';
                            case 'type_answer': return 'DIGITE RESPOSTA';
                            case 'image_occlusion': return 'OCLUSÃO IMAGEM';
                            default: return type.toUpperCase();
                          }
                        };

                        return (
                          <div
                            key={card.id}
                            className="p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                          >
                            <div className="flex items-start gap-4">
                              <input
                                type="checkbox"
                                checked={selectedCards.includes(card.id)}
                                onChange={() => handleCardSelection(card.id)}
                                className="mt-1 w-4 h-4 text-accent-500 border-gray-300 dark:border-gray-600 rounded focus:ring-accent-500"
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                  <Badge 
                                    className={cn(
                                      "text-xs font-police-subtitle tracking-wider border-2",
                                      getTypeColor(card.type)
                                    )}
                                  >
                                    {getTypeName(card.type)}
                                  </Badge>
                                  <Badge variant="secondary" className="text-xs font-police-body border-accent-500 text-accent-500">
                                    {card.subject}
                                  </Badge>
                                  <Badge 
                                    className={cn(
                                      "text-xs font-police-subtitle tracking-wider border-2 border-current",
                                      card.difficulty === 'Fácil' && "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400",
                                      card.difficulty === 'Médio' && "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400",
                                      card.difficulty === 'Difícil' && "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                                    )}
                                  >
                                    {card.difficulty}
                                  </Badge>
                                </div>
                                <p className="font-medium text-gray-900 dark:text-white mb-1 font-police-body">
                                  {card.front}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 font-police-body">
                                  {card.back}
                                </p>
                                {/* Exibir informações específicas do tipo */}
                                {card.type === 'cloze' && card.clozeText && (
                                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 font-police-body italic">
                                    Texto com lacunas: {card.clozeText.slice(0, 50)}...
                                  </p>
                                )}
                                {card.type === 'multiple_choice' && card.multipleChoiceOptions && (
                                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 font-police-body italic">
                                    {card.multipleChoiceOptions.length} alternativas disponíveis
                                  </p>
                                )}
                                {card.type === 'true_false' && card.truefalseStatement && (
                                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 font-police-body italic">
                                    Afirmação: {card.truefalseStatement.slice(0, 50)}...
                                  </p>
                                )}
                                {card.type === 'type_answer' && card.typeAnswerHint && (
                                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 font-police-body italic">
                                    Dica: {card.typeAnswerHint}
                                  </p>
                                )}
                                {card.type === 'image_occlusion' && card.occlusionAreas && (
                                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 font-police-body italic">
                                    {card.occlusionAreas.length} áreas de oclusão configuradas
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                    <p className="text-sm text-blue-800 dark:text-blue-200 font-police-body">
                      <strong className="font-police-subtitle uppercase tracking-wider">INTEL TÁTICA:</strong> VOCÊ PODE ADICIONAR MAIS CARTÕES AO SEU ARSENAL A QUALQUER MOMENTO. 
                      COMECE COM ALGUNS E VÁ EXPANDINDO CONFORME SUA NECESSIDADE OPERACIONAL.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button 
                    className="flex-1 gap-2 bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-semibold uppercase tracking-wider" 
                    disabled={selectedCards.length === 0 || !newDeckName.trim()}
                    onClick={handleCreateDeck}
                  >
                    <Plus className="w-4 h-4" />
                    {selectedCards.length === 0 
                      ? 'CRIAR ARSENAL (SELECIONE PELO MENOS 1 CARTÃO)' 
                      : `CRIAR ARSENAL COM ${selectedCards.length} CARTÃO${selectedCards.length > 1 ? 'S' : ''}`}
                  </Button>
                  <Button variant="outline" className="font-police-body uppercase tracking-wider hover:border-accent-500 hover:text-accent-500" onClick={() => {
                    setSelectedCards([]);
                    setNewDeckName('');
                    setNewDeckDescription('');
                    setNewDeckSubject('');
                    setActiveTab('overview');
                  }}>
                    ABORTAR
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === 'create-card' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-4xl mx-auto"
          >
            <Card className="border-2 border-gray-200 dark:border-gray-800 relative overflow-hidden">
              {/* Tactical stripe */}
              <div className="absolute top-0 right-0 w-1 h-full bg-accent-500" />
              <CardHeader>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white font-police-title uppercase tracking-ultra-wide">CRIAR CARTÃO TÁTICO</h3>
                <p className="text-gray-600 dark:text-gray-400 font-police-body">
                  CRIE SEU PRÓPRIO FLASHCARD PERSONALIZADO PARA ESTUDOS INDIVIDUAIS
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Tipo de cartão */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-subtitle uppercase tracking-wider">
                    TIPO DE CARTÃO TÁTICO
                  </label>
                  <select 
                    value={newCardType}
                    onChange={(e) => setNewCardType(e.target.value as any)}
                    className="w-full p-3 border border-gray-200 dark:border-accent-500/50 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-500 font-police-body uppercase tracking-wider hover:border-accent-500 transition-colors"
                  >
                    <option value="basic">🔵 BÁSICO - Pergunta e Resposta</option>
                    <option value="basic_inverted">🟢 BÁSICO INVERTIDO - Com Cartão Reverso</option>
                    <option value="cloze">🟡 LACUNAS (CLOZE) - Completar Texto</option>
                    <option value="multiple_choice">🟣 MÚLTIPLA ESCOLHA - 4 Alternativas</option>
                    <option value="true_false">🔴 VERDADEIRO/FALSO - Avaliar Afirmação</option>
                    <option value="type_answer">🟦 DIGITAR RESPOSTA - Campo de Texto</option>
                  </select>
                </div>

                {/* Campos principais */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-subtitle uppercase tracking-wider">
                      FRENTE DO CARTÃO *
                    </label>
                    <textarea
                      placeholder={newCardType === 'multiple_choice' ? 'QUAL É A PERGUNTA?' : 'DIGITE A PERGUNTA/FRENTE DO CARTÃO...'}
                      value={newCardFront}
                      onChange={(e) => setNewCardFront(e.target.value)}
                      className="w-full p-3 border border-gray-200 dark:border-accent-500/50 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-500 min-h-[100px] font-police-body placeholder:uppercase placeholder:tracking-wider hover:border-accent-500 transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-subtitle uppercase tracking-wider">
                      VERSO DO CARTÃO *
                    </label>
                    <textarea
                      placeholder={newCardType === 'multiple_choice' ? 'A) OPÇÃO 1\nB) OPÇÃO 2\nC) OPÇÃO 3\nD) OPÇÃO 4\n\nRESPOSTA CORRETA: A' : 'DIGITE A RESPOSTA/VERSO DO CARTÃO...'}
                      value={newCardBack}
                      onChange={(e) => setNewCardBack(e.target.value)}
                      className="w-full p-3 border border-gray-200 dark:border-accent-500/50 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-500 min-h-[100px] font-police-body placeholder:uppercase placeholder:tracking-wider hover:border-accent-500 transition-colors"
                      required
                    />
                  </div>
                </div>

                {/* Informações adicionais */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-subtitle uppercase tracking-wider">
                      ÁREA OPERACIONAL *
                    </label>
                    <select 
                      value={newCardSubject}
                      onChange={(e) => setNewCardSubject(e.target.value)}
                      className="w-full p-3 border border-gray-200 dark:border-accent-500/50 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-500 font-police-body uppercase tracking-wider hover:border-accent-500 transition-colors"
                      required
                    >
                      <option value="">SELECIONE UMA ÁREA</option>
                      <option value="Direito Constitucional">Direito Constitucional</option>
                      <option value="Direito Penal">Direito Penal</option>
                      <option value="Direito Administrativo">Direito Administrativo</option>
                      <option value="Informática">Informática</option>
                      <option value="Português">Português</option>
                      <option value="Raciocínio Lógico">Raciocínio Lógico</option>
                      <option value="Conhecimentos Gerais">Conhecimentos Gerais</option>
                      <option value="Outros">Outros</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-subtitle uppercase tracking-wider">
                      NÍVEL TÁTICO
                    </label>
                    <select 
                      value={newCardDifficulty}
                      onChange={(e) => setNewCardDifficulty(e.target.value as any)}
                      className="w-full p-3 border border-gray-200 dark:border-accent-500/50 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-500 font-police-body uppercase tracking-wider hover:border-accent-500 transition-colors"
                    >
                      <option value="Fácil">🟢 FÁCIL - OPERAÇÃO BÁSICA</option>
                      <option value="Médio">🟡 MÉDIO - OPERAÇÃO PADRÃO</option>
                      <option value="Difícil">🔴 DIFÍCIL - OPERAÇÃO COMPLEXA</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-subtitle uppercase tracking-wider">
                    TAGS OPERACIONAIS
                  </label>
                  <input
                    type="text"
                    placeholder="EX: CONSTITUCIONAL, DIREITOS FUNDAMENTAIS, PRINCÍPIOS (SEPARAR COM VÍRGULAS)"
                    value={newCardTags}
                    onChange={(e) => setNewCardTags(e.target.value)}
                    className="w-full p-3 border border-gray-200 dark:border-accent-500/50 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-500 font-police-body placeholder:uppercase placeholder:tracking-wider hover:border-accent-500 transition-colors"
                  />
                </div>

                {/* Campos condicionais */}
                {(newCardType === 'multiple_choice' || newCardType === 'true_false') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-subtitle uppercase tracking-wider">
                      EXPLICAÇÃO TÁTICA
                    </label>
                    <textarea
                      placeholder="EXPLIQUE POR QUE ESTA É A RESPOSTA CORRETA..."
                      value={newCardExplanation}
                      onChange={(e) => setNewCardExplanation(e.target.value)}
                      className="w-full p-3 border border-gray-200 dark:border-accent-500/50 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-500 min-h-[80px] font-police-body placeholder:uppercase placeholder:tracking-wider hover:border-accent-500 transition-colors"
                    />
                  </div>
                )}

                {newCardType === 'type_answer' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-subtitle uppercase tracking-wider">
                      DICA OPERACIONAL
                    </label>
                    <input
                      type="text"
                      placeholder="DICA PARA AJUDAR NA RESPOSTA..."
                      value={newCardHint}
                      onChange={(e) => setNewCardHint(e.target.value)}
                      className="w-full p-3 border border-gray-200 dark:border-accent-500/50 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-500 font-police-body placeholder:uppercase placeholder:tracking-wider hover:border-accent-500 transition-colors"
                    />
                  </div>
                )}

                {/* Preview do cartão */}
                {newCardFront && newCardBack && (
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-4 font-police-title uppercase tracking-wider">PREVIEW DO CARTÃO TÁTICO</h4>
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border-2 border-accent-500/30 hover:border-accent-500 transition-colors">
                        <div className="text-center">
                          <Badge className="mb-3 bg-accent-500 text-black font-police-body uppercase tracking-wider">
                            {newCardType === 'basic' && '🔵 BÁSICO'}
                            {newCardType === 'basic_inverted' && '🟢 BÁSICO INVERTIDO'}
                            {newCardType === 'cloze' && '🟡 LACUNAS'}
                            {newCardType === 'multiple_choice' && '🟣 MÚLTIPLA ESCOLHA'}
                            {newCardType === 'true_false' && '🔴 VERDADEIRO/FALSO'}
                            {newCardType === 'type_answer' && '🟦 DIGITAR RESPOSTA'}
                          </Badge>
                          <h5 className="font-police-subtitle font-bold text-gray-900 dark:text-white mb-2">FRENTE:</h5>
                          <p className="text-gray-700 dark:text-gray-300 mb-4 font-police-body">{newCardFront}</p>
                          <h5 className="font-police-subtitle font-bold text-gray-900 dark:text-white mb-2">VERSO:</h5>
                          <p className="text-gray-700 dark:text-gray-300 font-police-body">{newCardBack}</p>
                          {newCardExplanation && (
                            <>
                              <h5 className="font-police-subtitle font-bold text-gray-900 dark:text-white mb-2 mt-4">EXPLICAÇÃO:</h5>
                              <p className="text-gray-600 dark:text-gray-400 font-police-body text-sm">{newCardExplanation}</p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Botões de ação */}
                <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button 
                    onClick={handleCreateCard}
                    className="flex-1 bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-semibold uppercase tracking-wider"
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    CRIAR CARTÃO TÁTICO
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setNewCardFront('');
                      setNewCardBack('');
                      setNewCardSubject('');
                      setNewCardTags('');
                      setNewCardDifficulty('Médio');
                      setNewCardExplanation('');
                      setNewCardHint('');
                      setNewCardType('basic');
                      setActiveTab('overview');
                    }}
                    className="px-8 font-police-body uppercase tracking-wider hover:border-red-500 hover:text-red-500"
                  >
                    ABORTAR
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === 'stats' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Estatísticas gerais */}
              <Card className="border-2 border-gray-200 dark:border-gray-800 relative overflow-hidden">
                {/* Tactical stripe */}
                <div className="absolute top-0 right-0 w-1 h-full bg-accent-500" />
                <CardHeader>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white font-police-title uppercase tracking-wider">INTELIGÊNCIA OPERACIONAL</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                      <div className="text-2xl font-bold text-blue-600 font-police-numbers">{studyStats.totalCards}</div>
                      <div className="text-sm text-blue-600 dark:text-blue-400 font-police-body uppercase tracking-wider">TOTAL DE CARTÕES</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                      <div className="text-2xl font-bold text-green-600 font-police-numbers">{studyStats.averageAccuracy}%</div>
                      <div className="text-sm text-green-600 dark:text-green-400 font-police-body uppercase tracking-wider">PRECISÃO MÉDIA</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                      <div className="text-2xl font-bold text-purple-600 font-police-numbers">{formatTime(studyStats.totalStudyTime)}</div>
                      <div className="text-sm text-purple-600 dark:text-purple-400 font-police-body uppercase tracking-wider">TEMPO TOTAL</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-700">
                      <div className="text-2xl font-bold text-orange-600 font-police-numbers">{studyStats.dailyStreak}</div>
                      <div className="text-sm text-orange-600 dark:text-orange-400 font-police-body uppercase tracking-wider">DIAS CONSECUTIVOS</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Progresso por matéria */}
              <Card className="border-2 border-gray-200 dark:border-gray-800 relative overflow-hidden">
                {/* Tactical stripe */}
                <div className="absolute top-0 right-0 w-1 h-full bg-accent-500" />
                <CardHeader>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white font-police-title uppercase tracking-wider">PROGRESSO POR ÁREA</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {subjects.slice(1).map((subject, index) => (
                      <div key={subject} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-900 dark:text-white font-police-body">{subject}</span>
                          <span className="text-sm text-gray-500 dark:text-gray-400 font-police-numbers">
                            {Math.floor(Math.random() * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.floor(Math.random() * 100)}%` }}
                            transition={{ duration: 1, delay: index * 0.1 }}
                            className="bg-accent-500 h-full rounded-full"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-12 bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-900 dark:to-black rounded-2xl p-8 text-white text-center border-2 border-accent-500/50 relative overflow-hidden"
      >
        {/* Tactical stripe */}
        <div className="absolute top-0 right-0 w-1 h-full bg-accent-500" />
        <Brain className="w-12 h-12 mx-auto mb-4 text-accent-500" />
        <h2 className="text-2xl font-bold mb-2 font-police-title uppercase tracking-ultra-wide">
          MAXIMIZE SUA MEMÓRIA COM SRS
        </h2>
        <p className="text-gray-300 mb-6 max-w-2xl mx-auto font-police-body">
          O SISTEMA DE REPETIÇÃO ESPAÇADA OTIMIZA SEU TEMPO DE ESTUDO, MOSTRANDO OS CARTÕES NO MOMENTO IDEAL PARA FIXAÇÃO
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            size="lg" 
            className="bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-semibold uppercase tracking-wider"
            onClick={() => setActiveTab('create')}
          >
            <Plus className="w-5 h-5 mr-2" />
            CRIAR MEU ARSENAL
          </Button>
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-police-body font-semibold uppercase tracking-wider border-2 border-blue-500"
            onClick={() => setActiveTab('create-card')}
          >
            <Zap className="w-5 h-5 mr-2" />
            CRIAR CARTÃO TÁTICO
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="border-white text-white hover:bg-white hover:text-gray-900 font-police-body uppercase tracking-wider"
            onClick={() => setActiveTab('overview')}
          >
            EXPLORAR ARSENAIS
          </Button>
        </div>
      </motion.div>
    </div>
  );
}