import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockExamService, MockExam } from '@/services/mockExamService';
import toast from 'react-hot-toast';


export default function MockExamManagerSimple() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [exams, setExams] = useState<MockExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadExams = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await mockExamService.getAllMockExams({
        search: searchTerm || undefined,
        limit: 100
      });
      setExams(response.data || []);
    } catch (err: any) {
      console.error('Erro ao carregar simulados:', err);
      setError('Erro ao carregar simulados');
      toast.error('Erro ao carregar simulados');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (examId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este simulado?')) {
      try {
        await mockExamService.deleteMockExam(examId);
        toast.success('Simulado excluído com sucesso');
        loadExams();
      } catch (err: any) {
        console.error('Erro ao excluir simulado:', err);
        toast.error('Erro ao excluir simulado');
      }
    }
  };

  useEffect(() => {
    loadExams();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== undefined) {
        loadExams();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const filteredExams = exams.filter(exam =>
    exam.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-3 md:p-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-xl md:text-2xl font-police-title font-bold uppercase tracking-wider text-gray-900 dark:text-white mb-2">
          COMANDO DE SIMULADOS
        </h1>
        <p className="text-gray-600 dark:text-gray-400 font-police-subtitle uppercase tracking-wider">
          CENTRO TÁTICO - SIMULAÇÕES OPERACIONAIS
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-l-4 border-l-accent-500 hover:shadow-xl transition-all duration-300 relative p-4 rounded-lg">
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-accent-500/20" />
          <h3 className="text-xs font-police-body font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">TOTAL DE SIMULADOS</h3>
          <p className="text-xl font-police-numbers font-bold text-gray-900 dark:text-white mt-1">{exams.length}</p>
        </div>
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-l-4 border-l-accent-500 hover:shadow-xl transition-all duration-300 relative p-4 rounded-lg">
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-accent-500/20" />
          <h3 className="text-xs font-police-body font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">OPERAÇÕES ATIVAS</h3>
          <p className="text-xl font-police-numbers font-bold text-gray-900 dark:text-white mt-1">
            {exams.filter(e => e.status === 'published').length}
          </p>
        </div>
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-l-4 border-l-accent-500 hover:shadow-xl transition-all duration-300 relative p-4 rounded-lg">
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-accent-500/20" />
          <h3 className="text-xs font-police-body font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">ENGAJAMENTOS</h3>
          <p className="text-xl font-police-numbers font-bold text-gray-900 dark:text-white mt-1">
            {exams.reduce((sum, exam) => sum + exam.total_attempts, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-l-4 border-l-accent-500 hover:shadow-xl transition-all duration-300 relative p-4 rounded-lg">
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-accent-500/20" />
          <h3 className="text-xs font-police-body font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">EFICIÊNCIA MÉDIA</h3>
          <p className="text-xl font-police-numbers font-bold text-gray-900 dark:text-white mt-1">
            {exams.length > 0 ? (exams.reduce((sum, exam) => sum + exam.average_score, 0) / exams.length).toFixed(1) : '0.0'}%
          </p>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="BUSCAR OPERAÇÕES TÁTICAS..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-9 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body placeholder:font-police-body placeholder:uppercase placeholder:tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
          />
        </div>
        <button
          onClick={() => navigate('/admin/mock-exams/new')}
          className="bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-semibold uppercase tracking-wider py-2 px-4 rounded-md transition-colors"
        >
          NOVA OPERAÇÃO
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
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-3 text-gray-600 dark:text-gray-400">Carregando simulados...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <p className="text-red-500 dark:text-red-400">{error}</p>
                    <button 
                      onClick={loadExams}
                      className="mt-2 bg-blue-600 hover:bg-blue-700 text-white text-sm py-1 px-3 rounded transition-colors"
                    >
                      Tentar novamente
                    </button>
                  </td>
                </tr>
              ) : (
                filteredExams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {exam.title}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Dificuldade: {mockExamService.getDifficultyLabel(exam.difficulty)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900 dark:text-white">{exam.description || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm text-gray-900 dark:text-white">{exam.total_questions}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm text-gray-900 dark:text-white">
                        {mockExamService.formatDuration(exam.duration)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {exam.total_attempts.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Média: {exam.average_score.toFixed(1)}%
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${mockExamService.getStatusColor(exam.status)}`}>
                        {mockExamService.getStatusLabel(exam.status)}
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
                        <button 
                          onClick={() => handleDelete(exam.id)}
                          className="bg-red-600 hover:bg-red-700 text-white text-sm py-1 px-2 rounded transition-colors"
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
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