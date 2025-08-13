import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  FileText,
  Upload,
  Link2,
  Eye,
  AlertCircle,
  CheckCircle,
  Scale,
  Gavel,
  FileCheck,
  Book,
  Target,
  Shield,
  Calendar,
  Tag,
  Building
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import toast from 'react-hot-toast';

// Submatérias por categoria
const subMaterias: { [key: string]: string[] } = {
  'Constitucional': ['Direitos Fundamentais', 'Organização do Estado', 'Organização dos Poderes', 'Defesa do Estado', 'Tributação', 'Ordem Econômica', 'Ordem Social'],
  'Administrativo': ['Licitações e Contratos', 'Servidores Públicos', 'Processo Administrativo', 'Responsabilidade Civil', 'Improbidade', 'Controle Interno', 'Transparência'],
  'Penal': ['Crimes Contra a Pessoa', 'Crimes Contra o Patrimônio', 'Crimes Contra a Administração', 'Violência Doméstica', 'Drogas', 'Lavagem de Dinheiro', 'Crimes Digitais'],
  'Tributário': ['Impostos Federais', 'Impostos Estaduais', 'Impostos Municipais', 'Contribuições', 'Processo Tributário', 'Execução Fiscal', 'Planejamento Tributário'],
  'Civil': ['Direito das Obrigações', 'Direito dos Contratos', 'Direito de Família', 'Direito das Sucessões', 'Direito Imobiliário', 'Responsabilidade Civil', 'Direito do Consumidor'],
  'Trabalhista': ['Direito Individual', 'Direito Coletivo', 'Processo Trabalhista', 'Segurança do Trabalho', 'Previdência Social', 'Terceirização', 'Sindical']
};

const categories = ['Constitucional', 'Administrativo', 'Penal', 'Tributário', 'Civil', 'Trabalhista'];
const types = ['constituicao', 'lei', 'decreto', 'medida_provisoria', 'sumula'];
const statuses = ['vigente', 'alterada', 'revogada'];

// Cursos táticos disponíveis para vinculação
const availableCourses = [
  'Polícia Federal - Agente Tático',
  'Receita Federal - Auditor Tático',
  'TRT/TRF - Analista Operacional',
  'TCU - Auditor de Controle',
  'CGU - Analista de Inteligência',
  'SEFAZ - Auditor Fiscal',
  'Polícia Civil - Investigador',
  'Defensoria Pública - Defensor'
];

