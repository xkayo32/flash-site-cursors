import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  Download,
  FileSpreadsheet,
  FileText,
  Brain,
  Star,
  CheckCircle,
  AlertCircle,
  XCircle,
  Info,
  Loader2,
  ChevronRight,
  Eye,
  Edit,
  Trash2,
  Filter,
  Search,
  FileDown,
  FileUp,
  Database,
  RefreshCw,
  Settings,
  History,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

// Mock import history
const importHistory = [
  {
    id: 1,
    filename: 'questoes_direito_constitucional.csv',
    type: 'questions',
    date: '2024-01-15 14:30',
    user: 'Admin',
    status: 'success',
    totalItems: 150,
    importedItems: 145,
    failedItems: 5,
    duration: '2.3s'
  },
  {
    id: 2,
    filename: 'flashcards_matematica.xlsx',
    type: 'flashcards',
    date: '2024-01-14 10:15',
    user: 'Admin',
    status: 'success',
    totalItems: 200,
    importedItems: 200,
    failedItems: 0,
    duration: '3.1s'
  },
  {
    id: 3,
    filename: 'questoes_portugues_cesgranrio.csv',
    type: 'questions',
    date: '2024-01-13 16:45',
    user: 'Prof. Maria',
    status: 'partial',
    totalItems: 80,
    importedItems: 65,
    failedItems: 15,
    duration: '1.8s'
  },
  {
    id: 4,
    filename: 'flashcards_direito_penal.csv',
    type: 'flashcards',
    date: '2024-01-12 09:20',
    user: 'Admin',
    status: 'failed',
    totalItems: 100,
    importedItems: 0,
    failedItems: 100,
    duration: '0.5s',
    error: 'Formato de arquivo inválido'
  }
];

// Sample data preview
const samplePreviewData = {
  questions: [
    {
      question: 'Qual é o princípio fundamental da República?',
      optionA: 'Soberania',
      optionB: 'Cidadania',
      optionC: 'Dignidade da pessoa humana',
      optionD: 'Todas as anteriores',
      correctAnswer: 'D',
      explanation: 'Todos são princípios fundamentais...',
      subject: 'Direito Constitucional',
      topic: 'Princípios Fundamentais',
      difficulty: 'Média',
      examBoard: 'CESPE',
      year: '2023'
    }
  ],
  flashcards: [
    {
      front: 'O que é um princípio constitucional?',
      back: 'São normas que servem de base para todo o ordenamento jurídico...',
      category: 'Direito Constitucional',
      tags: 'princípios, constituição',
      difficulty: 'Fácil'
    }
  ]
};

