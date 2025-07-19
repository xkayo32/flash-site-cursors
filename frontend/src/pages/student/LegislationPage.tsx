import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Scale,
  Search,
  Filter,
  BookOpen,
  Calendar,
  FileText,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Download,
  Share2,
  Bookmark,
  Clock,
  Eye,
  Tag,
  Layers,
  AlertCircle,
  CheckCircle,
  History,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';

// Tipos
interface Legislation {
  id: string;
  title: string;
  number: string;
  type: 'Lei' | 'Decreto' | 'Medida Provisória' | 'Constituição' | 'Código' | 'Estatuto';
  category: string;
  date: string;
  status: 'Vigente' | 'Revogada' | 'Alterada';
  summary: string;
  articles: number;
  lastUpdate?: string;
  relatedExams: string[];
  tags: string[];
  views: number;
  isFavorite?: boolean;
  chapters?: Chapter[];
}

interface Chapter {
  id: string;
  number: string;
  title: string;
  articles: Article[];
}

interface Article {
  id: string;
  number: string;
  text: string;
  paragraphs?: string[];
  items?: string[];
  notes?: string[];
  lastUpdate?: string;
}

// Dados mockados
const mockLegislations: Legislation[] = [
  {
    id: '1',
    title: 'Constituição Federal',
    number: 'CF/1988',
    type: 'Constituição',
    category: 'Direito Constitucional',
    date: '1988-10-05',
    status: 'Vigente',
    summary: 'Constituição da República Federativa do Brasil de 1988',
    articles: 250,
    lastUpdate: '2023-12-15',
    relatedExams: ['Polícia Federal', 'Receita Federal', 'Tribunais'],
    tags: ['CF/88', 'Constituição', 'Lei Fundamental'],
    views: 15678,
    isFavorite: true
  },
  {
    id: '2',
    title: 'Código Penal',
    number: 'Decreto-Lei nº 2.848/1940',
    type: 'Código',
    category: 'Direito Penal',
    date: '1940-12-07',
    status: 'Vigente',
    summary: 'Código Penal Brasileiro',
    articles: 361,
    lastUpdate: '2024-01-10',
    relatedExams: ['Polícia Federal', 'Polícia Civil', 'MP'],
    tags: ['CP', 'Código Penal', 'Crimes'],
    views: 12456,
    isFavorite: true
  },
  {
    id: '3',
    title: 'Lei de Licitações e Contratos',
    number: 'Lei nº 14.133/2021',
    type: 'Lei',
    category: 'Direito Administrativo',
    date: '2021-04-01',
    status: 'Vigente',
    summary: 'Nova Lei de Licitações e Contratos Administrativos',
    articles: 194,
    lastUpdate: '2023-07-20',
    relatedExams: ['TCU', 'CGU', 'Tribunais'],
    tags: ['Licitações', 'Contratos', 'Nova Lei'],
    views: 8934
  },
  {
    id: '4',
    title: 'Estatuto dos Servidores Públicos',
    number: 'Lei nº 8.112/1990',
    type: 'Estatuto',
    category: 'Direito Administrativo',
    date: '1990-12-11',
    status: 'Vigente',
    summary: 'Regime jurídico dos servidores públicos civis da União',
    articles: 253,
    lastUpdate: '2023-11-05',
    relatedExams: ['Todos os concursos federais'],
    tags: ['Servidor Público', 'RJU', 'Lei 8.112'],
    views: 10234
  },
  {
    id: '5',
    title: 'Lei de Improbidade Administrativa',
    number: 'Lei nº 8.429/1992',
    type: 'Lei',
    category: 'Direito Administrativo',
    date: '1992-06-02',
    status: 'Vigente',
    summary: 'Dispõe sobre as sanções aplicáveis em virtude da prática de atos de improbidade administrativa',
    articles: 25,
    lastUpdate: '2021-10-26',
    relatedExams: ['MP', 'Magistratura', 'Procuradorias'],
    tags: ['Improbidade', 'Administração Pública', 'Sanções'],
    views: 6789
  }
];

