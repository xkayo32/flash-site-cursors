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
}

const mockExams: MockExam[] = [
  {
    id: 1,
    title: 'SIMULAÇÃO TÁTICA PF - AGENTE',
    organization: 'COMANDO PF',
    totalQuestions: 120,
    timeLimitMinutes: 240,
    difficulty: 'SARGENTO',
    isActive: true
  },
  {
    id: 2,
    title: 'SIMULAÇÃO TÁTICA PRF - POLICIAL',
    organization: 'COMANDO PRF',
    totalQuestions: 120,
    timeLimitMinutes: 240,
    difficulty: 'SARGENTO',
    isActive: true
  },
  {
    id: 3,
    title: 'SIMULAÇÃO TÁTICA PC - ESCRIVÃO',
    organization: 'COMANDO PC SP',
    totalQuestions: 100,
    timeLimitMinutes: 180,
    difficulty: 'CABO',
    isActive: true
  }
];

export default function MockExamsPageSimple() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredExams = mockExams.filter(exam =>
    exam.title.toLowerCase().includes(searchTerm.toLowerCase())
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
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-police-title uppercase tracking-ultra-wide">
            ARSENAL DE SIMULAÇÕES TÁTICAS
          </h1>
          <p className="text-gray-600 dark:text-gray-300 font-police-body tracking-wider">
            TESTE SUAS HABILIDADES COM SIMULAÇÕES COMPLETAS DE OPERAÇÕES TÁTICAS
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <input
            type="text"
            placeholder="BUSCAR SIMULAÇÕES..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 dark:border-accent-500/50 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-police-body uppercase tracking-wider hover:border-accent-500 transition-colors"
          />
        </div>
      </div>

      {/* Simulados Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExams.map((exam) => (
          <div
            key={exam.id}
            className="border-2 border-transparent hover:border-accent-500/50 transition-all duration-300 bg-white dark:bg-gray-900 shadow-lg hover:shadow-xl rounded-lg relative overflow-hidden"
          >
            {/* Tactical stripe */}
            <div className="absolute top-0 right-0 w-1 h-full bg-accent-500" />
            
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 font-police-title uppercase tracking-wider">
                {exam.title}
              </h3>
              
              <div className="space-y-2 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-police-subtitle uppercase tracking-ultra-wide text-gray-600 dark:text-accent-500">COMANDO:</span>
                  <span className="text-sm font-police-body text-gray-900 dark:text-white">{exam.organization}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-police-subtitle uppercase tracking-ultra-wide text-gray-600 dark:text-accent-500">ALVOS:</span>
                  <span className="text-sm font-police-numbers font-bold text-gray-900 dark:text-white">{exam.totalQuestions}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-police-subtitle uppercase tracking-ultra-wide text-gray-600 dark:text-accent-500">TEMPO:</span>
                  <span className="text-sm font-police-numbers font-bold text-gray-900 dark:text-white">{exam.timeLimitMinutes} min</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-police-subtitle uppercase tracking-ultra-wide text-gray-600 dark:text-accent-500">NÍVEL:</span>
                  <span className="text-sm font-police-body font-bold text-accent-500">{exam.difficulty}</span>
                </div>
              </div>

              <button
                onClick={() => navigate(`/simulations/${exam.id}/take`)}
                className="w-full bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-semibold uppercase tracking-wider py-2 px-4 rounded-lg transition-all duration-300 hover:scale-105"
              >
                INICIAR SIMULAÇÃO
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredExams.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 rounded-lg p-8">
            <p className="text-gray-600 dark:text-gray-400 font-police-body uppercase tracking-wider">NENHUMA SIMULAÇÃO LOCALIZADA</p>
          </div>
        </div>
      )}
    </div>
  );
}