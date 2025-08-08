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
  Link2,
  HelpCircle,
  Download
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';
import RichTextEditor from '@/components/RichTextEditor';
import toast from 'react-hot-toast';

// Dados táticos para cursos/disciplinas
const materias = [
  { value: 'DIREITO', label: 'ÁREA JURÍDICA' },
  { value: 'SEGURANÇA PÚBLICA', label: 'ÁREA OPERACIONAL' },
  { value: 'CONHECIMENTOS GERAIS', label: 'ÁREA ESTRATÉGICA' }
];

const submaterias = {
  'DIREITO': [
    { value: 'Direito Constitucional', label: 'LEGISLAÇÃO CONSTITUCIONAL TÁTICA' },
    { value: 'Direito Penal', label: 'CÓDIGO PENAL OPERACIONAL' },
    { value: 'Direito Administrativo', label: 'NORMAS ADMINISTRATIVAS' },
    { value: 'Direito Processual Penal', label: 'PROCEDIMENTOS PENAIS TÁTICOS' }
  ],
  'SEGURANÇA PÚBLICA': [
    { value: 'Inteligência Policial', label: 'INTELIGÊNCIA TÁTICA' },
    { value: 'Táticas Operacionais', label: 'OPERAÇÕES ESPECIAIS' },
    { value: 'Legislação Especial', label: 'LEGISLAÇÃO OPERACIONAL' },
    { value: 'Criminologia', label: 'ANÁLISE CRIMINAL TÁTICA' }
  ],
  'CONHECIMENTOS GERAIS': [
    { value: 'Português', label: 'COMUNICAÇÃO OPERACIONAL' },
    { value: 'Matemática', label: 'CÁLCULOS TÁTICOS' },
    { value: 'História', label: 'HISTÓRIA ESTRATÉGICA' },
    { value: 'Geografia', label: 'GEOGRAFIA TÁTICA' }
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
  const [showImportHelp, setShowImportHelp] = useState(false);
  
  // Temporary inputs
  const [newTag, setNewTag] = useState('');

  // Download example file
  const downloadExampleFile = () => {
    const exampleContent = `# Exemplo de Resumo Tático - Direito Constitucional

## Princípios Fundamentais da Constituição

### 1. Princípio da Dignidade da Pessoa Humana

A dignidade da pessoa humana é o **fundamento** da República Federativa do Brasil, conforme art. 1º, III da CF/88.

**Características:**
- Valor absoluto e inalienável
- Base de todos os direitos fundamentais
- Princípio matriz do sistema constitucional

### 2. Princípio da Supremacia da Constituição

A Constituição é a *lei fundamental* do Estado, ocupando o topo da hierarquia normativa.

**Consequências:**
- Todas as leis devem estar em conformidade com a CF
- Controle de constitucionalidade das normas
- Rigidez constitucional

## Lista de Direitos Fundamentais

* Direitos individuais e coletivos (art. 5º)
* Direitos sociais (art. 6º)
* Direitos de nacionalidade (art. 12)
* Direitos políticos (art. 14 a 16)

## Questões Importantes

1. **Como se manifesta o princípio da dignidade humana?**
   - Através dos direitos fundamentais
   - Na proteção dos direitos da personalidade
   - No respeito à autonomia individual

2. **Qual a importância da supremacia constitucional?**
   - Garante a estabilidade jurídica
   - Protege os direitos fundamentais
   - Limita o poder estatal

---

*Este é um exemplo de conteúdo que pode ser importado. Você pode usar formatação Markdown, HTML ou texto simples.*`;

    const blob = new Blob([exampleContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'exemplo_resumo_tatico.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('BRIEFING DE EXEMPLO TRANSFERIDO: Use como base para seus resumos táticos', { icon: '🎯' });
  };

  // Handle file import
  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Show loading state
    setIsLoading(true);
    toast.loading('PROCESSANDO BRIEFING TÁTICO...', { id: 'import' });
    
    const allowedTypes = [
      'text/plain',
      'text/html',
      'text/markdown',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/pdf'
    ];
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('ARQUIVO EXCEDE LIMITE TÁTICO: Máximo 5MB', { id: 'import' });
      setIsLoading(false);
      return;
    }
    
    if (!allowedTypes.includes(file.type)) {
      toast.error(`FORMATO NÃO AUTORIZADO: ${file.type}. Use TXT, HTML, MD, DOC, DOCX ou PDF`, { id: 'import' });
      setIsLoading(false);
      return;
    }
    
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const content = event.target?.result as string;
          
          // Process different file types
          let htmlContent = '';
          if (file.type === 'text/html') {
            // Clean HTML content
            htmlContent = content
              .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
              .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '') // Remove styles
              .replace(/<!--[\s\S]*?-->/g, ''); // Remove comments
          } else if (file.type === 'text/plain') {
            // Convert plain text to HTML with better formatting
            htmlContent = content
              .trim()
              .split(/\n\s*\n/) // Split by double line breaks
              .filter(paragraph => paragraph.trim()) // Remove empty paragraphs
              .map(paragraph => {
                // Handle lists
                if (paragraph.match(/^\s*[-*+]\s/gm)) {
                  const items = paragraph.split('\n').map(line => line.replace(/^\s*[-*+]\s/, '').trim()).filter(Boolean);
                  return `<ul>${items.map(item => `<li>${item}</li>`).join('')}</ul>`;
                }
                // Handle numbered lists
                if (paragraph.match(/^\s*\d+\.\s/gm)) {
                  const items = paragraph.split('\n').map(line => line.replace(/^\s*\d+\.\s/, '').trim()).filter(Boolean);
                  return `<ol>${items.map(item => `<li>${item}</li>`).join('')}</ol>`;
                }
                // Handle headings
                if (paragraph.startsWith('# ')) {
                  return `<h1>${paragraph.substring(2)}</h1>`;
                }
                if (paragraph.startsWith('## ')) {
                  return `<h2>${paragraph.substring(3)}</h2>`;
                }
                if (paragraph.startsWith('### ')) {
                  return `<h3>${paragraph.substring(4)}</h3>`;
                }
                // Regular paragraph
                return `<p>${paragraph.replace(/\n/g, '<br>')}</p>`;
              })
              .join('');
          } else if (file.type === 'text/markdown') {
            // Basic markdown parsing
            htmlContent = content
              .trim()
              // Headers
              .replace(/^### (.*$)/gim, '<h3>$1</h3>')
              .replace(/^## (.*$)/gim, '<h2>$1</h2>')
              .replace(/^# (.*$)/gim, '<h1>$1</h1>')
              // Bold
              .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
              .replace(/__(.*?)__/gim, '<strong>$1</strong>')
              // Italic
              .replace(/\*(.*)\*/gim, '<em>$1</em>')
              .replace(/_(.*?)_/gim, '<em>$1</em>')
              // Links
              .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2">$1</a>')
              // Lists
              .replace(/^\* (.+)/gim, '<li>$1</li>')
              .replace(/(<li>.*<\/li>)/gims, '<ul>$1</ul>')
              // Paragraphs
              .split(/\n\s*\n/)
              .filter(p => p.trim())
              .map(p => p.startsWith('<') ? p : `<p>${p.replace(/\n/g, '<br>')}</p>`)
              .join('');
          } else {
            toast.error('PROCESSAMENTO TÁTICO PARA ESTE FORMATO EM DESENVOLVIMENTO', { id: 'import' });
            setIsLoading(false);
            return;
          }
          
          // Update content
          if (htmlContent.trim()) {
            setEditorContent(htmlContent);
            toast.success(`BRIEFING IMPORTADO: ${file.name} (${(file.size / 1024).toFixed(1)}KB)`, { id: 'import', icon: '🎯' });
          } else {
            toast.error('ARQUIVO SEM CONTEÚDO OU NÃO PROCESSADO', { id: 'import' });
          }
          
        } catch (error) {
          console.error('Error processing file:', error);
          toast.error('FALHA NO PROCESSAMENTO DO BRIEFING', { id: 'import' });
        } finally {
          setIsLoading(false);
        }
      };
      
      reader.onerror = () => {
        toast.error('Erro ao ler o arquivo', { id: 'import' });
        setIsLoading(false);
      };
      
      reader.readAsText(file, 'UTF-8');
      
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Erro ao importar arquivo', { id: 'import' });
      setIsLoading(false);
    }
    
    // Clear file input
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
    { id: 'editor', label: 'EDITOR TÁTICO', icon: Edit3 },
    { id: 'settings', label: 'CONFIG. OPERACIONAIS', icon: Settings }
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
      
      {/* Header Militar/Tático */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-gray-800 via-[#14242f] to-gray-900 dark:from-gray-900 dark:via-[#14242f] dark:to-black p-8 rounded-lg relative overflow-hidden mb-6"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,204,21,0.3) 1px, transparent 0)',
          backgroundSize: '20px 20px'
        }}
      >
        {/* Corner accents */}
        <div className="absolute top-0 right-0 w-20 h-20 border-t-4 border-r-4 border-accent-500/30" />
        <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-accent-500/20" />
        
        <div className="flex items-center justify-between mb-6 relative z-10">
          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/admin/summaries')}
              className="gap-2 font-police-body uppercase tracking-wider hover:bg-white/10 text-white hover:text-accent-500 border border-transparent hover:border-accent-500/30 transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5" />
              RETORNAR À BASE
            </Button>
            <div className="border-l-4 border-l-accent-500 pl-6">
              <h1 className="text-4xl font-bold text-white font-police-title uppercase tracking-wider">
                {isEditing ? 'MODIFICAR BRIEFING' : 'NOVO BRIEFING OPERACIONAL'}
              </h1>
              <p className="text-gray-300 font-police-subtitle uppercase tracking-wider mt-1">
                {isEditing ? 'Atualizar resumo tático existente' : 'Criar novo documento interativo de apoio'}
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.html,.md,.doc,.docx,.pdf"
              onChange={handleFileImport}
              className="hidden"
            />
            <Button
              variant="ghost"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="gap-2 font-police-body uppercase tracking-wider hover:bg-white/10 text-white hover:text-accent-500 border border-transparent hover:border-accent-500/30 transition-all duration-300 disabled:opacity-50"
              title="Importar arquivo tático (TXT, HTML, MD, DOC, DOCX, PDF)"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <FileUp className="w-5 h-5" />
              )}
              {isLoading ? 'PROCESSANDO...' : 'IMPORTAR BRIEFING'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowImportHelp(true)}
              className="p-2 hover:bg-white/10 text-white hover:text-accent-500 transition-all duration-300"
              title="Ajuda para importação tática"
            >
              <HelpCircle className="w-5 h-5" />
            </Button>
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

            {/* Main Editor - Full Width */}
            <RichTextEditor
              content={editorContent}
              onChange={setEditorContent}
              onSave={handleSave}
              placeholder="Comece a escrever seu briefing tático aqui..."
              isFullscreen={isFullscreen}
              onToggleFullscreen={toggleFullscreen}
            />

            {/* Classification and Settings - Horizontal Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Course/Subject Selection */}
              <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="font-police-title uppercase tracking-wider text-sm">
                    CLASSIFICAÇÃO DO BRIEFING
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 font-police-body uppercase tracking-wider">
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
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 font-police-body uppercase tracking-wider">
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
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 font-police-body uppercase tracking-wider">
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
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 font-police-body uppercase tracking-wider">
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
                  </div>
                </CardContent>
              </Card>

              {/* Embedded Elements Stats */}
              <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="font-police-title uppercase tracking-wider text-sm">
                    ELEMENTOS INCORPORADOS
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <Brain className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                      <div className="text-lg font-bold font-police-numbers text-gray-900 dark:text-white">0</div>
                      <div className="text-xs font-police-body text-gray-600 dark:text-gray-400 uppercase">QUESTÕES</div>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <Star className="w-6 h-6 text-yellow-600 mx-auto mb-1" />
                      <div className="text-lg font-bold font-police-numbers text-gray-900 dark:text-white">0</div>
                      <div className="text-xs font-police-body text-gray-600 dark:text-gray-400 uppercase">FLASHCARDS</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <Link2 className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                      <div className="text-lg font-bold font-police-numbers text-gray-900 dark:text-white">0</div>
                      <div className="text-xs font-police-body text-gray-600 dark:text-gray-400 uppercase">LINKS</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
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

      {/* Import Help Modal */}
      {showImportHelp && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowImportHelp(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full border-2 border-gray-200 dark:border-gray-700 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold font-police-title uppercase tracking-wider text-gray-900 dark:text-white">
                GUIA DE IMPORTAÇÃO
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowImportHelp(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold font-police-subtitle mb-3 text-gray-900 dark:text-white">
                  📁 FORMATOS SUPORTADOS
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="font-semibold text-blue-700 dark:text-blue-300">TXT (Texto)</div>
                    <div className="text-sm text-blue-600 dark:text-blue-400">Texto simples com formatação automática</div>
                  </div>
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="font-semibold text-green-700 dark:text-green-300">MD (Markdown)</div>
                    <div className="text-sm text-green-600 dark:text-green-400">Formatação avançada com # ## ### ** *</div>
                  </div>
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="font-semibold text-purple-700 dark:text-purple-300">HTML</div>
                    <div className="text-sm text-purple-600 dark:text-purple-400">Código HTML será limpo e processado</div>
                  </div>
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div className="font-semibold text-yellow-700 dark:text-yellow-300">DOC/DOCX</div>
                    <div className="text-sm text-yellow-600 dark:text-yellow-400">Em desenvolvimento</div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold font-police-subtitle mb-3 text-gray-900 dark:text-white">
                  ✨ FORMATAÇÃO AUTOMÁTICA
                </h4>
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg font-mono text-sm">
                  <div className="space-y-2">
                    <div><span className="text-blue-600"># Título Principal</span> → <strong>H1</strong></div>
                    <div><span className="text-blue-600">## Subtítulo</span> → <strong>H2</strong></div>
                    <div><span className="text-blue-600">**texto**</span> → <strong>Negrito</strong></div>
                    <div><span className="text-blue-600">*texto*</span> → <em>Itálico</em></div>
                    <div><span className="text-blue-600">- Item</span> → • Lista</div>
                    <div><span className="text-blue-600">1. Item</span> → 1. Lista numerada</div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold font-police-subtitle mb-3 text-gray-900 dark:text-white">
                  🚀 DICAS IMPORTANTES
                </h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <div className="font-semibold text-green-700 dark:text-green-300">Tamanho máximo: 5MB</div>
                      <div className="text-sm text-green-600 dark:text-green-400">Arquivos maiores serão rejeitados automaticamente</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <div className="font-semibold text-blue-700 dark:text-blue-300">Codificação UTF-8</div>
                      <div className="text-sm text-blue-600 dark:text-blue-400">Caracteres especiais e acentos são preservados</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <div>
                      <div className="font-semibold text-purple-700 dark:text-purple-300">Conteúdo seguro</div>
                      <div className="text-sm text-purple-600 dark:text-purple-400">Scripts e estilos são removidos automaticamente</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="outline"
                  onClick={downloadExampleFile}
                  className="gap-2 font-police-body"
                >
                  <Download className="w-4 h-4" />
                  BAIXAR EXEMPLO
                </Button>
                <Button
                  onClick={() => setShowImportHelp(false)}
                  className="gap-2 font-police-body font-semibold bg-accent-500 hover:bg-accent-600 dark:hover:bg-accent-650 text-black"
                >
                  ENTENDI
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}