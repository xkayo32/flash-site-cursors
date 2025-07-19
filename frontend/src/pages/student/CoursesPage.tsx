import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  Clock,
  Users,
  Star,
  BookOpen,
  Award,
  TrendingUp,
  Calendar,
  ChevronDown,
  CheckCircle,
  Play,
  FileText,
  Brain,
  Target,
  Zap,
  X,
  Grid,
  List
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';
import { Link } from 'react-router-dom';

// Tipos
interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  category: string;
  subcategory: string;
  duration: string;
  students: number;
  rating: number;
  reviews: number;
  price: number;
  originalPrice?: number;
  modules: number;
  questions: number;
  lastUpdated: string;
  level: 'Iniciante' | 'Intermediário' | 'Avançado';
  features: string[];
  image: string;
  badge?: {
    text: string;
    color: string;
  };
  progress?: number;
  enrolled?: boolean;
}

// Dados mockados de cursos
const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Polícia Federal 2024 - Agente',
    description: 'Curso completo e atualizado para o concurso da PF. Inclui todas as disciplinas do edital com videoaulas, PDFs e questões comentadas.',
    instructor: 'Prof. Carlos Mendez',
    category: 'Polícia',
    subcategory: 'Federal',
    duration: '180h',
    students: 2341,
    rating: 4.9,
    reviews: 487,
    price: 197,
    originalPrice: 397,
    modules: 18,
    questions: 8500,
    lastUpdated: '2024-01-15',
    level: 'Intermediário',
    features: ['Videoaulas HD', 'PDFs atualizados', 'Questões comentadas', 'Simulados'],
    image: 'https://images.unsplash.com/photo-1589994965851-a8f479c573a9?w=400&h=250&fit=crop',
    badge: {
      text: 'NOVO',
      color: 'bg-green-500'
    }
  },
  {
    id: '2',
    title: 'Receita Federal - Auditor Fiscal',
    description: 'Preparação completa para Auditor Fiscal da RFB. Material constantemente atualizado com as últimas mudanças legislativas.',
    instructor: 'Prof. Ana Silva',
    category: 'Fiscal',
    subcategory: 'Federal',
    duration: '220h',
    students: 1856,
    rating: 4.8,
    reviews: 342,
    price: 297,
    modules: 22,
    questions: 12300,
    lastUpdated: '2024-01-10',
    level: 'Avançado',
    features: ['Legislação atualizada', 'Casos práticos', 'Mentoria', 'Grupo exclusivo'],
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=250&fit=crop',
    badge: {
      text: 'ATUALIZADO',
      color: 'bg-blue-500'
    },
    enrolled: true,
    progress: 45
  },
  {
    id: '3',
    title: 'Tribunais - TRT/TRF Analista',
    description: 'Curso focado nos principais tribunais do país. Direcionado para analista judiciário - área judiciária.',
    instructor: 'Prof. Roberto Lima',
    category: 'Tribunais',
    subcategory: 'Analista',
    duration: '150h',
    students: 987,
    rating: 4.7,
    reviews: 198,
    price: 197,
    modules: 15,
    questions: 6700,
    lastUpdated: '2023-12-20',
    level: 'Intermediário',
    features: ['Jurisprudência atualizada', 'Redação discursiva', 'Correção detalhada'],
    image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=250&fit=crop',
    badge: {
      text: 'EM ALTA',
      color: 'bg-orange-500'
    }
  },
  {
    id: '4',
    title: 'Banco do Brasil - Escriturário',
    description: 'Preparação completa para o concurso do BB. Inclui matemática financeira, conhecimentos bancários e atualidades.',
    instructor: 'Prof. Marina Costa',
    category: 'Bancários',
    subcategory: 'Escriturário',
    duration: '120h',
    students: 3421,
    rating: 4.9,
    reviews: 623,
    price: 147,
    modules: 12,
    questions: 5400,
    lastUpdated: '2024-01-05',
    level: 'Iniciante',
    features: ['Matemática descomplicada', 'Atualidades do mercado', 'Simulados semanais'],
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=250&fit=crop'
  },
  {
    id: '5',
    title: 'TCU - Auditor Federal de Controle',
    description: 'O curso mais completo para o TCU. Professores especialistas e material direcionado para a banca CESPE.',
    instructor: 'Prof. Paulo Santos',
    category: 'Controle',
    subcategory: 'Federal',
    duration: '200h',
    students: 654,
    rating: 4.8,
    reviews: 89,
    price: 347,
    originalPrice: 497,
    modules: 20,
    questions: 9800,
    lastUpdated: '2023-11-30',
    level: 'Avançado',
    features: ['Auditoria governamental', 'Controle externo', 'AFO aprofundada'],
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=250&fit=crop',
    enrolled: true,
    progress: 78
  },
  {
    id: '6',
    title: 'INSS - Técnico do Seguro Social',
    description: 'Curso atualizado para o INSS com foco em direito previdenciário e legislação específica.',
    instructor: 'Prof. Juliana Martins',
    category: 'Previdência',
    subcategory: 'Técnico',
    duration: '100h',
    students: 4532,
    rating: 4.6,
    reviews: 876,
    price: 127,
    modules: 10,
    questions: 4300,
    lastUpdated: '2024-01-08',
    level: 'Iniciante',
    features: ['Direito previdenciário', 'Ética no serviço público', 'Informática'],
    image: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=400&h=250&fit=crop'
  }
];

