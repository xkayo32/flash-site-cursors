import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Eye,
  Edit3,
  Plus,
  X,
  FileUp,
  Settings,
  Maximize2,
  Minimize2,
  Brain,
  Star,
  Link2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';
import RichTextEditor from '@/components/RichTextEditor';
import toast from 'react-hot-toast';

// Mock data for courses/subjects
const materias = [
  { value: 'DIREITO', label: 'DIREITO' },
  { value: 'SEGURANÇA PÚBLICA', label: 'SEGURANÇA PÚBLICA' },
  { value: 'CONHECIMENTOS GERAIS', label: 'CONHECIMENTOS GERAIS' }
];

const submaterias = {
  'DIREITO': [
    { value: 'Direito Constitucional', label: 'DIREITO CONSTITUCIONAL' },
    { value: 'Direito Penal', label: 'DIREITO PENAL' },
    { value: 'Direito Administrativo', label: 'DIREITO ADMINISTRATIVO' },
    { value: 'Direito Processual Penal', label: 'DIREITO PROCESSUAL PENAL' }
  ],
  'SEGURANÇA PÚBLICA': [
    { value: 'Inteligência Policial', label: 'INTELIGÊNCIA POLICIAL' },
    { value: 'Táticas Operacionais', label: 'TÁTICAS OPERACIONAIS' },
    { value: 'Legislação Especial', label: 'LEGISLAÇÃO ESPECIAL' },
    { value: 'Criminologia', label: 'CRIMINOLOGIA' }
  ],
  'CONHECIMENTOS GERAIS': [
    { value: 'Português', label: 'PORTUGUÊS' },
    { value: 'Matemática', label: 'MATEMÁTICA' },
    { value: 'História', label: 'HISTÓRIA' },
    { value: 'Geografia', label: 'GEOGRAFIA' }
  ]
};

