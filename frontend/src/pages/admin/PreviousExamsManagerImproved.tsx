import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface PreviousExam {
  id: string;
  title: string;
  organization: string;
  examBoard: string;
  category: string;
  subcategory: string;
  year: number;
  position: string;
  level: string;
  totalQuestions: number;
  duration: string;
  passingScore: number;
  candidates: number;
  approvalRate: number;
  difficulty: 'Fácil' | 'Médio' | 'Difícil' | 'Muito Difícil';
  subjects: ExamSubject[];
  tags: string[];
  downloadCount: number;
  averageScore?: number;
  solvedBy?: number;
  hasAnswerSheet: boolean;
  hasPDF: boolean;
  views: number;
  attempts: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  type: 'Oficial' | 'Digitalizada' | 'Adaptada';
}

interface ExamSubject {
  id: string;
  name: string;
  questionsCount: number;
  weight: number;
  color: string;
}

const previousExams: PreviousExam[] = [
  {
    id: '1',
    title: 'Polícia Federal - Agente 2021',
    organization: 'Polícia Federal',
    examBoard: 'CESPE',
    category: 'Concursos Policiais',
    subcategory: 'Polícia Federal',
    year: 2021,
    position: 'Agente de Polícia Federal',
    level: 'Superior',
    totalQuestions: 120,
    duration: '4h',
    passingScore: 60,
    candidates: 35420,
    approvalRate: 2.8,
    difficulty: 'Muito Difícil',
    subjects: [
      { id: '1', name: 'Direito Constitucional', questionsCount: 25, weight: 20, color: 'bg-blue-500' },
      { id: '2', name: 'Direito Administrativo', questionsCount: 25, weight: 20, color: 'bg-green-500' },
      { id: '3', name: 'Direito Penal', questionsCount: 30, weight: 25, color: 'bg-red-500' },
      { id: '4', name: 'Português', questionsCount: 25, weight: 20, color: 'bg-yellow-500' },
      { id: '5', name: 'Raciocínio Lógico', questionsCount: 15, weight: 15, color: 'bg-purple-500' }
    ],
    tags: ['pf', 'agente', '2021', 'cespe'],
    downloadCount: 15420,
    averageScore: 52.3,
    solvedBy: 3250,
    hasAnswerSheet: true,
    hasPDF: true,
    views: 15420,
    attempts: 3250,
    isActive: true,
    createdAt: '2021-12-15',
    updatedAt: '2024-08-01',
    createdBy: 'Admin',
    type: 'Oficial'
  },
  {
    id: '2',
    title: 'PRF - Policial Rodoviário 2021',
    organization: 'Polícia Rodoviária Federal',
    examBoard: 'CESPE',
    category: 'Concursos Policiais',
    subcategory: 'PRF',
    year: 2021,
    position: 'Policial Rodoviário Federal',
    level: 'Superior',
    totalQuestions: 120,
    duration: '4h',
    passingScore: 60,
    candidates: 28350,
    approvalRate: 3.2,
    difficulty: 'Difícil',
    subjects: [
      { id: '1', name: 'Direito Constitucional', questionsCount: 20, weight: 17, color: 'bg-blue-500' },
      { id: '2', name: 'Direito Administrativo', questionsCount: 20, weight: 17, color: 'bg-green-500' },
      { id: '3', name: 'Legislação de Trânsito', questionsCount: 35, weight: 29, color: 'bg-orange-500' },
      { id: '4', name: 'Português', questionsCount: 25, weight: 21, color: 'bg-yellow-500' },
      { id: '5', name: 'Matemática', questionsCount: 20, weight: 16, color: 'bg-purple-500' }
    ],
    tags: ['prf', 'policial-rodoviário', '2021', 'cespe'],
    downloadCount: 12350,
    averageScore: 48.7,
    solvedBy: 2840,
    hasAnswerSheet: true,
    hasPDF: true,
    views: 12350,
    attempts: 2840,
    isActive: true,
    createdAt: '2021-11-20',
    updatedAt: '2024-07-28',
    createdBy: 'Admin',
    type: 'Oficial'
  },
  {
    id: '3',
    title: 'Polícia Civil SP - Escrivão 2023',
    organization: 'Polícia Civil SP',
    examBoard: 'VUNESP',
    category: 'Concursos Policiais',
    subcategory: 'Polícia Civil',
    year: 2023,
    position: 'Escrivão de Polícia',
    level: 'Superior',
    totalQuestions: 100,
    duration: '3h',
    passingScore: 55,
    candidates: 18920,
    approvalRate: 4.1,
    difficulty: 'Médio',
    subjects: [
      { id: '1', name: 'Direito Penal', questionsCount: 25, weight: 25, color: 'bg-red-500' },
      { id: '2', name: 'Direito Processual Penal', questionsCount: 25, weight: 25, color: 'bg-red-600' },
      { id: '3', name: 'Direito Constitucional', questionsCount: 20, weight: 20, color: 'bg-blue-500' },
      { id: '4', name: 'Português', questionsCount: 20, weight: 20, color: 'bg-yellow-500' },
      { id: '5', name: 'Informática', questionsCount: 10, weight: 10, color: 'bg-gray-500' }
    ],
    tags: ['pc-sp', 'escrivão', '2023', 'vunesp'],
    downloadCount: 8930,
    averageScore: 61.2,
    solvedBy: 1950,
    hasAnswerSheet: true,
    hasPDF: true,
    views: 8930,
    attempts: 1950,
    isActive: true,
    createdAt: '2023-08-10',
    updatedAt: '2024-07-15',
    createdBy: 'Prof. Silva',
    type: 'Digitalizada'
  }
];