// Exemplo de capítulos e artigos
const exampleChapters: Chapter[] = [
  {
    id: '1',
    number: 'I',
    title: 'Dos Princípios Fundamentais',
    articles: [
      {
        id: '1',
        number: '1º',
        text: 'A República Federativa do Brasil, formada pela união indissolúvel dos Estados e Municípios e do Distrito Federal, constitui-se em Estado Democrático de Direito e tem como fundamentos:',
        items: [
          'I - a soberania;',
          'II - a cidadania;',
          'III - a dignidade da pessoa humana;',
          'IV - os valores sociais do trabalho e da livre iniciativa;',
          'V - o pluralismo político.'
        ],
        paragraphs: [
          'Parágrafo único. Todo o poder emana do povo, que o exerce por meio de representantes eleitos ou diretamente, nos termos desta Constituição.'
        ]
      },
      {
        id: '2',
        number: '2º',
        text: 'São Poderes da União, independentes e harmônicos entre si, o Legislativo, o Executivo e o Judiciário.'
      }
    ]
  },
  {
    id: '2',
    number: 'II',
    title: 'Dos Direitos e Garantias Fundamentais',
    articles: [
      {
        id: '5',
        number: '5º',
        text: 'Todos são iguais perante a lei, sem distinção de qualquer natureza, garantindo-se aos brasileiros e aos estrangeiros residentes no País a inviolabilidade do direito à vida, à liberdade, à igualdade, à segurança e à propriedade, nos termos seguintes:',
        items: [
          'I - homens e mulheres são iguais em direitos e obrigações, nos termos desta Constituição;',
          'II - ninguém será obrigado a fazer ou deixar de fazer alguma coisa senão em virtude de lei;',
          'III - ninguém será submetido a tortura nem a tratamento desumano ou degradante;'
        ],
        notes: [
          'Este artigo é conhecido como o princípio da isonomia ou igualdade.',
          'Os direitos fundamentais são cláusulas pétreas.'
        ]
      }
    ]
  }
];

const categories = ['Todos', 'Direito Constitucional', 'Direito Penal', 'Direito Administrativo', 'Direito Civil', 'Direito do Trabalho'];
const types = ['Todos', 'Lei', 'Decreto', 'Medida Provisória', 'Constituição', 'Código', 'Estatuto'];
const statuses = ['Todos', 'Vigente', 'Revogada', 'Alterada'];

