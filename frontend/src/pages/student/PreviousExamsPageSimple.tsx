import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle, Search, Target } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { studentPreviousExamService, type PreviousExam as PreviousExamAPI } from '@/services/previousExamService';

interface PreviousExamDisplay {
  id: string;
  title: string;
  organization: string;
  examBoard: string;
  year: number;
  totalQuestions: number;
  difficulty: string;
}

export default function PreviousExamsPageSimple() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [previousExams, setPreviousExams] = useState<PreviousExamDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load previous exams from API
  useEffect(() => {
    loadPreviousExams();
  }, []);

  const loadPreviousExams = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await studentPreviousExamService.getAvailable({ limit: 50 });
      
      if (response && response.data) {
        // Transform API data to display format
        const transformedExams: PreviousExamDisplay[] = response.data.map((exam: PreviousExamAPI) => ({
          id: exam.id,
          title: `OPERAÇÃO ${exam.organization.toUpperCase().replace('POLÍCIA', '').trim()} - ${exam.position.toUpperCase()} ${exam.year}`,
          organization: `COMANDO ${exam.organization.toUpperCase().replace('POLÍCIA', '').trim()}`,
          examBoard: exam.exam_board.toUpperCase(),
          year: exam.year,
          totalQuestions: exam.total_questions,
          difficulty: 'SARGENTO' // Default difficulty - can be enhanced with API field
        }));
        
        setPreviousExams(transformedExams);
      } else {
        throw new Error('Falha ao carregar provas anteriores');
      }
    } catch (err: any) {
      console.error('Erro ao carregar provas anteriores:', err);
      setError(err.message || 'Erro ao carregar provas anteriores. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const filteredExams = previousExams.filter(exam =>
    exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exam.organization.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-police-title uppercase tracking-ultra-wide">
            ARQUIVO DE OPERAÇÕES PASSADAS
          </h1>
          <p className="text-gray-600 dark:text-gray-300 font-police-body tracking-wider">
            PRATIQUE COM QUESTÕES DE OPERAÇÕES REAIS DOS PRINCIPAIS COMANDOS
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="font-police-numbers border-accent-500 text-accent-500">
            {!loading && !error ? `${filteredExams.length} OPERAÇÕES DISPONÍVEIS` : 'CARREGANDO...'}
          </Badge>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-3"
      >
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="BUSCAR OPERAÇÕES..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={loading}
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-police-body uppercase tracking-wider hover:border-accent-500 focus:border-accent-500 transition-colors disabled:opacity-50"
          />
        </div>
      </motion.div>

      {/* Loading State */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-center py-12"
        >
          <Card className="bg-white/90 dark:bg-gray-900/90 border-2 border-gray-200 dark:border-gray-800 p-8 relative overflow-hidden backdrop-blur-sm">
            <div className="absolute top-0 right-0 w-1 h-full bg-accent-500" />
            <div className="flex items-center gap-3">
              <Loader2 className="w-6 h-6 text-accent-500 animate-spin" />
              <p className="text-gray-600 dark:text-gray-400 font-police-body uppercase tracking-wider">
                CARREGANDO ARQUIVO DE OPERAÇÕES...
              </p>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-center py-12"
        >
          <Card className="bg-white/90 dark:bg-gray-900/90 border-2 border-red-200 dark:border-red-800 p-8 relative overflow-hidden backdrop-blur-sm">
            <div className="absolute top-0 right-0 w-1 h-full bg-red-500" />
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 dark:text-red-400 font-police-body uppercase tracking-wider mb-4">
                {error}
              </p>
              <Button
                onClick={loadPreviousExams}
                variant="outline"
                className="font-police-body uppercase tracking-wider hover:border-accent-500 hover:text-accent-500"
              >
                TENTAR NOVAMENTE
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Provas Grid */}
      {!loading && !error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {filteredExams.map((exam, index) => (
            <motion.div
              key={exam.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="border-2 border-transparent hover:border-accent-500/50 transition-all duration-300 bg-white/90 dark:bg-gray-900/90 shadow-lg hover:shadow-xl rounded-lg relative overflow-hidden backdrop-blur-sm group"
            >
              {/* Tactical stripe */}
              <div className="absolute top-0 right-0 w-1 h-full bg-accent-500" />
              
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 font-police-title uppercase tracking-wider group-hover:text-accent-500 transition-colors">
                  {exam.title}
                </h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="text-xs font-police-subtitle uppercase tracking-ultra-wide text-gray-600 dark:text-gray-400">COMANDO:</span>
                    <span className="text-sm font-police-body text-gray-900 dark:text-white">{exam.organization}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="text-xs font-police-subtitle uppercase tracking-ultra-wide text-gray-600 dark:text-gray-400">BANCA:</span>
                    <span className="text-sm font-police-body text-gray-900 dark:text-white">{exam.examBoard}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="text-xs font-police-subtitle uppercase tracking-ultra-wide text-gray-600 dark:text-gray-400">ANO:</span>
                    <span className="text-sm font-police-numbers font-bold text-gray-900 dark:text-white">{exam.year}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-accent-500" />
                      <span className="text-xs font-police-subtitle uppercase tracking-ultra-wide text-gray-600 dark:text-gray-400">ALVOS:</span>
                    </div>
                    <span className="text-sm font-police-numbers font-bold text-gray-900 dark:text-white">{exam.totalQuestions}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="text-xs font-police-subtitle uppercase tracking-ultra-wide text-gray-600 dark:text-gray-400">NÍVEL:</span>
                    <Badge variant="secondary" className="font-police-subtitle tracking-wider border-2 border-current text-accent-500">
                      {exam.difficulty}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button
                    onClick={() => navigate(`/previous-exams/${exam.id}/practice`)}
                    className="w-full bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-semibold uppercase tracking-wider gap-2 transition-all duration-300 hover:scale-105"
                  >
                    EXECUTAR OPERAÇÃO
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/previous-exams/${exam.id}/view`)}
                    className="w-full font-police-body uppercase tracking-wider gap-2 hover:border-accent-500 hover:text-accent-500"
                  >
                    ANALISAR INTEL
                  </Button>
                </div>
              </CardContent>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredExams.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Card className="bg-white/90 dark:bg-gray-900/90 border-2 border-gray-200 dark:border-gray-800 p-8 relative overflow-hidden backdrop-blur-sm">
            <div className="absolute top-0 right-0 w-1 h-full bg-amber-500" />
            <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 font-police-body uppercase tracking-wider">
              NENHUMA OPERAÇÃO LOCALIZADA COM OS FILTROS APLICADOS
            </p>
            <Button 
              variant="outline" 
              onClick={() => setSearchTerm('')}
              className="mt-4 font-police-body uppercase tracking-wider hover:border-accent-500 hover:text-accent-500"
            >
              LIMPAR FILTROS
            </Button>
          </Card>
        </motion.div>
      )}
    </div>
  );
}