export default function ImportManager() {
  const [activeTab, setActiveTab] = useState<'import' | 'history' | 'templates'>('import');
  const [importType, setImportType] = useState<'questions' | 'flashcards'>('questions');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [importResults, setImportResults] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // In real app, parse file and show preview
      setPreviewData(importType === 'questions' ? samplePreviewData.questions : samplePreviewData.flashcards);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.csv') || file.name.endsWith('.xlsx'))) {
      setSelectedFile(file);
      setPreviewData(importType === 'questions' ? samplePreviewData.questions : samplePreviewData.flashcards);
    }
  };

  const simulateUpload = () => {
    setIsUploading(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setImportResults({
            success: true,
            totalItems: 150,
            importedItems: 145,
            failedItems: 5,
            warnings: [
              'Linha 23: Questão sem explicação',
              'Linha 45: Categoria não encontrada',
              'Linha 67: Formato de resposta inválido',
              'Linha 89: Ano fora do intervalo permitido',
              'Linha 102: Banca não cadastrada'
            ]
          });
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      success: { label: 'Sucesso', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      partial: { label: 'Parcial', color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
      failed: { label: 'Falhou', color: 'bg-red-100 text-red-800', icon: XCircle }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-primary-900 dark:text-white">
            Importação em Massa
          </h1>
          <p className="text-primary-600 dark:text-gray-300">
            Importe questões e flashcards via CSV ou Excel
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <FileDown className="w-4 h-4" />
            Baixar Templates
          </Button>
          <Button variant="outline" className="gap-2">
            <Info className="w-4 h-4" />
            Documentação
          </Button>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('import')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'import'
              ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          Nova Importação
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'history'
              ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          Histórico
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'templates'
              ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          Templates
        </button>
      </div>

      {/* Content */}
      {activeTab === 'import' && (
        <div className="space-y-6">
          {/* Import Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Tipo de Importação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label
                  className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    importType === 'questions'
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="importType"
                    value="questions"
                    checked={importType === 'questions'}
                    onChange={(e) => setImportType(e.target.value as 'questions')}
                    className="sr-only"
                  />
                  <Brain className="w-8 h-8 text-purple-600" />
                  <div>
                    <p className="font-semibold text-primary-900 dark:text-white">Questões</p>
                    <p className="text-sm text-primary-600 dark:text-gray-400">
                      Importe questões de múltipla escolha com gabarito
                    </p>
                  </div>
                </label>

                <label
                  className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    importType === 'flashcards'
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="importType"
                    value="flashcards"
                    checked={importType === 'flashcards'}
                    onChange={(e) => setImportType(e.target.value as 'flashcards')}
                    className="sr-only"
                  />
                  <Star className="w-8 h-8 text-yellow-600" />
                  <div>
                    <p className="font-semibold text-primary-900 dark:text-white">Flashcards</p>
                    <p className="text-sm text-primary-600 dark:text-gray-400">
                      Importe flashcards com frente e verso
                    </p>
                  </div>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Upload de Arquivo</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-primary-400 dark:hover:border-primary-500 transition-colors cursor-pointer"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                {selectedFile ? (
                  <div className="space-y-4">
                    <FileSpreadsheet className="w-16 h-16 text-primary-600 mx-auto" />
                    <div>
                      <p className="text-lg font-medium text-primary-900 dark:text-white">
                        {selectedFile.name}
                      </p>
                      <p className="text-sm text-primary-600 dark:text-gray-400">
                        {(selectedFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                          setPreviewData([]);
                        }}
                      >
                        Remover
                      </Button>
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowPreview(true);
                        }}
                      >
                        Visualizar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Upload className="w-16 h-16 text-gray-400 mx-auto" />
                    <div>
                      <p className="text-lg font-medium text-primary-900 dark:text-white">
                        Arraste um arquivo ou clique para selecionar
                      </p>
                      <p className="text-sm text-primary-600 dark:text-gray-400">
                        Formatos aceitos: CSV, XLSX (máx. 10MB)
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Upload Progress */}
              {isUploading && (
                <div className="mt-6 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-primary-600 dark:text-gray-400">Processando arquivo...</span>
                    <span className="font-medium text-primary-900 dark:text-white">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Import Results */}
              {importResults && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-green-800 dark:text-green-200">
                        Importação concluída!
                      </p>
                      <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                        {importResults.importedItems} de {importResults.totalItems} itens importados com sucesso
                      </p>
                      
                      {importResults.warnings && importResults.warnings.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">
                            Avisos:
                          </p>
                          <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                            {importResults.warnings.slice(0, 3).map((warning: string, index: number) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="text-green-600 dark:text-green-400">•</span>
                                {warning}
                              </li>
                            ))}
                            {importResults.warnings.length > 3 && (
                              <li className="text-green-600 dark:text-green-400">
                                ...e {importResults.warnings.length - 3} outros avisos
                              </li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Action Buttons */}
              {selectedFile && !isUploading && (
                <div className="mt-6 flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewData([]);
                      setImportResults(null);
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={simulateUpload}
                    disabled={importResults !== null}
                    className="gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Iniciar Importação
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Import Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle>Diretrizes de Importação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-primary-900 dark:text-white mb-3 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-600" />
                    Formato para Questões
                  </h4>
                  <ul className="space-y-2 text-sm text-primary-600 dark:text-gray-400">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                      <span>Colunas obrigatórias: questão, opções A-E, resposta correta</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                      <span>Colunas opcionais: explicação, matéria, assunto, banca, ano</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                      <span>Máximo de 1000 questões por arquivo</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                      <span>Use UTF-8 para caracteres especiais</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-primary-900 dark:text-white mb-3 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-600" />
                    Formato para Flashcards
                  </h4>
                  <ul className="space-y-2 text-sm text-primary-600 dark:text-gray-400">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                      <span>Colunas obrigatórias: frente, verso</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                      <span>Colunas opcionais: categoria, tags, dificuldade</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                      <span>Suporta importação de decks Anki</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                      <span>Tags separadas por vírgula</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'history' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-primary-600 dark:text-gray-400">
                      Total Importado
                    </p>
                    <p className="text-2xl font-bold text-primary-900 dark:text-white">
                      12,450
                    </p>
                  </div>
                  <Database className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-primary-600 dark:text-gray-400">
                      Taxa de Sucesso
                    </p>
                    <p className="text-2xl font-bold text-primary-900 dark:text-white">
                      94.5%
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-primary-600 dark:text-gray-400">
                      Importações
                    </p>
                    <p className="text-2xl font-bold text-primary-900 dark:text-white">
                      {importHistory.length}
                    </p>
                  </div>
                  <History className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-primary-600 dark:text-gray-400">
                      Última Importação
                    </p>
                    <p className="text-lg font-bold text-primary-900 dark:text-white">
                      Hoje
                    </p>
                  </div>
                  <RefreshCw className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* History Table */}
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Importações</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-primary-50 dark:bg-gray-800">
                    <tr>
                      <th className="text-left py-4 px-6 font-semibold text-primary-900 dark:text-white">
                        Arquivo
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-primary-900 dark:text-white">
                        Tipo
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-primary-900 dark:text-white">
                        Data/Usuário
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-primary-900 dark:text-white">
                        Status
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-primary-900 dark:text-white">
                        Resultados
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-primary-900 dark:text-white">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {importHistory.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-primary-100 dark:border-gray-700 hover:bg-primary-50 dark:hover:bg-gray-800"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <FileSpreadsheet className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                            <div>
                              <p className="font-medium text-primary-900 dark:text-white">
                                {item.filename}
                              </p>
                              <p className="text-sm text-primary-600 dark:text-gray-400">
                                Duração: {item.duration}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            {item.type === 'questions' ? (
                              <Brain className="w-4 h-4 text-purple-600" />
                            ) : (
                              <Star className="w-4 h-4 text-yellow-600" />
                            )}
                            <span className="text-primary-900 dark:text-white capitalize">
                              {item.type === 'questions' ? 'Questões' : 'Flashcards'}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div>
                            <p className="text-sm text-primary-900 dark:text-white">
                              {item.date}
                            </p>
                            <p className="text-sm text-primary-600 dark:text-gray-400">
                              Por: {item.user}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          {getStatusBadge(item.status)}
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm">
                            <p className="text-primary-900 dark:text-white">
                              {item.importedItems}/{item.totalItems} importados
                            </p>
                            {item.failedItems > 0 && (
                              <p className="text-red-600 dark:text-red-400">
                                {item.failedItems} falhas
                              </p>
                            )}
                            {item.error && (
                              <p className="text-red-600 dark:text-red-400 text-xs mt-1">
                                {item.error}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" title="Ver detalhes">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" title="Baixar log">
                              <Download className="w-4 h-4" />
                            </Button>
                            {item.status === 'failed' && (
                              <Button variant="ghost" size="sm" title="Tentar novamente">
                                <RefreshCw className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {activeTab === 'templates' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Questions Template */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-600" />
                Template de Questões
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-primary-600 dark:text-gray-400 mb-4">
                Use este template para importar questões de múltipla escolha com todas as informações necessárias.
              </p>
              
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-xs font-medium text-primary-700 dark:text-gray-300 mb-1">
                    Colunas do template:
                  </p>
                  <ul className="text-xs text-primary-600 dark:text-gray-400 space-y-1">
                    <li>• questao (texto da questão)</li>
                    <li>• opcao_a, opcao_b, opcao_c, opcao_d, opcao_e</li>
                    <li>• resposta_correta (A, B, C, D ou E)</li>
                    <li>• explicacao (opcional)</li>
                    <li>• materia, assunto, banca, ano (opcionais)</li>
                  </ul>
                </div>
                
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" className="gap-2">
                    <FileSpreadsheet className="w-4 h-4" />
                    Baixar CSV
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <FileText className="w-4 h-4" />
                    Baixar XLSX
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Flashcards Template */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-600" />
                Template de Flashcards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-primary-600 dark:text-gray-400 mb-4">
                Use este template para importar flashcards com frente e verso, incluindo categorização.
              </p>
              
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-xs font-medium text-primary-700 dark:text-gray-300 mb-1">
                    Colunas do template:
                  </p>
                  <ul className="text-xs text-primary-600 dark:text-gray-400 space-y-1">
                    <li>• frente (pergunta ou conceito)</li>
                    <li>• verso (resposta ou definição)</li>
                    <li>• categoria (opcional)</li>
                    <li>• tags (opcional, separadas por vírgula)</li>
                    <li>• dificuldade (opcional: fácil, médio, difícil)</li>
                  </ul>
                </div>
                
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" className="gap-2">
                    <FileSpreadsheet className="w-4 h-4" />
                    Baixar CSV
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <FileText className="w-4 h-4" />
                    Baixar XLSX
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Anki Import */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-600" />
                Importação Anki
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-primary-600 dark:text-gray-400 mb-4">
                Importe seus decks do Anki diretamente para a plataforma.
              </p>
              
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">
                    Formatos suportados:
                  </p>
                  <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                    <li>• .apkg (Anki Package)</li>
                    <li>• .txt (Anki Export)</li>
                    <li>• .csv (Anki CSV)</li>
                  </ul>
                </div>
                
                <Button variant="outline" size="sm" className="gap-2">
                  <Info className="w-4 h-4" />
                  Ver Instruções
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Advanced Options */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-gray-600" />
                Opções Avançadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-primary-600 dark:text-gray-400 mb-4">
                Configurações avançadas para importação em massa.
              </p>
              
              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" defaultChecked />
                  <span className="text-sm text-primary-900 dark:text-white">
                    Validar dados antes da importação
                  </span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" defaultChecked />
                  <span className="text-sm text-primary-900 dark:text-white">
                    Ignorar duplicatas
                  </span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm text-primary-900 dark:text-white">
                    Criar categorias automaticamente
                  </span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm text-primary-900 dark:text-white">
                    Enviar relatório por email
                  </span>
                </label>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowPreview(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-5xl max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-primary-900 dark:text-white">
                  Pré-visualização dos Dados
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPreview(false)}
                >
                  <XCircle className="w-5 h-5" />
                </Button>
              </div>

              <div className="p-6 overflow-auto max-h-[70vh]">
                {importType === 'questions' ? (
                  <div className="space-y-4">
                    {previewData.map((item: any, index: number) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div>
                              <p className="font-medium text-primary-900 dark:text-white">
                                {index + 1}. {item.question}
                              </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                              <div className="flex items-start gap-2">
                                <span className="font-medium">A)</span>
                                <span className="text-primary-700 dark:text-gray-300">{item.optionA}</span>
                              </div>
                              <div className="flex items-start gap-2">
                                <span className="font-medium">B)</span>
                                <span className="text-primary-700 dark:text-gray-300">{item.optionB}</span>
                              </div>
                              <div className="flex items-start gap-2">
                                <span className="font-medium">C)</span>
                                <span className="text-primary-700 dark:text-gray-300">{item.optionC}</span>
                              </div>
                              <div className="flex items-start gap-2">
                                <span className="font-medium">D)</span>
                                <span className="text-primary-700 dark:text-gray-300">{item.optionD}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              <Badge variant="default">
                                Resposta: {item.correctAnswer}
                              </Badge>
                              <Badge variant="secondary">
                                {item.subject}
                              </Badge>
                              <Badge variant="outline">
                                {item.difficulty}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {previewData.map((item: any, index: number) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div>
                              <p className="text-sm font-medium text-primary-700 dark:text-gray-300">Frente:</p>
                              <p className="text-primary-900 dark:text-white">{item.front}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-primary-700 dark:text-gray-300">Verso:</p>
                              <p className="text-primary-900 dark:text-white">{item.back}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">{item.category}</Badge>
                              <Badge variant="outline">{item.difficulty}</Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="outline"
                  onClick={() => setShowPreview(false)}
                >
                  Fechar
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}