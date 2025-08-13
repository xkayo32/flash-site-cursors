import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface MockExam {
  id: string;
  title: string;
  organization: string;
  category: string;
  subcategory: string;
  totalQuestions: number;
  timeLimitMinutes: number;
  difficulty: 'Fácil' | 'Médio' | 'Difícil' | 'Muito Difícil';
  isActive: boolean;
  attempts: number;
  avgScore: number;
  maxScore: number;
  minScore: number;
  completionRate: number;
  subjects: ExamSubject[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  type: 'Oficial' | 'Personalizado' | 'Gerado';
}

interface ExamSubject {
  id: string;
  name: string;
  questionsCount: number;
  weight: number;
  color: string;
}

const mockExams: MockExam[] = [
  {
    id: '1',
    title: 'Simulado Polícia Federal - Agente 2024',
    organization: 'Polícia Federal',
    category: 'Concursos Policiais',
    subcategory: 'Polícia Federal',
    totalQuestions: 120,
    timeLimitMinutes: 240,
    difficulty: 'Muito Difícil',
    isActive: true,
    attempts: 1250,
    avgScore: 58.5,
    maxScore: 95.2,
    minScore: 12.8,
    completionRate: 87.3,
    subjects: [
      { id: '1', name: 'Direito Constitucional', questionsCount: 30, weight: 25, color: 'bg-blue-500' },
      { id: '2', name: 'Direito Administrativo', questionsCount: 25, weight: 20, color: 'bg-green-500' },
      { id: '3', name: 'Direito Penal', questionsCount: 35, weight: 30, color: 'bg-red-500' },
      { id: '4', name: 'Português', questionsCount: 20, weight: 15, color: 'bg-yellow-500' },
      { id: '5', name: 'Raciocínio Lógico', questionsCount: 10, weight: 10, color: 'bg-purple-500' }
    ],
    tags: ['agente', 'pf', '2024', 'cespe'],
    createdAt: '2024-01-15',
    updatedAt: '2024-08-01',
    createdBy: 'Sistema',
    type: 'Oficial'
  },
  {
    id: '2',
    title: 'Simulado PRF - Policial Rodoviário Federal',
    organization: 'Polícia Rodoviária Federal',
    category: 'Concursos Policiais',
    subcategory: 'PRF',
    totalQuestions: 120,
    timeLimitMinutes: 240,
    difficulty: 'Difícil',
    isActive: true,
    attempts: 980,
    avgScore: 52.3,
    maxScore: 89.7,
    minScore: 15.6,
    completionRate: 82.1,
    subjects: [
      { id: '1', name: 'Direito Constitucional', questionsCount: 25, weight: 20, color: 'bg-blue-500' },
      { id: '2', name: 'Direito Administrativo', questionsCount: 25, weight: 20, color: 'bg-green-500' },
      { id: '3', name: 'Legislação de Trânsito', questionsCount: 40, weight: 35, color: 'bg-orange-500' },
      { id: '4', name: 'Português', questionsCount: 20, weight: 15, color: 'bg-yellow-500' },
      { id: '5', name: 'Matemática', questionsCount: 10, weight: 10, color: 'bg-purple-500' }
    ],
    tags: ['prf', 'policial-rodoviário', 'trânsito'],
    createdAt: '2024-02-10',
    updatedAt: '2024-07-28',
    createdBy: 'Admin',
    type: 'Oficial'
  },
  {
    id: '3',
    title: 'Simulado Polícia Civil SP - Escrivão',
    organization: 'Polícia Civil SP',
    category: 'Concursos Policiais',
    subcategory: 'Polícia Civil',
    totalQuestions: 100,
    timeLimitMinutes: 180,
    difficulty: 'Médio',
    isActive: true,
    attempts: 650,
    avgScore: 61.2,
    maxScore: 92.4,
    minScore: 22.1,
    completionRate: 91.5,
    subjects: [
      { id: '1', name: 'Direito Penal', questionsCount: 30, weight: 30, color: 'bg-red-500' },
      { id: '2', name: 'Direito Processual Penal', questionsCount: 25, weight: 25, color: 'bg-red-600' },
      { id: '3', name: 'Direito Constitucional', questionsCount: 20, weight: 20, color: 'bg-blue-500' },
      { id: '4', name: 'Português', questionsCount: 15, weight: 15, color: 'bg-yellow-500' },
      { id: '5', name: 'Noções de Informática', questionsCount: 10, weight: 10, color: 'bg-gray-500' }
    ],
    tags: ['pc-sp', 'escrivão', 'vunesp'],
    createdAt: '2024-03-05',
    updatedAt: '2024-07-20',
    createdBy: 'Prof. Silva',
    type: 'Personalizado'
  }
];

export default function MockExamManagerImproved() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [expandedExam, setExpandedExam] = useState<string | null>(null);

  const filteredExams = mockExams.filter(exam => {
    return (
      exam.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedCategory === '' || exam.category === selectedCategory) &&
      (selectedDifficulty === '' || exam.difficulty === selectedDifficulty) &&
      (selectedStatus === '' || (selectedStatus === 'active' ? exam.isActive : !exam.isActive)) &&
      (selectedType === '' || exam.type === selectedType)
    );
  });

  const totalAttempts = mockExams.reduce((sum, exam) => sum + exam.attempts, 0);
  const avgCompletionRate = mockExams.reduce((sum, exam) => sum + exam.completionRate, 0) / mockExams.length;
  const totalQuestions = mockExams.reduce((sum, exam) => sum + exam.totalQuestions, 0);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Fácil': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'Médio': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'Difícil': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'Muito Difícil': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Oficial': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'Personalizado': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'Gerado': return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Gerenciar Simulados
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Crie e gerencie simulados para preparação dos alunos
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Simulados</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{mockExams.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Simulados Ativos</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {mockExams.filter(e => e.isActive).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Tentativas</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalAttempts.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Taxa de Conclusão</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {avgCompletionRate.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div>
            <input
              type="text"
              placeholder="Buscar simulados..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Todas as Categorias</option>
              <option value="Concursos Policiais">Concursos Policiais</option>
              <option value="Concursos Militares">Concursos Militares</option>
              <option value="Concursos Federais">Concursos Federais</option>
            </select>
          </div>

          <div>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Todas as Dificuldades</option>
              <option value="Fácil">Fácil</option>
              <option value="Médio">Médio</option>
              <option value="Difícil">Difícil</option>
              <option value="Muito Difícil">Muito Difícil</option>
            </select>
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Todos os Status</option>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
            </select>
          </div>

          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Todos os Tipos</option>
              <option value="Oficial">Oficial</option>
              <option value="Personalizado">Personalizado</option>
              <option value="Gerado">Gerado</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('list')}
              className={`flex-1 h-10 px-3 rounded-md font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Lista
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex-1 h-10 px-3 rounded-md font-medium transition-colors ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Grid
            </button>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/admin/mock-exams/new')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Novo Simulado
          </button>
          <button
            onClick={() => navigate('/admin/mock-exams/generate')}
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Gerar Simulado
          </button>
          <button
            onClick={() => navigate('/admin/mock-exams/import')}
            className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Importar
          </button>
        </div>
      </div>

      {/* Content based on view mode */}
      {viewMode === 'list' ? (
        /* Table View */
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Simulado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Questões/Tempo
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredExams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {exam.title}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {exam.organization}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getDifficultyColor(exam.difficulty)}`}>
                            {exam.difficulty}
                          </span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getTypeColor(exam.type)}`}>
                            {exam.type}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">{exam.category}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{exam.subcategory}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {exam.totalQuestions} questões
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {exam.timeLimitMinutes} min
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900 dark:text-white">
                          Média: {exam.avgScore.toFixed(1)}%
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">
                          {exam.attempts.toLocaleString()} tentativas
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">
                          {exam.completionRate.toFixed(1)}% conclusão
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        exam.isActive 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                      }`}>
                        {exam.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setExpandedExam(expandedExam === exam.id ? null : exam.id)}
                          className="bg-gray-500 hover:bg-gray-600 text-white text-sm py-1 px-2 rounded transition-colors"
                        >
                          {expandedExam === exam.id ? 'Ocultar' : 'Detalhes'}
                        </button>
                        <button
                          onClick={() => navigate(`/admin/mock-exams/${exam.id}/edit`)}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-sm py-1 px-2 rounded transition-colors"
                        >
                          Editar
                        </button>
                        <button className="bg-red-600 hover:bg-red-700 text-white text-sm py-1 px-2 rounded transition-colors">
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Expanded Details */}
          {expandedExam && (
            <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-700/50">
              {(() => {
                const exam = filteredExams.find(e => e.id === expandedExam);
                if (!exam) return null;
                
                return (
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Distribuição de Matérias - {exam.title}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {exam.subjects.map((subject) => (
                        <div key={subject.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                          <div className="flex items-center justify-between mb-2">
                            <div className={`w-3 h-3 rounded-full ${subject.color}`}></div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {subject.weight}%
                            </span>
                          </div>
                          <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                            {subject.name}
                          </h5>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {subject.questionsCount} questões
                          </p>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Criado em:</span>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {new Date(exam.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Criado por:</span>
                        <div className="font-medium text-gray-900 dark:text-white">{exam.createdBy}</div>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Maior nota:</span>
                        <div className="font-medium text-green-600">{exam.maxScore.toFixed(1)}%</div>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Menor nota:</span>
                        <div className="font-medium text-red-600">{exam.minScore.toFixed(1)}%</div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {filteredExams.length === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Nenhum simulado encontrado</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Comece criando um novo simulado.
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExams.map((exam) => (
            <div key={exam.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                      {exam.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      {exam.organization}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getDifficultyColor(exam.difficulty)}`}>
                        {exam.difficulty}
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getTypeColor(exam.type)}`}>
                        {exam.type}
                      </span>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    exam.isActive 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                  }`}>
                    {exam.isActive ? 'Ativo' : 'Inativo'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Questões:</span>
                    <div className="font-medium text-gray-900 dark:text-white">{exam.totalQuestions}</div>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Duração:</span>
                    <div className="font-medium text-gray-900 dark:text-white">{exam.timeLimitMinutes}min</div>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Tentativas:</span>
                    <div className="font-medium text-gray-900 dark:text-white">{exam.attempts.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Média:</span>
                    <div className="font-medium text-gray-900 dark:text-white">{exam.avgScore.toFixed(1)}%</div>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setExpandedExam(expandedExam === exam.id ? null : exam.id)}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                    >
                      {expandedExam === exam.id ? 'Ocultar detalhes' : 'Ver detalhes'}
                    </button>
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/admin/mock-exams/${exam.id}/edit`)}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-sm py-1 px-3 rounded transition-colors"
                      >
                        Editar
                      </button>
                      <button className="bg-red-600 hover:bg-red-700 text-white text-sm py-1 px-3 rounded transition-colors">
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {expandedExam === exam.id && (
                <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-700/50">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                    Distribuição de Matérias
                  </h4>
                  <div className="space-y-2">
                    {exam.subjects.map((subject) => (
                      <div key={subject.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${subject.color}`}></div>
                          <span className="text-gray-900 dark:text-white">{subject.name}</span>
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">
                          {subject.questionsCount} ({subject.weight}%)
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {filteredExams.length === 0 && (
            <div className="col-span-full text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Nenhum simulado encontrado</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Comece criando um novo simulado.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}