export default function NewLegislation() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    number: '',
    type: 'lei',
    category: 'Administrativo',
    subMateria: '',
    status: 'vigente',
    publishDate: '',
    description: '',
    url: '',
    tags: '',
    content: '',
    linkedCourses: [] as string[]
  });

  const [isLoading, setIsLoading] = useState(false);

  const getTypeIcon = (type: string) => {
    const icons = {
      constituicao: Scale,
      lei: Gavel,
      decreto: FileCheck,
      medida_provisoria: FileText,
      sumula: Book
    };
    return icons[type as keyof typeof icons] || FileText;
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      constituicao: 'CONSTITUIÇÃO TÁTICA',
      lei: 'CÓDIGO OPERACIONAL',
      decreto: 'DECRETO TÁTICO',
      medida_provisoria: 'ORDEM PROVISÓRIA',
      sumula: 'MANUAL DE PROCEDIMENTOS'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Reset submatéria when category changes
    if (field === 'category') {
      setFormData(prev => ({ ...prev, subMateria: '' }));
    }
  };

  const toggleCourseLink = (course: string) => {
    setFormData(prev => ({
      ...prev,
      linkedCourses: prev.linkedCourses.includes(course)
        ? prev.linkedCourses.filter(c => c !== course)
        : [...prev.linkedCourses, course]
    }));
  };

  const handleImportPDF = () => {
    toast.success('IMPORTAÇÃO TÁTICA DE ARQUIVO ATIVADA', {
      duration: 3000,
      icon: '🎯'
    });
  };

  const handleImportURL = () => {
    const url = prompt('Digite a URL da legislação:');
    if (url) {
      setIsLoading(true);
      toast.loading('Importando conteúdo...', { id: 'import' });
      
      // Simular importação
      setTimeout(() => {
        setFormData(prev => ({ ...prev, content: 'Conteúdo importado da URL: ' + url }));
        toast.success('OPERAÇÃO CONCLUÍDA: Conteúdo importado com sucesso!', { id: 'import' });
        setIsLoading(false);
      }, 2000);
    }
  };

  const handleSave = () => {
    if (!formData.title || !formData.number || !formData.category) {
      toast.error('OPERAÇÃO FALHADA: Configure campos obrigatórios', {
        icon: '🚨'
      });
      return;
    }

    setIsLoading(true);
    toast.loading('PROCESSANDO CÓDIGO OPERACIONAL...', { id: 'save' });

    // Simular salvamento
    setTimeout(() => {
      toast.success('OPERAÇÃO CONCLUÍDA: Código registrado com sucesso!', { id: 'save' });
      setIsLoading(false);
      navigate('/admin/legislation');
    }, 2000);
  };

  const handlePreview = () => {
    toast.success('PREVIEW TÁTICO ATIVADO: Código disponível para visualização', {
      duration: 3000,
      icon: '🎯'
    });
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
      toast.success(`Avançando para etapa ${currentStep + 1}`, {
        duration: 2000,
        icon: '➡️'
      });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      toast.success(`Voltando para etapa ${currentStep - 1}`, {
        duration: 2000,
        icon: '⬅️'
      });
    }
  };

  const TypeIcon = getTypeIcon(formData.type);

  return (
    <div className="p-6 space-y-6">
      {/* Header Militar/Tático */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-gray-800 via-[#14242f] to-gray-900 dark:from-gray-900 dark:via-[#14242f] dark:to-black p-8 rounded-lg relative overflow-hidden"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,204,21,0.3) 1px, transparent 0)',
          backgroundSize: '20px 20px'
        }}
      >
        {/* Corner accents */}
        <div className="absolute top-0 right-0 w-20 h-20 border-t-4 border-r-4 border-accent-500/30" />
        <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-accent-500/20" />
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/admin/legislation')}
              className="gap-2 font-police-body uppercase tracking-wider hover:bg-white/10 text-white hover:text-accent-500 border border-transparent hover:border-accent-500/30 transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5" />
              RETORNAR À BASE
            </Button>
            <div className="border-l-4 border-l-accent-500 pl-6">
              <h1 className="text-4xl font-police-title font-bold uppercase tracking-wider text-white">
                NOVO CÓDIGO OPERACIONAL
              </h1>
              <p className="text-gray-300 font-police-subtitle uppercase tracking-wider mt-1">
                CADASTRO INTELIGENTE DE DOCUMENTOS TÁTICOS
              </p>
            </div>
          </div>
        
          <div className="flex flex-wrap items-center gap-4">
            <Button
              variant="ghost"
              onClick={handlePreview}
              className="gap-2 font-police-body uppercase tracking-wider hover:bg-white/10 text-white hover:text-accent-500 border border-transparent hover:border-accent-500/30 transition-all duration-300"
            >
              <Eye className="w-5 h-5" />
              PREVIEW TÁTICO
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="gap-2 bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-bold uppercase tracking-wider transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              <CheckCircle className="w-5 h-5" />
              {isLoading ? 'PROCESSANDO...' : 'CONFIRMAR OPERAÇÃO'}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Progress Steps */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-accent-500/30 shadow-xl relative overflow-hidden">
          {/* Tactical stripes */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-500 via-accent-400 to-accent-500" />
          <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-accent-500/20" />
          
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-police-numbers font-bold text-sm transition-colors ${
                      step <= currentStep
                        ? 'bg-accent-500 text-black'
                        : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {step <= currentStep ? <CheckCircle className="w-4 h-4" /> : step}
                  </div>
                  <div className="ml-3">
                    <p className={`font-police-subtitle font-semibold uppercase tracking-wider text-xs ${
                      step <= currentStep ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {step === 1 && 'IDENTIFICAÇÃO TÁTICA'}
                      {step === 2 && 'CONTEÚDO OPERACIONAL'}
                      {step === 3 && 'CONFIRMAÇÃO FINAL'}
                    </p>
                  </div>
                  {step < 3 && (
                    <div className={`flex-1 h-px mx-4 ${
                      step < currentStep ? 'bg-accent-500' : 'bg-gray-300 dark:bg-gray-700'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Form Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {currentStep === 1 && (
          <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-accent-500/30 shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
            {/* Tactical stripes */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-500 via-accent-400 to-accent-500" />
            <div className="absolute top-0 right-0 w-20 h-20 border-t-4 border-r-4 border-accent-500/20" />
            
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-b border-accent-500/30">
              <CardTitle className="flex items-center gap-3 font-police-title uppercase tracking-wider text-gray-900 dark:text-white">
                <Scale className="w-6 h-6 text-accent-500" />
                ETAPA 1: IDENTIFICAÇÃO TÁTICA
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                    TÍTULO DA LEGISLAÇÃO *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="EX: CÓDIGO DE PROCESSO CIVIL"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                    NÚMERO/IDENTIFICAÇÃO *
                  </label>
                  <input
                    type="text"
                    value={formData.number}
                    onChange={(e) => handleInputChange('number', e.target.value)}
                    placeholder="EX: LEI Nº 13.105/2015"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-numbers focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                    TIPO *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                  >
                    {types.map(type => (
                      <option key={type} value={type}>
                        {getTypeLabel(type).toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                    CATEGORIA *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                    SUBMATÉRIA
                  </label>
                  <select
                    value={formData.subMateria}
                    onChange={(e) => handleInputChange('subMateria', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                  >
                    <option value="">SELECIONE UMA SUBMATÉRIA</option>
                    {subMaterias[formData.category]?.map(subMateria => (
                      <option key={subMateria} value={subMateria}>
                        {subMateria.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                    STATUS *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                  >
                    {statuses.map(status => (
                      <option key={status} value={status}>
                        {status.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                    DATA DE PUBLICAÇÃO
                  </label>
                  <input
                    type="date"
                    value={formData.publishDate}
                    onChange={(e) => handleInputChange('publishDate', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-numbers focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                    URL OFICIAL (PLANALTO)
                  </label>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => handleInputChange('url', e.target.value)}
                    placeholder="HTTP://WWW.PLANALTO.GOV.BR/..."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                  DESCRIÇÃO
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="DESCREVA BREVEMENTE O CONTEÚDO DA LEGISLAÇÃO..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                  TAGS (SEPARADAS POR VÍRGULA)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => handleInputChange('tags', e.target.value)}
                  placeholder="EX: PROCESSO CIVIL, AUDIÊNCIAS, PETIÇÕES"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={nextStep}
                  className="gap-2 bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-semibold uppercase tracking-wider transition-colors"
                >
                  PRÓXIMA ETAPA
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            {/* Content Section */}
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
              <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                <CardTitle className="flex items-center gap-3 font-police-title uppercase tracking-wider text-gray-900 dark:text-white">
                  <FileText className="w-6 h-6 text-accent-500" />
                  CONTEÚDO DA LEGISLAÇÃO
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-yellow-800 dark:text-yellow-200 font-police-body">
                        IMPORTE O CONTEÚDO COMPLETO OU DIGITE MANUALMENTE. O SISTEMA PROCESSARÁ AUTOMATICAMENTE ARTIGOS E PARÁGRAFOS.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={handleImportPDF}
                    className="gap-2 font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600 hover:border-accent-500 dark:hover:border-accent-500 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    IMPORTAR PDF
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleImportURL}
                    className="gap-2 font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600 hover:border-accent-500 dark:hover:border-accent-500 transition-colors"
                  >
                    <Link2 className="w-4 h-4" />
                    IMPORTAR DA URL
                  </Button>
                </div>

                <div>
                  <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                    CONTEÚDO COMPLETO
                  </label>
                  <textarea
                    rows={15}
                    value={formData.content}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    placeholder="COLE OU DIGITE O CONTEÚDO COMPLETO DA LEGISLAÇÃO AQUI..."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Course Links Section */}
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
              <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                <CardTitle className="flex items-center gap-3 font-police-title uppercase tracking-wider text-gray-900 dark:text-white">
                  <Building className="w-6 h-6 text-accent-500" />
                  VÍNCULOS COM CURSOS
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 font-police-body">
                  SELECIONE OS CURSOS QUE DEVEM TER ACESSO A ESTA LEGISLAÇÃO.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {availableCourses.map((course) => (
                    <label
                      key={course}
                      className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                        formData.linkedCourses.includes(course)
                          ? 'border-accent-500 bg-accent-500/10 dark:bg-accent-500/20'
                          : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.linkedCourses.includes(course)}
                        onChange={() => toggleCourseLink(course)}
                        className="rounded border-gray-300 text-accent-500 focus:ring-accent-500"
                      />
                      <span className="text-sm font-police-body font-medium text-gray-900 dark:text-white uppercase tracking-wider">
                        {course.toUpperCase()}
                      </span>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={prevStep}
                className="gap-2 font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600 hover:border-accent-500 dark:hover:border-accent-500 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                ETAPA ANTERIOR
              </Button>
              <Button
                onClick={nextStep}
                className="gap-2 bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-semibold uppercase tracking-wider transition-colors"
              >
                REVISÃO FINAL
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </Button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700">
            <CardHeader className="border-b border-gray-200 dark:border-gray-700">
              <CardTitle className="flex items-center gap-3 font-police-title uppercase tracking-wider text-gray-900 dark:text-white">
                <CheckCircle className="w-6 h-6 text-accent-500" />
                ETAPA 3: REVISÃO E CONFIRMAÇÃO
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Summary Card */}
              <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center border-2 border-gray-300 dark:border-gray-700">
                    <TypeIcon className="w-6 h-6 text-gray-700 dark:text-accent-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-police-subtitle font-bold text-gray-900 dark:text-white mb-2">
                      {formData.title || 'TÍTULO NÃO INFORMADO'}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="font-police-body font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">NÚMERO</p>
                        <p className="font-police-numbers text-gray-900 dark:text-white">{formData.number || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="font-police-body font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">TIPO</p>
                        <p className="font-police-body text-gray-900 dark:text-white uppercase">{getTypeLabel(formData.type)}</p>
                      </div>
                      <div>
                        <p className="font-police-body font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">CATEGORIA</p>
                        <p className="font-police-body text-gray-900 dark:text-white uppercase">{formData.category}</p>
                      </div>
                      <div>
                        <p className="font-police-body font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">STATUS</p>
                        <Badge className="bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300 font-police-body font-semibold uppercase tracking-wider">
                          {formData.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    {formData.subMateria && (
                      <div className="mt-2">
                        <Badge variant="outline" className="border-gray-300 dark:border-gray-600 font-police-body font-semibold uppercase tracking-wider">
                          {formData.subMateria.toUpperCase()}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-police-subtitle font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-3">
                    INFORMAÇÕES GERAIS
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-police-body text-gray-600 dark:text-gray-400 uppercase tracking-wider">Data de Publicação:</span>
                      <span className="font-police-numbers text-gray-900 dark:text-white">{formData.publishDate || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-police-body text-gray-600 dark:text-gray-400 uppercase tracking-wider">Conteúdo:</span>
                      <span className="font-police-numbers text-gray-900 dark:text-white">
                        {formData.content ? `${formData.content.length} caracteres` : 'Não informado'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-police-body text-gray-600 dark:text-gray-400 uppercase tracking-wider">Tags:</span>
                      <span className="font-police-numbers text-gray-900 dark:text-white">
                        {formData.tags ? formData.tags.split(',').length : 0} tags
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-police-subtitle font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-3">
                    CURSOS VINCULADOS
                  </h4>
                  <div className="space-y-2">
                    {formData.linkedCourses.length > 0 ? (
                      formData.linkedCourses.map((course) => (
                        <div key={course} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-accent-500" />
                          <span className="text-sm font-police-body text-gray-900 dark:text-white uppercase tracking-wider">
                            {course.toUpperCase()}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm font-police-body text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        NENHUM CURSO VINCULADO
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  className="gap-2 font-police-body uppercase tracking-wider border-gray-300 dark:border-gray-600 hover:border-accent-500 dark:hover:border-accent-500 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  ETAPA ANTERIOR
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="gap-2 bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black font-police-body font-semibold uppercase tracking-wider transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isLoading ? 'SALVANDO...' : 'CONFIRMAR E SALVAR'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
}