export default function SummaryForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id && id !== 'new');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    materia: '',
    submateria: '',
    topico: '',
    course: '',
    status: 'draft',
    visibility: 'private',
    tags: [] as string[]
  });
  
  const [editorContent, setEditorContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'settings'>('editor');
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Temporary inputs
  const [newTag, setNewTag] = useState('');


  // Handle file import
  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const allowedTypes = [
      'text/plain',
      'text/html',
      'text/markdown',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/pdf'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      toast.error('Formato de arquivo não suportado');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      
      // Process different file types
      let htmlContent = '';
      if (file.type === 'text/html') {
        htmlContent = content;
      } else if (file.type === 'text/plain' || file.type === 'text/markdown') {
        // Convert plain text to HTML
        htmlContent = content
          .split('\n\n')
          .map(paragraph => `<p>${paragraph}</p>`)
          .join('');
      } else {
        toast.error('Processamento para este tipo de arquivo ainda não implementado');
        return;
      }
      
      // Update content
      setEditorContent(htmlContent);
      toast.success(`Arquivo ${file.name} importado com sucesso!`);
    };
    
    reader.readAsText(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle form input changes
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle tags
  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      handleInputChange('tags', [...formData.tags, newTag.trim().toUpperCase()]);
      setNewTag('');
    }
  };

  const removeTag = (index: number) => {
    handleInputChange('tags', formData.tags.filter((_, i) => i !== index));
  };

  // Save summary
  const handleSave = async () => {
    if (!formData.title || !formData.materia || !formData.submateria) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }
    
    if (!editorContent || editorContent.trim() === '') {
      toast.error('O conteúdo do resumo não pode estar vazio');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success(isEditing ? 'Resumo atualizado com sucesso!' : 'Resumo criado com sucesso!');
      navigate('/admin/summaries');
      
    } catch (error) {
      toast.error('Erro ao salvar resumo');
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'editor', label: 'EDITOR', icon: Edit3 },
    { id: 'settings', label: 'CONFIGURAÇÕES', icon: Settings }
  ];

  // Handle fullscreen
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className={cn(
      "p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen",
      isFullscreen && "fixed inset-0 z-50 overflow-auto"
    )}>
      {/* Background Pattern */}
      <div 
        className="fixed inset-0 opacity-5 dark:opacity-10 pointer-events-none z-0"
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
        className="relative z-10"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/admin/summaries')}
              className="gap-2 font-police-body"
            >
              <ArrowLeft className="w-4 h-4" />
              VOLTAR
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-police-title uppercase tracking-ultra-wide">
                {isEditing ? 'EDITAR BRIEFING' : 'NOVO BRIEFING TÁTICO'}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 font-police-body tracking-wider">
                {isEditing ? 'Modificar resumo operacional existente' : 'Criar novo resumo interativo para estudo'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={toggleFullscreen}
              className="gap-2 font-police-body"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              {isFullscreen ? 'SAIR TELA CHEIA' : 'TELA CHEIA'}
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="gap-2 font-police-body font-semibold bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black px-8"
            >
              <Save className="w-4 h-4" />
              {isLoading ? 'SALVANDO...' : (isEditing ? 'ATUALIZAR' : 'CRIAR')}
            </Button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-200 dark:bg-gray-800 p-1 rounded-lg">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md font-police-subtitle font-semibold text-sm uppercase tracking-wider transition-all duration-200',
                  activeTab === tab.id
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="relative z-10"
      >
        {activeTab === 'editor' && (
          <div className="space-y-6">
            {/* Title Input */}
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
              <CardContent className="p-4">
                <input
                  type="text"
                  placeholder="TÍTULO DO BRIEFING"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-4 py-3 text-2xl font-bold border-0 border-b-2 border-gray-200 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white font-police-title uppercase tracking-wider focus:outline-none focus:border-accent-500 placeholder:text-gray-400"
                />
              </CardContent>
            </Card>

            {/* File Import */}
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt,.html,.md,.doc,.docx,.pdf"
                    onChange={handleFileImport}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="gap-2 font-police-body"
                  >
                    <FileUp className="w-4 h-4" />
                    IMPORTAR ARQUIVO
                  </Button>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-police-body">
                    Suporta: TXT, HTML, MD, DOC, DOCX, PDF
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Main Editor */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <RichTextEditor
                  content={editorContent}
                  onChange={setEditorContent}
                  onSave={handleSave}
                  placeholder="Comece a escrever seu briefing tático aqui..."
                  isFullscreen={isFullscreen}
                  onToggleFullscreen={toggleFullscreen}
                />
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                {/* Course/Subject Selection */}
                <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="font-police-title uppercase tracking-wider text-base">
                      CLASSIFICAÇÃO DO BRIEFING
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-body uppercase tracking-wider">
                        MATÉRIA *
                      </label>
                      <select
                        value={formData.materia}
                        onChange={(e) => {
                          handleInputChange('materia', e.target.value);
                          handleInputChange('submateria', '');
                        }}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body"
                      >
                        <option value="">Selecione uma matéria</option>
                        {materias.map(materia => (
                          <option key={materia.value} value={materia.value}>{materia.label}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-body uppercase tracking-wider">
                        SUBMATÉRIA *
                      </label>
                      <select
                        value={formData.submateria}
                        onChange={(e) => handleInputChange('submateria', e.target.value)}
                        disabled={!formData.materia}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body disabled:opacity-50"
                      >
                        <option value="">Selecione uma submatéria</option>
                        {formData.materia && submaterias[formData.materia as keyof typeof submaterias]?.map(sub => (
                          <option key={sub.value} value={sub.value}>{sub.label}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-body uppercase tracking-wider">
                        TÓPICO
                      </label>
                      <input
                        type="text"
                        value={formData.topico}
                        onChange={(e) => handleInputChange('topico', e.target.value)}
                        placeholder="Ex: Princípios Fundamentais"
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-body uppercase tracking-wider">
                        CURSO RELACIONADO
                      </label>
                      <select
                        value={formData.course}
                        onChange={(e) => handleInputChange('course', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body"
                      >
                        <option value="">Selecione um curso</option>
                        <option value="pf-agente">POLÍCIA FEDERAL - AGENTE</option>
                        <option value="pf-delegado">POLÍCIA FEDERAL - DELEGADO</option>
                        <option value="prf">POLÍCIA RODOVIÁRIA FEDERAL</option>
                        <option value="pc-delegado">POLÍCIA CIVIL - DELEGADO</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>

                {/* Embedded Elements */}
                <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="font-police-title uppercase tracking-wider text-base">
                      ELEMENTOS INCORPORADOS
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Brain className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-police-body">QUESTÕES</span>
                      </div>
                      <span className="text-sm font-bold font-police-numbers">0</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-600" />
                        <span className="text-sm font-police-body">FLASHCARDS</span>
                      </div>
                      <span className="text-sm font-bold font-police-numbers">0</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Link2 className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-police-body">LINKS</span>
                      </div>
                      <span className="text-sm font-bold font-police-numbers">0</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="font-police-title uppercase tracking-wider">CONFIGURAÇÕES DE PUBLICAÇÃO</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-body uppercase tracking-wider">
                    STATUS
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body"
                  >
                    <option value="draft">EM PREPARAÇÃO</option>
                    <option value="review">EM REVISÃO</option>
                    <option value="published">OPERACIONAL</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 font-police-body uppercase tracking-wider">
                    VISIBILIDADE
                  </label>
                  <select
                    value={formData.visibility}
                    onChange={(e) => handleInputChange('visibility', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body"
                  >
                    <option value="private">PRIVADO</option>
                    <option value="restricted">RESTRITO AO CURSO</option>
                    <option value="public">PÚBLICO</option>
                  </select>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="font-police-title uppercase tracking-wider">TAGS</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2 mb-4">
                  {formData.tags.map((tag, index) => (
                    <Badge 
                      key={index} 
                      className="bg-accent-500/20 text-accent-700 dark:text-accent-300 border border-accent-500/30 font-police-body"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(index)}
                        className="ml-2 text-accent-600 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:outline-none focus:ring-2 focus:ring-accent-500"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Digite uma tag..."
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  />
                  <Button size="sm" onClick={addTag} className="bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </motion.div>
    </div>
  );
}