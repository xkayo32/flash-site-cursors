import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Eye,
  Plus,
  Brain,
  CheckCircle,
  AlertCircle,
  Image as ImageIcon,
  BookOpen,
  Lock,
  Globe
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/store/authStore';
import { flashcardService, CreateFlashcardData, FlashcardType } from '@/services/flashcardService';
import ClozeEditor from '@/components/ClozeEditor';
import ImageUploader from '@/components/ImageUploader';
import toast from 'react-hot-toast';

export default function NewStudentFlashcard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  const [formData, setFormData] = useState<CreateFlashcardData>({
    type: 'basic',
    difficulty: 'medium',
    category: '',
    subcategory: '',
    tags: [],
    status: 'draft', // Por padrão, privado
    front: '',
    back: '',
    hint: '',
    extra: '',
    header: '',
    source: '',
    comments: '',
    images: []
  });

  // Validar formulário
  const validateForm = (): string[] => {
    const errors: string[] = [];
    
    if (!formData.category) errors.push('Categoria é obrigatória');
    if (!formData.front && formData.type !== 'image_occlusion') {
      errors.push('Frente do card é obrigatória');
    }
    if (!formData.back && formData.type !== 'cloze') {
      errors.push('Verso do card é obrigatório');
    }
    
    if (formData.type === 'multiple_choice') {
      if (!formData.options || formData.options.length < 2) {
        errors.push('Múltipla escolha requer pelo menos 2 opções');
      }
      if (!formData.correct_option) {
        errors.push('Selecione a opção correta');
      }
    }
    
    return errors;
  };

  // Salvar flashcard
  const handleSave = async () => {
    const errors = validateForm();
    if (errors.length > 0) {
      errors.forEach(err => toast.error(err));
      return;
    }
    
    setIsLoading(true);
    try {
      // Adicionar author_id
      const flashcardData = {
        ...formData,
        author_id: user?.id,
        author_name: user?.name,
        tags: typeof formData.tags === 'string' 
          ? formData.tags.split(',').map(t => t.trim()).filter(t => t)
          : formData.tags
      };
      
      await flashcardService.createFlashcard(flashcardData);
      toast.success('Flashcard criado com sucesso!');
      navigate('/student/my-flashcards');
    } catch (error) {
      console.error('Erro ao criar flashcard:', error);
      toast.error('Erro ao criar flashcard');
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar exemplo
  const loadExample = () => {
    const examples: Record<FlashcardType, Partial<CreateFlashcardData>> = {
      basic: {
        front: 'Qual é a capital do Brasil?',
        back: 'Brasília',
        hint: 'Cidade planejada',
        category: 'Geografia',
        tags: ['capitais', 'brasil']
      },
      basic_reversed: {
        front: 'Brasília',
        back: 'Capital do Brasil',
        extra: 'Inaugurada em 1960 por Juscelino Kubitschek',
        category: 'Geografia',
        tags: ['capitais', 'brasil']
      },
      cloze: {
        front: 'A capital do Brasil é {{c1::Brasília}}, inaugurada em {{c2::1960}}',
        back: 'Informações extras sobre Brasília',
        category: 'Geografia',
        tags: ['capitais', 'brasil', 'história']
      },
      multiple_choice: {
        question: 'Qual é a capital do Brasil?',
        options: ['Rio de Janeiro', 'São Paulo', 'Brasília', 'Salvador'],
        correct_option: 'Brasília',
        explanation: 'Brasília é a capital federal do Brasil desde 1960',
        category: 'Geografia',
        tags: ['capitais', 'brasil']
      },
      true_false: {
        statement: 'Brasília é a capital do Brasil',
        is_true: true,
        explanation: 'Brasília é a capital federal desde 1960',
        category: 'Geografia',
        tags: ['capitais', 'brasil']
      },
      type_answer: {
        question: 'Digite o nome da capital do Brasil',
        answer: 'Brasília',
        hint: 'Cidade planejada por Oscar Niemeyer',
        category: 'Geografia',
        tags: ['capitais', 'brasil']
      },
      image_occlusion: {
        category: 'Geografia',
        tags: ['mapas', 'brasil']
      }
    };
    
    setFormData(prev => ({
      ...prev,
      ...examples[formData.type]
    }));
    
    toast.success('Exemplo carregado!');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-gray-800 via-[#14242f] to-gray-900 p-8 rounded-lg relative overflow-hidden"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,204,21,0.3) 1px, transparent 0)',
          backgroundSize: '20px 20px'
        }}
      >
        <div className="absolute top-0 right-0 w-20 h-20 border-t-4 border-r-4 border-accent-500/30" />
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/student/my-flashcards')}
              className="gap-2 font-police-body uppercase tracking-wider hover:bg-white/10 text-white hover:text-accent-500"
            >
              <ArrowLeft className="w-5 h-5" />
              VOLTAR
            </Button>
            <div className="border-l-4 border-l-accent-500 pl-6">
              <h1 className="text-4xl font-police-title font-bold uppercase tracking-wider text-white">
                NOVO FLASHCARD PESSOAL
              </h1>
              <p className="text-gray-300 font-police-subtitle uppercase tracking-wider mt-1">
                OPERADOR: {user?.name}
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button
              onClick={loadExample}
              variant="outline"
              className="gap-2 text-white border-white/20 hover:bg-white/10 font-police-subtitle uppercase tracking-wider"
            >
              <BookOpen className="w-5 h-5" />
              CARREGAR EXEMPLO
            </Button>
            <Button
              onClick={() => setShowPreview(!showPreview)}
              variant="outline"
              className="gap-2 text-white border-white/20 hover:bg-white/10 font-police-subtitle uppercase tracking-wider"
            >
              <Eye className="w-5 h-5" />
              {showPreview ? 'OCULTAR' : 'PREVIEW'}
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulário */}
        <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-b border-accent-500/30">
            <CardTitle className="flex items-center gap-3 font-police-title uppercase tracking-wider text-gray-900 dark:text-white">
              <Brain className="w-6 h-6 text-accent-500" />
              INFORMAÇÕES DO FLASHCARD
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-6 space-y-4">
            {/* Tipo de Flashcard */}
            <div>
              <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                TIPO DE FLASHCARD *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as FlashcardType }))}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500"
              >
                <option value="basic">🔵 BÁSICO (Frente/Verso)</option>
                <option value="basic_reversed">🟢 BÁSICO INVERTIDO</option>
                <option value="cloze">🟡 LACUNAS (Cloze)</option>
                <option value="multiple_choice">🟣 MÚLTIPLA ESCOLHA</option>
                <option value="true_false">🔴 VERDADEIRO/FALSO</option>
                <option value="type_answer">🟦 DIGITE RESPOSTA</option>
                <option value="image_occlusion">🟠 OCLUSÃO DE IMAGEM</option>
              </select>
            </div>

            {/* Categoria */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                  CATEGORIA *
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="Ex: Geografia"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                  SUBCATEGORIA
                </label>
                <input
                  type="text"
                  value={formData.subcategory}
                  onChange={(e) => setFormData(prev => ({ ...prev, subcategory: e.target.value }))}
                  placeholder="Ex: Capitais"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500"
                />
              </div>
            </div>

            {/* Conteúdo do Flashcard */}
            <div>
              <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                {formData.type === 'cloze' ? 'TEXTO COM LACUNAS *' : 'FRENTE DO CARD *'}
              </label>
              {formData.type === 'cloze' ? (
                <ClozeEditor
                  value={formData.front || ''}
                  onChange={(value) => setFormData(prev => ({ ...prev, front: value }))}
                  placeholder="Digite o texto e selecione palavras para ocultar..."
                  showPreview={true}
                />
              ) : (
                <textarea
                  value={formData.front}
                  onChange={(e) => setFormData(prev => ({ ...prev, front: e.target.value }))}
                  rows={3}
                  placeholder="Digite a pergunta ou conceito..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                {formData.type === 'cloze' ? 'EXPLICAÇÃO EXTRA' : 'VERSO DO CARD *'}
              </label>
              <textarea
                value={formData.back}
                onChange={(e) => setFormData(prev => ({ ...prev, back: e.target.value }))}
                rows={3}
                placeholder={formData.type === 'cloze' ? 'Informações extras (opcional)' : 'Digite a resposta...'}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500"
              />
            </div>

            {/* Dificuldade e Visibilidade */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                  DIFICULDADE
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value as any }))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500"
                >
                  <option value="easy">🟢 FÁCIL</option>
                  <option value="medium">🟡 MÉDIO</option>
                  <option value="hard">🔴 DIFÍCIL</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                  VISIBILIDADE
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500"
                >
                  <option value="draft">🔒 PRIVADO (Só você)</option>
                  <option value="published">🌍 PÚBLICO (Todos podem ver)</option>
                </select>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                TAGS (separadas por vírgula)
              </label>
              <input
                type="text"
                value={Array.isArray(formData.tags) ? formData.tags.join(', ') : formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="Ex: geografia, capitais, brasil"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500"
              />
            </div>

            {/* Campos Extras */}
            <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <h5 className="font-police-subtitle uppercase tracking-wider text-gray-700 dark:text-gray-300 text-sm font-semibold flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-accent-500" />
                CAMPOS EXTRAS (OPCIONAL)
              </h5>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-police-body font-medium text-gray-600 dark:text-gray-400 mb-1 uppercase tracking-wider">
                    DICA
                  </label>
                  <input
                    type="text"
                    value={formData.hint}
                    onChange={(e) => setFormData(prev => ({ ...prev, hint: e.target.value }))}
                    placeholder="Dica para ajudar"
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-police-body font-medium text-gray-600 dark:text-gray-400 mb-1 uppercase tracking-wider">
                    FONTE/REFERÊNCIA
                  </label>
                  <input
                    type="text"
                    value={formData.source}
                    onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
                    placeholder="Ex: Livro, página"
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-police-body font-medium text-gray-600 dark:text-gray-400 mb-1 uppercase tracking-wider">
                  NOTAS PRIVADAS
                </label>
                <textarea
                  value={formData.comments}
                  onChange={(e) => setFormData(prev => ({ ...prev, comments: e.target.value }))}
                  rows={2}
                  placeholder="Notas para você (não aparecem no estudo)..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-police-body focus:ring-2 focus:ring-accent-500"
                />
              </div>
            </div>

            {/* Upload de Imagens */}
            <div className="space-y-2">
              <h5 className="font-police-subtitle uppercase tracking-wider text-gray-700 dark:text-gray-300 text-sm font-semibold flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-accent-500" />
                IMAGENS DO FLASHCARD
              </h5>
              <ImageUploader
                value={formData.images || []}
                onChange={(images) => setFormData(prev => ({ ...prev, images }))}
                maxImages={3}
                maxSizeInMB={5}
              />
            </div>

            {/* Botões de Ação */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSave}
                disabled={isLoading}
                className="flex-1 bg-accent-500 hover:bg-accent-600 text-black font-police-subtitle uppercase tracking-wider"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                    SALVANDO...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    SALVAR FLASHCARD
                  </>
                )}
              </Button>
              
              <Button
                onClick={() => navigate('/student/my-flashcards')}
                variant="outline"
                className="font-police-subtitle uppercase tracking-wider"
              >
                CANCELAR
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        {showPreview && (
          <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm h-fit">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-b border-accent-500/30">
              <CardTitle className="flex items-center gap-3 font-police-title uppercase tracking-wider text-gray-900 dark:text-white">
                <Eye className="w-6 h-6 text-accent-500" />
                PREVIEW DO FLASHCARD
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Badge variant={
                    formData.difficulty === 'easy' ? 'success' : 
                    formData.difficulty === 'hard' ? 'destructive' : 'warning'
                  }>
                    {formData.difficulty}
                  </Badge>
                  <Badge variant="outline">{formData.type}</Badge>
                  {formData.status === 'published' ? (
                    <Badge variant="success">
                      <Globe className="w-3 h-3 mr-1" />
                      PÚBLICO
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <Lock className="w-3 h-3 mr-1" />
                      PRIVADO
                    </Badge>
                  )}
                </div>
                
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <h4 className="font-police-subtitle font-semibold text-gray-900 dark:text-white mb-2">
                    FRENTE:
                  </h4>
                  <p className="font-police-body text-gray-700 dark:text-gray-300">
                    {formData.front || 'Sem conteúdo'}
                  </p>
                </div>
                
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <h4 className="font-police-subtitle font-semibold text-gray-900 dark:text-white mb-2">
                    VERSO:
                  </h4>
                  <p className="font-police-body text-gray-700 dark:text-gray-300">
                    {formData.back || 'Sem conteúdo'}
                  </p>
                </div>
                
                {formData.tags && formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {(typeof formData.tags === 'string' 
                      ? formData.tags.split(',').map(t => t.trim()).filter(t => t)
                      : formData.tags
                    ).map((tag, index) => (
                      <Badge key={index} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}