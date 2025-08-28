import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Plus,
  X,
  Package,
  Loader2,
  Check
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { categoryService, Category } from '@/services/categoryService';
import { flashcardDeckService } from '@/services/flashcardDeckService';
import { flashcardService } from '@/services/flashcardService';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';

export default function NewFlashcardDeckSimple() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  
  // Form data simplificado
  const [deckName, setDeckName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedFlashcards, setSelectedFlashcards] = useState<string[]>([]);
  
  // Dados auxiliares
  const [categories, setCategories] = useState<Category[]>([]);
  const [availableFlashcards, setAvailableFlashcards] = useState<any[]>([]);
  
  // Carregar categorias
  useEffect(() => {
    loadCategories();
    loadFlashcards();
  }, []);
  
  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await categoryService.getCategoryHierarchy();
      setCategories(response);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      toast.error('Erro ao carregar categorias');
    } finally {
      setLoadingCategories(false);
    }
  };
  
  const loadFlashcards = async () => {
    try {
      const response = await flashcardService.getFlashcards({ 
        limit: 1000,
        status: 'published' 
      });
      if (response.success && response.data) {
        setAvailableFlashcards(response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar flashcards:', error);
    }
  };
  
  const handleSave = async () => {
    // Validação
    if (!deckName.trim()) {
      toast.error('Digite o nome do deck');
      return;
    }
    
    if (!selectedCategory) {
      toast.error('Selecione uma categoria');
      return;
    }
    
    if (selectedFlashcards.length === 0) {
      toast.error('Selecione pelo menos um flashcard');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Criar deck - backend espera 'subject' ao invés de 'category'
      const deckData: any = {
        name: deckName,
        description: `Deck criado por ${user?.name || 'Admin'}`,
        category: selectedCategory,
        subject: selectedCategory, // Backend usa 'subject'
        flashcard_ids: selectedFlashcards,
        is_public: true
      };
      
      console.log('Criando deck com dados:', deckData);
      const response = await flashcardDeckService.createDeck(deckData);
      console.log('Resposta da API:', response);
      
      if (response.success) {
        toast.success('Deck criado com sucesso!');
        navigate('/admin/flashcards');
      } else {
        console.error('Falha ao criar deck:', response);
        toast.error(response.message || 'Erro ao criar deck');
      }
    } catch (error) {
      console.error('Erro ao salvar deck:', error);
      toast.error('Erro ao salvar deck');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Filtrar flashcards por categoria
  const filteredFlashcards = selectedCategory 
    ? availableFlashcards.filter(fc => fc.category === selectedCategory)
    : availableFlashcards;
  
  // Renderizar lista plana de categorias
  const flattenCategories = (cats: Category[]): { id: string; name: string; level: number }[] => {
    const result: { id: string; name: string; level: number }[] = [];
    
    const traverse = (cat: Category, level = 0) => {
      result.push({ 
        id: cat.id, 
        name: `${'  '.repeat(level)}${level > 0 ? '└─ ' : ''}${cat.name}`,
        level 
      });
      if (cat.children) {
        cat.children.forEach(child => traverse(child, level + 1));
      }
    };
    
    cats.forEach(cat => traverse(cat, 0));
    return result;
  };
  
  const flatCategories = flattenCategories(categories);
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 via-[#14242f] to-gray-900 text-white border-b-4 border-accent-500">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => navigate('/admin/flashcards')}
                variant="ghost"
                className="text-white hover:text-accent-500"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                VOLTAR
              </Button>
              <div>
                <h1 className="text-2xl font-police-title uppercase tracking-wider">
                  CRIAR NOVO DECK
                </h1>
                <p className="text-sm text-gray-300 font-police-subtitle">
                  Configure um novo deck de flashcards
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="border-2 border-gray-200 dark:border-gray-700">
          <CardHeader className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <CardTitle className="font-police-title uppercase tracking-wider flex items-center gap-2">
              <Package className="w-5 h-5 text-accent-500" />
              CONFIGURAÇÃO DO DECK
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-6 space-y-6">
            {/* Nome do Deck */}
            <div>
              <label className="block text-sm font-police-subtitle uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                Nome do Deck *
              </label>
              <input
                type="text"
                value={deckName}
                onChange={(e) => setDeckName(e.target.value)}
                placeholder="Ex: Direito Constitucional - Básico"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
              />
            </div>
            
            {/* Categoria */}
            <div>
              <label className="block text-sm font-police-subtitle uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                Categoria *
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
              >
                <option value="">Selecione uma categoria</option>
                {flatCategories.map(cat => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Seleção de Flashcards */}
            <div>
              <label className="block text-sm font-police-subtitle uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                Flashcards ({selectedFlashcards.length} selecionados)
              </label>
              
              <div className="max-h-96 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-800">
                {filteredFlashcards.length === 0 ? (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                    {selectedCategory 
                      ? 'Nenhum flashcard disponível nesta categoria'
                      : 'Selecione uma categoria primeiro'}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {filteredFlashcards.map((flashcard) => (
                      <label
                        key={flashcard.id}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedFlashcards.includes(flashcard.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedFlashcards([...selectedFlashcards, flashcard.id]);
                            } else {
                              setSelectedFlashcards(selectedFlashcards.filter(id => id !== flashcard.id));
                            }
                          }}
                          className="mt-1 w-4 h-4 text-accent-500 rounded border-gray-300 focus:ring-accent-500"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              {flashcard.type}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                flashcard.difficulty === 'easy' ? 'text-green-600' :
                                flashcard.difficulty === 'medium' ? 'text-yellow-600' :
                                'text-red-600'
                              }`}
                            >
                              {flashcard.difficulty}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {flashcard.front || flashcard.question || flashcard.text || 'Sem conteúdo'}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              
              {selectedFlashcards.length > 0 && (
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedFlashcards.length} flashcard(s) selecionado(s)
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedFlashcards([])}
                    className="text-red-500 hover:text-red-600"
                  >
                    Limpar seleção
                  </Button>
                </div>
              )}
            </div>
            
            {/* Botões de Ação */}
            <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                onClick={() => navigate('/admin/flashcards')}
                variant="outline"
                disabled={isLoading}
              >
                <X className="w-4 h-4 mr-2" />
                CANCELAR
              </Button>
              
              <Button
                onClick={handleSave}
                className="bg-accent-500 hover:bg-accent-600 text-black"
                disabled={isLoading || !deckName || !selectedCategory || selectedFlashcards.length === 0}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    SALVANDO...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    CRIAR DECK
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}