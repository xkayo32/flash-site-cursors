import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { previousExamService, PreviousExam } from '@/services/previousExamService';
import toast from 'react-hot-toast';


export default function PreviousExamsManagerSimple() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [exams, setExams] = useState<PreviousExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadExams = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await previousExamService.getAll({
        search: searchTerm || undefined,
        limit: 100
      });
      setExams(response.data || []);
    } catch (err: any) {
      console.error('Erro ao carregar provas anteriores:', err);
      setError('Erro ao carregar provas anteriores');
      toast.error('Erro ao carregar provas anteriores');
    } finally {
      setLoading(false);
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
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-police-title font-bold uppercase tracking-wider text-gray-900 dark:text-white mb-2">
          ARQUIVO DE OPERAÇÕES
        </h1>
        <p className="text-gray-600 dark:text-gray-400 font-police-subtitle uppercase tracking-wider">
          COMANDO DE INTELIGÊNCIA - GESTÃO DE OPERAÇÕES ANTERIORES
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-l-4 border-l-accent-500 hover:shadow-xl transition-all duration-300 relative p-6 rounded-lg">
          {/* Corner accents */}
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-accent-500/20" />
          <h3 className="text-sm font-police-body font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">ARQUIVO TOTAL</h3>
          <p className="text-2xl font-police-numbers font-bold text-gray-900 dark:text-white mt-1">{exams.length}</p>
        </div>
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-l-4 border-l-accent-500 hover:shadow-xl transition-all duration-300 relative p-6 rounded-lg">
          {/* Corner accents */}
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-accent-500/20" />
          <h3 className="text-sm font-police-body font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">ALVOS CATALOGADOS</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {exams.reduce((sum, exam) => sum + exam.total_questions, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-l-4 border-l-accent-500 hover:shadow-xl transition-all duration-300 relative p-6 rounded-lg">
          {/* Corner accents */}
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-accent-500/20" />
          <h3 className="text-sm font-police-body font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">ACESSOS TÁTICOS</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {exams.reduce((sum, exam) => sum + (exam.statistics?.total_attempts || 0), 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-l-4 border-l-accent-500 hover:shadow-xl transition-all duration-300 relative p-6 rounded-lg">
          {/* Corner accents */}
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-accent-500/20" />
          <h3 className="text-sm font-police-body font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">ENGAJAMENTOS</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {exams.reduce((sum, exam) => sum + (exam.statistics?.total_attempts || 0), 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="BUSCAR OPERAÇÕES TÁTICAS..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body placeholder:font-police-body placeholder:uppercase placeholder:tracking-wider focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/admin/previous-exams/import')}
            className="bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black dark:text-black font-police-body font-semibold uppercase tracking-wider py-2 px-4 rounded-md transition-colors"
          >
            IMPORTAR ARQUIVO
          </button>
          <button
            onClick={() => navigate('/admin/previous-exams/new')}
            className="bg-gray-800 hover:bg-gray-700 text-white font-police-body font-semibold uppercase tracking-wider py-2 px-4 rounded-md transition-colors"
          >
            NOVA OPERAÇÃO
          </button>
        </div>
      </div>

      {/* Exams Table */}
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-l-4 border-l-accent-500 hover:shadow-xl transition-all duration-300 relative rounded-lg overflow-hidden">
        {/* Corner accents */}
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-accent-500/20" />
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-900 dark:to-black">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-police-subtitle font-semibold text-white uppercase tracking-wider">
                  OPERAÇÃO TÁTICA
                </th>
                <th className="px-6 py-3 text-left text-xs font-police-subtitle font-semibold text-white uppercase tracking-wider">
                  INSTITUIÇÃO
                </th>
                <th className="px-6 py-3 text-center text-xs font-police-subtitle font-semibold text-white uppercase tracking-wider">
                  PERÍODO
                </th>
                <th className="px-6 py-3 text-center text-xs font-police-subtitle font-semibold text-white uppercase tracking-wider">
                  ALVOS
                </th>
                <th className="px-6 py-3 text-center text-xs font-police-subtitle font-semibold text-white uppercase tracking-wider">
                  ARSENAL
                </th>
                <th className="px-6 py-3 text-center text-xs font-police-subtitle font-semibold text-white uppercase tracking-wider">
                  INTEL
                </th>
                <th className="px-6 py-3 text-right text-xs font-police-subtitle font-semibold text-white uppercase tracking-wider">
                  COMANDOS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-500"></div>
                      <span className="ml-3 text-gray-600 dark:text-gray-400 font-police-body uppercase tracking-wider">CARREGANDO ARQUIVO...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <p className="text-red-500 dark:text-red-400 font-police-body uppercase tracking-wider">{error}</p>
                    <button 
                      onClick={loadExams}
                      className="mt-2 bg-accent-500 hover:bg-accent-600 text-black dark:text-black text-sm font-police-body font-semibold uppercase tracking-wider py-1 px-3 rounded transition-colors"
                    >
                      TENTAR NOVAMENTE
                    </button>
                  </td>
                </tr>
              ) : (
                filteredExams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-accent-500/10 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-police-subtitle font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                          {exam.title}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 font-police-body">
                          {exam.organization}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-police-body font-semibold text-gray-900 dark:text-white uppercase tracking-wider">{exam.exam_board}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-police-numbers font-bold text-gray-900 dark:text-white">{exam.year}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-police-numbers font-bold text-gray-900 dark:text-white">{exam.total_questions}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2 text-xs">
                        <span className={exam.metadata?.pdf_url ? 'text-green-600' : 'text-gray-400'}>
                          PDF: {exam.metadata?.pdf_url ? '✓' : '✗'}
                        </span>
                        <span className={exam.metadata?.oficial_resolution ? 'text-green-600' : 'text-gray-400'}>
                          Gabarito: {exam.metadata?.oficial_resolution ? '✓' : '✗'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="text-xs font-police-body font-medium">
                        <div className="text-gray-600 dark:text-gray-400 uppercase tracking-wider">Tentativas: <span className="font-police-numbers font-bold text-gray-900 dark:text-white">{(exam.statistics?.total_attempts || 0).toLocaleString()}</span></div>
                        <div className="text-gray-600 dark:text-gray-400 uppercase tracking-wider">Aprovação: <span className="font-police-numbers font-bold text-gray-900 dark:text-white">{(exam.statistics?.approval_rate || 0).toFixed(1)}%</span></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/admin/previous-exams/${exam.id}/edit`)}
                          className="bg-accent-500 hover:bg-accent-600 text-black dark:text-black text-sm font-police-body font-semibold uppercase tracking-wider py-1 px-2 rounded transition-colors"
                        >
                          CONFIGURAR
                        </button>
                        <button 
                          onClick={() => {
                            if (exam.status === 'published') {
                              previousExamService.archive(exam.id).then(() => {
                                toast.success('Operação arquivada');
                                loadExams();
                              }).catch(() => {
                                toast.error('Erro ao arquivar operação');
                              });
                            }
                          }}
                          className="bg-gray-600 hover:bg-gray-700 text-white text-sm font-police-body font-semibold uppercase tracking-wider py-1 px-2 rounded transition-colors"
                        >
                          {exam.status === 'published' ? 'ARQUIVAR' : 'ARQUIVADO'}
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
            <p className="text-gray-500 dark:text-gray-400 font-police-body uppercase tracking-wider">NENHUMA OPERAÇÃO LOCALIZADA NO ARQUIVO</p>
          </div>
        )}
      </div>
    </div>
  );
}