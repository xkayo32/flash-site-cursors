import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface PreviousExam {
  id: number;
  title: string;
  organization: string;
  examBoard: string;
  year: number;
  totalQuestions: number;
  difficulty: string;
  hasAnswerSheet: boolean;
  hasPDF: boolean;
  views: number;
  attempts: number;
  isActive: boolean;
}

const previousExams: PreviousExam[] = [
  {
    id: 1,
    title: 'Polícia Federal - Agente 2021',
    organization: 'Polícia Federal',
    examBoard: 'CESPE',
    year: 2021,
    totalQuestions: 120,
    difficulty: 'Difícil',
    hasAnswerSheet: true,
    hasPDF: true,
    views: 15420,
    attempts: 3250,
    isActive: true
  },
  {
    id: 2,
    title: 'PRF - Policial Rodoviário 2021',
    organization: 'Polícia Rodoviária Federal',
    examBoard: 'CESPE',
    year: 2021,
    totalQuestions: 120,
    difficulty: 'Difícil',
    hasAnswerSheet: true,
    hasPDF: true,
    views: 12350,
    attempts: 2840,
    isActive: true
  },
  {
    id: 3,
    title: 'Polícia Civil SP - Escrivão 2023',
    organization: 'Polícia Civil SP',
    examBoard: 'VUNESP',
    year: 2023,
    totalQuestions: 100,
    difficulty: 'Médio',
    hasAnswerSheet: true,
    hasPDF: true,
    views: 8930,
    attempts: 1950,
    isActive: true
  }
];

export default function PreviousExamsManagerSimple() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredExams = previousExams.filter(exam =>
    exam.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Provas</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{previousExams.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Questões Cadastradas</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {previousExams.reduce((sum, exam) => sum + exam.totalQuestions, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Visualizações</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {previousExams.reduce((sum, exam) => sum + exam.views, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Tentativas</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {previousExams.reduce((sum, exam) => sum + exam.attempts, 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar provas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/admin/previous-exams/import')}
            className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Importar
          </button>
          <button
            onClick={() => navigate('/admin/previous-exams/new')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Nova Prova
          </button>
        </div>
      </div>

      {/* Exams Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Prova
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Banca
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Ano
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Questões
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Recursos
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Estatísticas
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
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{exam.examBoard}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{exam.year}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm text-gray-900 dark:text-white">{exam.totalQuestions}</span>
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
                    <div className="text-xs">
                      <div>Views: {exam.views.toLocaleString()}</div>
                      <div>Tentativas: {exam.attempts.toLocaleString()}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
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

        {filteredExams.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">Nenhuma prova encontrada</p>
          </div>
        )}
      </div>
    </div>
  );
}