export default function LegislationPage() {
  const [selectedLegislation, setSelectedLegislation] = useState<Legislation | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'reading'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedType, setSelectedType] = useState('Todos');
  const [selectedStatus, setSelectedStatus] = useState('Todos');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedChapters, setExpandedChapters] = useState<string[]>([]);
  const [copiedArticle, setCopiedArticle] = useState<string | null>(null);

  // Filtrar legislações
  const filteredLegislations = mockLegislations.filter(legislation => {
    const matchesSearch = legislation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         legislation.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         legislation.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'Todos' || legislation.category === selectedCategory;
    const matchesType = selectedType === 'Todos' || legislation.type === selectedType;
    const matchesStatus = selectedStatus === 'Todos' || legislation.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesType && matchesStatus;
  });

  // Toggle capítulo expandido
  const toggleChapter = (chapterId: string) => {
    setExpandedChapters(prev => 
      prev.includes(chapterId) 
        ? prev.filter(id => id !== chapterId)
        : [...prev, chapterId]
    );
  };

  // Copiar artigo
  const copyArticle = (articleNumber: string, articleText: string) => {
    const fullText = `Art. ${articleNumber} - ${articleText}`;
    navigator.clipboard.writeText(fullText);
    setCopiedArticle(articleNumber);
    setTimeout(() => setCopiedArticle(null), 2000);
  };

  // Card de legislação
  const LegislationCard = ({ legislation }: { legislation: Legislation }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="h-full hover:shadow-xl transition-all duration-300">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{legislation.type}</Badge>
                <Badge 
                  className={cn(
                    legislation.status === 'Vigente' && "bg-green-100 text-green-700",
                    legislation.status === 'Revogada' && "bg-red-100 text-red-700",
                    legislation.status === 'Alterada' && "bg-yellow-100 text-yellow-700"
                  )}
                >
                  {legislation.status}
                </Badge>
              </div>
              
              <h3 className="font-bold text-lg text-primary-900 mb-1">
                {legislation.title}
              </h3>
              
              <p className="text-sm text-primary-600 mb-2">
                {legislation.number}
              </p>
            </div>
            
            <button
              onClick={() => {
                // Toggle favorite
              }}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <Bookmark 
                className={cn(
                  "w-5 h-5",
                  legislation.isFavorite ? "fill-primary-600 text-primary-600" : "text-gray-400"
                )}
              />
            </button>
          </div>

          {/* Resumo */}
          <p className="text-sm text-primary-600 mb-4 line-clamp-2">
            {legislation.summary}
          </p>

          {/* Metadados */}
          <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
            <div className="flex items-center gap-1 text-primary-600">
              <FileText className="w-4 h-4" />
              <span>{legislation.articles} artigos</span>
            </div>
            <div className="flex items-center gap-1 text-primary-600">
              <Calendar className="w-4 h-4" />
              <span>{new Date(legislation.date).getFullYear()}</span>
            </div>
            <div className="flex items-center gap-1 text-primary-600">
              <Eye className="w-4 h-4" />
              <span>{legislation.views.toLocaleString()} views</span>
            </div>
            <div className="flex items-center gap-1 text-primary-600">
              <Clock className="w-4 h-4" />
              <span>Atualizada</span>
            </div>
          </div>

          {/* Concursos relacionados */}
          {legislation.relatedExams.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-primary-600 mb-1">Relevante para:</p>
              <div className="flex flex-wrap gap-1">
                {legislation.relatedExams.slice(0, 3).map((exam, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {exam}
                  </Badge>
                ))}
                {legislation.relatedExams.length > 3 && (
                  <span className="text-xs text-primary-500">
                    +{legislation.relatedExams.length - 3}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Ações */}
          <div className="flex gap-2">
            <Button 
              className="flex-1 gap-2"
              onClick={() => {
                setSelectedLegislation(legislation);
                setViewMode('reading');
              }}
            >
              <BookOpen className="w-4 h-4" />
              Ler
            </Button>
            <Button variant="outline" size="sm" className="p-2">
              <Download className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" className="p-2">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>

          {/* Última atualização */}
          {legislation.lastUpdate && (
            <div className="mt-4 pt-4 border-t flex items-center justify-between text-xs text-primary-500">
              <span className="flex items-center gap-1">
                <History className="w-3 h-3" />
                Última atualização: {new Date(legislation.lastUpdate).toLocaleDateString('pt-BR')}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  // Visualização de leitura
  const ReadingView = ({ legislation }: { legislation: Legislation }) => (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode('list')}
            className="mb-4 gap-2"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Voltar
          </Button>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary">{legislation.type}</Badge>
                <Badge>{legislation.category}</Badge>
                <Badge 
                  className={cn(
                    legislation.status === 'Vigente' && "bg-green-100 text-green-700",
                    legislation.status === 'Revogada' && "bg-red-100 text-red-700",
                    legislation.status === 'Alterada' && "bg-yellow-100 text-yellow-700"
                  )}
                >
                  {legislation.status}
                </Badge>
              </div>
              
              <h1 className="text-2xl font-bold text-primary-900 mb-2">
                {legislation.title}
              </h1>
              
              <p className="text-primary-600 mb-2">
                {legislation.number}
              </p>
              
              <p className="text-primary-600 mb-4">
                {legislation.summary}
              </p>
              
              <div className="flex items-center gap-6 text-sm text-primary-600">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Publicada em {new Date(legislation.date).toLocaleDateString('pt-BR')}
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  {legislation.articles} artigos
                </span>
                {legislation.lastUpdate && (
                  <span className="flex items-center gap-1">
                    <History className="w-4 h-4" />
                    Atualizada em {new Date(legislation.lastUpdate).toLocaleDateString('pt-BR')}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Bookmark className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm">
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Aviso para legislação revogada */}
      {legislation.status === 'Revogada' && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-800 font-medium">
                Esta legislação foi revogada e não está mais em vigor.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Capítulos e artigos */}
      <div className="space-y-4">
        {exampleChapters.map((chapter) => (
          <Card key={chapter.id}>
            <CardHeader 
              className="cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleChapter(chapter.id)}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-primary-900">
                  Capítulo {chapter.number} - {chapter.title}
                </h2>
                {expandedChapters.includes(chapter.id) ? (
                  <ChevronUp className="w-5 h-5 text-primary-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-primary-600" />
                )}
              </div>
            </CardHeader>
            
            <AnimatePresence>
              {expandedChapters.includes(chapter.id) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <CardContent className="space-y-6 pt-0">
                    {chapter.articles.map((article) => (
                      <div key={article.id} className="border-l-4 border-primary-200 pl-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-bold text-primary-900">
                            Art. {article.number}
                          </h3>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyArticle(article.number, article.text)}
                            className="gap-1"
                          >
                            {copiedArticle === article.number ? (
                              <>
                                <Check className="w-3 h-3" />
                                Copiado
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                Copiar
                              </>
                            )}
                          </Button>
                        </div>
                        
                        <p className="text-primary-800 mb-3">
                          {article.text}
                        </p>
                        
                        {article.items && (
                          <div className="ml-4 space-y-1 mb-3">
                            {article.items.map((item, idx) => (
                              <p key={idx} className="text-primary-700">
                                {item}
                              </p>
                            ))}
                          </div>
                        )}
                        
                        {article.paragraphs && (
                          <div className="space-y-2 mb-3">
                            {article.paragraphs.map((paragraph, idx) => (
                              <p key={idx} className="text-primary-700 italic">
                                {paragraph}
                              </p>
                            ))}
                          </div>
                        )}
                        
                        {article.notes && (
                          <div className="bg-blue-50 rounded-lg p-3 mt-3">
                            <p className="text-sm font-medium text-blue-900 mb-1">
                              📝 Notas de estudo:
                            </p>
                            {article.notes.map((note, idx) => (
                              <p key={idx} className="text-sm text-blue-800">
                                • {note}
                              </p>
                            ))}
                          </div>
                        )}
                        
                        {article.lastUpdate && (
                          <p className="text-xs text-primary-500 mt-2">
                            Artigo alterado em {new Date(article.lastUpdate).toLocaleDateString('pt-BR')}
                          </p>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        ))}
      </div>

      {/* Navegação entre capítulos */}
      <div className="mt-8 flex items-center justify-between">
        <Button variant="outline" disabled>
          <ChevronRight className="w-4 h-4 rotate-180 mr-2" />
          Capítulo anterior
        </Button>
        <span className="text-sm text-primary-600">
          Capítulo 1 de 10
        </span>
        <Button variant="outline">
          Próximo capítulo
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      {viewMode === 'list' ? (
        <>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-primary-900 mb-2">Legislação</h1>
                <p className="text-primary-600">
                  Textos de leis relevantes para concursos públicos
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  <Scale className="w-5 h-5 mr-2" />
                  {mockLegislations.length} legislações
                </Badge>
              </div>
            </div>

            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-primary-600">Leis consultadas</p>
                      <p className="text-2xl font-bold text-primary-900">23</p>
                    </div>
                    <BookOpen className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-primary-600">Favoritas</p>
                      <p className="text-2xl font-bold text-primary-900">8</p>
                    </div>
                    <Bookmark className="w-8 h-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-primary-600">Atualizações</p>
                      <p className="text-2xl font-bold text-primary-900">5</p>
                    </div>
                    <History className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-primary-600">Artigos lidos</p>
                      <p className="text-2xl font-bold text-primary-900">342</p>
                    </div>
                    <FileText className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Barra de busca e filtros */}
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary-400" />
                  <input
                    type="text"
                    placeholder="Buscar por título, número ou palavra-chave..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {types.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>

          {/* Grid de legislações */}
          {filteredLegislations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLegislations.map((legislation) => (
                <LegislationCard key={legislation.id} legislation={legislation} />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Scale className="w-16 h-16 text-primary-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-primary-900 mb-2">
                Nenhuma legislação encontrada
              </h3>
              <p className="text-primary-600 mb-6">
                Tente ajustar os filtros ou fazer uma nova busca
              </p>
              <Button variant="outline" onClick={() => {
                setSearchTerm('');
                setSelectedCategory('Todos');
                setSelectedType('Todos');
                setSelectedStatus('Todos');
              }}>
                Limpar filtros
              </Button>
            </Card>
          )}
        </>
      ) : (
        selectedLegislation && <ReadingView legislation={selectedLegislation} />
      )}

      {/* Call to Action */}
      {viewMode === 'list' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-white text-center"
        >
          <Scale className="w-12 h-12 mx-auto mb-4 text-accent-400" />
          <h2 className="text-2xl font-bold mb-2">
            Mantenha-se atualizado!
          </h2>
          <p className="text-primary-100 mb-6 max-w-2xl mx-auto">
            Acesse as legislações mais importantes para seu concurso com atualizações em tempo real
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="secondary" size="lg">
              <Layers className="w-5 h-5 mr-2" />
              Ver Mais Consultadas
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-white text-white hover:bg-white hover:text-primary-700"
            >
              <History className="w-5 h-5 mr-2" />
              Atualizações Recentes
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}