export default function PreviousExamsManagerImproved() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedBoard, setSelectedBoard] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [expandedExam, setExpandedExam] = useState<string | null>(null);

  const filteredExams = previousExams.filter(exam => {
    return (
      exam.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedCategory === '' || exam.category === selectedCategory) &&
      (selectedYear === '' || exam.year.toString() === selectedYear) &&
      (selectedDifficulty === '' || exam.difficulty === selectedDifficulty) &&
      (selectedBoard === '' || exam.examBoard === selectedBoard) &&
      (selectedStatus === '' || (selectedStatus === 'active' ? exam.isActive : !exam.isActive))
    );
  });

  const totalQuestions = previousExams.reduce((sum, exam) => sum + exam.totalQuestions, 0);
  const totalViews = previousExams.reduce((sum, exam) => sum + exam.views, 0);
  const totalAttempts = previousExams.reduce((sum, exam) => sum + exam.attempts, 0);
  const avgApprovalRate = previousExams.reduce((sum, exam) => sum + exam.approvalRate, 0) / previousExams.length;

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
      case 'Digitalizada': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'Adaptada': return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Gerenciar Provas Anteriores
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Administre o banco de provas de concursos anteriores
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
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Provas</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{previousExams.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Questões</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalQuestions.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Visualizações</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalViews.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Taxa de Aprovação</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {avgApprovalRate.toFixed(1)}%
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
              placeholder="Buscar provas..."
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
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Todos os Anos</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
              <option value="2021">2021</option>
              <option value="2020">2020</option>
            </select>
          </div>

          <div>
            <select
              value={selectedBoard}
              onChange={(e) => setSelectedBoard(e.target.value)}
              className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Todas as Bancas</option>
              <option value="CESPE">CESPE</option>
              <option value="VUNESP">VUNESP</option>
              <option value="FCC">FCC</option>
              <option value="FGV">FGV</option>
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
            onClick={() => navigate('/admin/previous-exams/new')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Nova Prova
          </button>
          <button
            onClick={() => navigate('/admin/previous-exams/import')}
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Importar
          </button>
          <button
            onClick={() => navigate('/admin/previous-exams/bulk')}
            className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Upload em Lote
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
                    Prova
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Banca/Ano
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Questões/Duração
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Recursos
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
                          {exam.organization} • {exam.position}
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
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{exam.examBoard}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{exam.year}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {exam.totalQuestions} questões
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {exam.duration}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2 text-xs">
                        <span className={exam.hasPDF ? 'text-green-600' : 'text-gray-400'}>
                          PDF: {exam.hasPDF ? '✓' : '✗'}
                        </span>
                        <span className={exam.hasAnswerSheet ? 'text-green-600' : 'text-gray-400'}>
                          Gabarito: {exam.hasAnswerSheet ? '✓' : '✗'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900 dark:text-white">
                          Aprovação: {exam.approvalRate.toFixed(1)}%
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">
                          {exam.views.toLocaleString()} views
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">
                          {exam.attempts.toLocaleString()} tentativas
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
                          onClick={() => navigate(`/admin/previous-exams/${exam.id}/edit`)}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
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
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Candidatos:</span>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {exam.candidates.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Nota de Corte:</span>
                        <div className="font-medium text-gray-900 dark:text-white">{exam.passingScore}%</div>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Downloads:</span>
                        <div className="font-medium text-blue-600">{exam.downloadCount.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Criado por:</span>
                        <div className="font-medium text-gray-900 dark:text-white">{exam.createdBy}</div>
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
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Nenhuma prova encontrada</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Comece adicionando uma nova prova anterior.
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
                      {exam.organization} • {exam.examBoard} • {exam.year}
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
                    <div className="font-medium text-gray-900 dark:text-white">{exam.duration}</div>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Views:</span>
                    <div className="font-medium text-gray-900 dark:text-white">{exam.views.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Taxa Aprovação:</span>
                    <div className="font-medium text-gray-900 dark:text-white">{exam.approvalRate.toFixed(1)}%</div>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setExpandedExam(expandedExam === exam.id ? null : exam.id)}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                    >
                      {expandedExam === exam.id ? 'Ocultar detalhes' : 'Ver matérias'}
                    </button>
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/admin/previous-exams/${exam.id}/edit`)}
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
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Nenhuma prova encontrada</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Comece adicionando uma nova prova anterior.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}