import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface MockExam {
  id: number;
  title: string;
  organization: string;
  totalQuestions: number;
  timeLimitMinutes: number;
  difficulty: string;
  isActive: boolean;
  attempts: number;
  avgScore: number;
}

const mockExams: MockExam[] = [
  {
    id: 1,
    title: 'Simulado Polícia Federal - Agente',
    organization: 'Polícia Federal',
    totalQuestions: 120,
    timeLimitMinutes: 240,
    difficulty: 'Avançado',
    isActive: true,
    attempts: 1250,
    avgScore: 58.5
  },
  {
    id: 2,
    title: 'Simulado PRF - Policial Rodoviário',
    organization: 'Polícia Rodoviária Federal',
    totalQuestions: 120,
    timeLimitMinutes: 240,
    difficulty: 'Avançado',
    isActive: true,
    attempts: 980,
    avgScore: 52.3
  },
  {
    id: 3,
    title: 'Simulado Polícia Civil SP - Escrivão',
    organization: 'Polícia Civil SP',
    totalQuestions: 100,
    timeLimitMinutes: 180,
    difficulty: 'Intermediário',
    isActive: true,
    attempts: 650,
    avgScore: 61.2
  }
];

export default function MockExamManagerSimple() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredExams = mockExams.filter(exam =>
    exam.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Simulados</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{mockExams.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Simulados Ativos</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {mockExams.filter(e => e.isActive).length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Tentativas</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {mockExams.reduce((sum, exam) => sum + exam.attempts, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Média Geral</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {(mockExams.reduce((sum, exam) => sum + exam.avgScore, 0) / mockExams.length).toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar simulados..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <button
          onClick={() => navigate('/admin/mock-exams/new')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          Novo Simulado
        </button>
      </div>

      {/* Mock Exams Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Simulado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Organização
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Questões
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Duração
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tentativas
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
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {exam.title}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Dificuldade: {exam.difficulty}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900 dark:text-white">{exam.organization}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm text-gray-900 dark:text-white">{exam.totalQuestions}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm text-gray-900 dark:text-white">
                      {exam.timeLimitMinutes} min
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {exam.attempts.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Média: {exam.avgScore.toFixed(1)}%
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

        {filteredExams.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">Nenhum simulado encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
}