// Categorias disponíveis
const categories = [
  { value: 'all', label: 'Todas as categorias' },
  { value: 'Polícia', label: 'Polícia' },
  { value: 'Fiscal', label: 'Fiscal' },
  { value: 'Tribunais', label: 'Tribunais' },
  { value: 'Bancários', label: 'Bancários' },
  { value: 'Controle', label: 'Controle' },
  { value: 'Previdência', label: 'Previdência' }
];

// Níveis disponíveis
const levels = [
  { value: 'all', label: 'Todos os níveis' },
  { value: 'Iniciante', label: 'Iniciante' },
  { value: 'Intermediário', label: 'Intermediário' },
  { value: 'Avançado', label: 'Avançado' }
];

// Ordenação
const sortOptions = [
  { value: 'popular', label: 'Mais populares' },
  { value: 'rating', label: 'Melhor avaliados' },
  { value: 'newest', label: 'Mais recentes' },
  { value: 'price-low', label: 'Menor preço' },
  { value: 'price-high', label: 'Maior preço' }
];

export default function CoursesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [showFilters, setShowFilters] = useState(false);
  const [showOnlyEnrolled, setShowOnlyEnrolled] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filtrar e ordenar cursos
  const filteredCourses = useMemo(() => {
    let filtered = [...mockCourses];

    // Filtrar por busca
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por categoria
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(course => course.category === selectedCategory);
    }

    // Filtrar por nível
    if (selectedLevel !== 'all') {
      filtered = filtered.filter(course => course.level === selectedLevel);
    }

    // Filtrar apenas matriculados
    if (showOnlyEnrolled) {
      filtered = filtered.filter(course => course.enrolled);
    }

    // Ordenar
    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => b.students - a.students);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
        break;
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
    }

    return filtered;
  }, [searchTerm, selectedCategory, selectedLevel, sortBy, showOnlyEnrolled]);

  const CourseCard = ({ course, index }: { course: Course; index: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card className="h-full hover:shadow-xl transition-all duration-300 group overflow-hidden">
        {/* Imagem do curso */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={course.image}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          {course.badge && (
            <Badge className={cn("absolute top-4 left-4", course.badge.color)}>
              {course.badge.text}
            </Badge>
          )}
          {course.enrolled && course.progress !== undefined && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <div className="flex items-center gap-2 text-white text-sm mb-1">
                <Play className="w-4 h-4" />
                <span>{course.progress}% concluído</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div
                  className="bg-accent-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${course.progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <CardContent className="p-6">
          {/* Categoria e Nível */}
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="secondary" className="text-xs">
              {course.category}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {course.level}
            </Badge>
          </div>

          {/* Título */}
          <h3 className="font-bold text-lg text-primary-900 mb-2 line-clamp-2 group-hover:text-primary-700 transition-colors">
            {course.title}
          </h3>

          {/* Descrição */}
          <p className="text-sm text-primary-600 mb-4 line-clamp-2">
            {course.description}
          </p>

          {/* Instrutor */}
          <p className="text-sm text-primary-500 mb-4">
            Por {course.instructor}
          </p>

          {/* Estatísticas */}
          <div className="grid grid-cols-3 gap-3 mb-4 text-sm">
            <div className="flex items-center gap-1 text-primary-600">
              <Clock className="w-4 h-4" />
              <span>{course.duration}</span>
            </div>
            <div className="flex items-center gap-1 text-primary-600">
              <Users className="w-4 h-4" />
              <span>{course.students.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1 text-primary-600">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span>{course.rating}</span>
            </div>
          </div>

          {/* Features */}
          <div className="flex flex-wrap gap-2 mb-4">
            {course.features.slice(0, 2).map((feature, idx) => (
              <span key={idx} className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded">
                {feature}
              </span>
            ))}
            {course.features.length > 2 && (
              <span className="text-xs text-primary-500">
                +{course.features.length - 2} mais
              </span>
            )}
          </div>

          {/* Preço e Ação */}
          <div className="flex items-center justify-between mt-auto">
            <div>
              {course.originalPrice && (
                <span className="text-sm text-primary-400 line-through">
                  R$ {course.originalPrice}
                </span>
              )}
              <div className="text-2xl font-bold text-primary-900">
                R$ {course.price}
              </div>
            </div>
            {course.enrolled ? (
              <Link to={`/course/${course.id}`}>
                <Button size="sm" variant="secondary">
                  Continuar
                  <Play className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            ) : (
              <Link to={`/course/${course.id}`}>
                <Button size="sm">
                  Ver detalhes
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const CourseListItem = ({ course, index }: { course: Course; index: number }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className="mb-4 hover:shadow-lg transition-all duration-300 overflow-hidden">
        <div className="flex items-stretch">
          {/* Imagem */}
          <div className="relative w-48 h-32">
            <img
              src={course.image}
              alt={course.title}
              className="w-full h-full object-cover"
            />
            {course.badge && (
              <Badge className={cn("absolute top-2 left-2", course.badge.color)}>
                {course.badge.text}
              </Badge>
            )}
          </div>

          {/* Conteúdo */}
          <div className="flex-1 p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Categoria e Nível */}
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {course.category}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {course.level}
                  </Badge>
                  {course.enrolled && (
                    <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                      Matriculado
                    </Badge>
                  )}
                </div>

                {/* Título e Descrição */}
                <h3 className="font-bold text-lg text-primary-900 mb-1">
                  {course.title}
                </h3>
                <p className="text-sm text-primary-600 mb-2 line-clamp-2">
                  {course.description}
                </p>

                {/* Instrutor e Stats */}
                <div className="flex items-center gap-4 text-sm text-primary-500">
                  <span>Por {course.instructor}</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{course.students.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span>{course.rating}</span>
                  </div>
                </div>
              </div>

              {/* Preço e Ação */}
              <div className="text-right ml-6">
                {course.originalPrice && (
                  <span className="text-sm text-primary-400 line-through">
                    R$ {course.originalPrice}
                  </span>
                )}
                <div className="text-2xl font-bold text-primary-900 mb-2">
                  R$ {course.price}
                </div>
                {course.enrolled ? (
                  <Link to={`/course/${course.id}`}>
                    <Button size="sm" variant="secondary">
                      Continuar
                      <Play className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                ) : (
                  <Link to={`/course/${course.id}`}>
                    <Button size="sm">
                      Ver detalhes
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Progresso se matriculado */}
            {course.enrolled && course.progress !== undefined && (
              <div className="mt-3 pt-3 border-t">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-primary-600">{course.progress}% concluído</span>
                  <span className="text-primary-500">{course.modules} módulos • {course.questions} questões</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-accent-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );

  return (
    <div className="p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-primary-900">Catálogo de Cursos</h1>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            <BookOpen className="w-5 h-5 mr-2" />
            {mockCourses.length} cursos disponíveis
          </Badge>
        </div>
        <p className="text-primary-600">
          Escolha o curso ideal para sua preparação e acelere sua aprovação
        </p>
      </motion.div>

      {/* Barra de busca e filtros */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-6 space-y-4"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Busca */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary-400" />
              <input
                type="text"
                placeholder="Buscar por curso, instrutor ou palavra-chave..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filtros rápidos */}
          <div className="flex gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {sortOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="w-4 h-4" />
              Filtros
              <ChevronDown className={cn("w-4 h-4 transition-transform", showFilters && "rotate-180")} />
            </Button>

            {/* Modo de visualização */}
            <div className="flex items-center gap-1 ml-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="p-2"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="p-2"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Filtros expandidos */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-primary-50 rounded-lg p-4 space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Nível */}
              <div>
                <label className="block text-sm font-medium text-primary-700 mb-2">
                  Nível de dificuldade
                </label>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="w-full px-4 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                >
                  {levels.map(level => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
              </div>

              {/* Cursos matriculados */}
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showOnlyEnrolled}
                    onChange={(e) => setShowOnlyEnrolled(e.target.checked)}
                    className="w-4 h-4 text-primary-600 border-primary-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-primary-700">
                    Mostrar apenas cursos matriculados
                  </span>
                </label>
              </div>

              {/* Limpar filtros */}
              <div className="flex items-end justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedLevel('all');
                    setShowOnlyEnrolled(false);
                    setSearchTerm('');
                  }}
                  className="text-primary-600"
                >
                  <X className="w-4 h-4 mr-1" />
                  Limpar filtros
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Lista de cursos */}
      {filteredCourses.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course, index) => (
              <CourseCard key={course.id} course={course} index={index} />
            ))}
          </div>
        ) : (
          <div>
            {filteredCourses.map((course, index) => (
              <CourseListItem key={course.id} course={course} index={index} />
            ))}
          </div>
        )
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-10 h-10 text-primary-400" />
          </div>
          <h3 className="text-xl font-semibold text-primary-900 mb-2">
            Nenhum curso encontrado
          </h3>
          <p className="text-primary-600 mb-4">
            Tente ajustar os filtros ou fazer uma nova busca
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSelectedCategory('all');
              setSelectedLevel('all');
              setShowOnlyEnrolled(false);
              setSearchTerm('');
            }}
          >
            Limpar filtros
          </Button>
        </motion.div>
      )}

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-12 bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-white text-center"
      >
        <Zap className="w-12 h-12 mx-auto mb-4 text-accent-400" />
        <h2 className="text-2xl font-bold mb-2">
          Não encontrou o curso que procura?
        </h2>
        <p className="text-primary-100 mb-6 max-w-2xl mx-auto">
          Estamos sempre adicionando novos cursos. Entre em contato e nos diga qual concurso você está se preparando!
        </p>
        <Button variant="secondary" size="lg">
          Sugerir novo curso
        </Button>
      </motion.div>
    </div>
  );
}