import React, { useState, useRef } from 'react';
import { 
  Download, 
  Upload, 
  FileJson,
  FileText,
  Package,
  AlertCircle,
  CheckCircle,
  Loader2,
  Info,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ankiExporter, ankiImporter, ExportOptions } from '@/utils/ankiExporter';
import { exportToApkg } from '@/utils/ankiApkgExporter';
import { importFromApkg } from '@/utils/ankiApkgImporter';
import toast from 'react-hot-toast';

interface AnkiImportExportProps {
  flashcards?: any[];
  deckName?: string;
  onImport?: (flashcards: any[]) => void;
  onExport?: () => void;
  showImport?: boolean;
  showExport?: boolean;
}

export default function AnkiImportExport({
  flashcards = [],
  deckName = 'My Deck',
  onImport,
  onExport,
  showImport = true,
  showExport = true
}: AnkiImportExportProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'anki' | 'apkg'>('json');
  const [importPreview, setImportPreview] = useState<any[] | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Exportar deck
  const handleExport = async () => {
    if (flashcards.length === 0) {
      toast.error('Não há flashcards para exportar');
      return;
    }

    setIsExporting(true);
    try {
      if (exportFormat === 'apkg') {
        // Exportar para formato .apkg real
        await exportToApkg(flashcards, deckName);
        toast.success(`${flashcards.length} flashcards exportados para .apkg com sucesso!`);
      } else {
        // Exportar para outros formatos
        const options: ExportOptions = {
          format: exportFormat as 'json' | 'csv' | 'anki',
          includeMedia: true,
          includeSRS: true
        };

        await ankiExporter.exportDeck(flashcards, deckName, options);
        toast.success(`${flashcards.length} flashcards exportados com sucesso!`);
      }
      
      onExport?.();
    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast.error('Erro ao exportar flashcards');
    } finally {
      setIsExporting(false);
    }
  };

  // Importar arquivo
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      let imported: any[] = [];
      const extension = file.name.split('.').pop()?.toLowerCase();
      
      if (extension === 'apkg') {
        // Importar arquivo .apkg
        imported = await importFromApkg(file);
      } else {
        // Importar outros formatos
        imported = await ankiImporter.importFile(file);
      }
      
      if (imported.length > 0) {
        setImportPreview(imported);
        setShowPreviewModal(true);
      } else {
        toast.error('Nenhum flashcard encontrado no arquivo');
      }
    } catch (error) {
      console.error('Erro ao importar:', error);
      toast.error('Erro ao importar arquivo. Verifique o formato.');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Confirmar importação
  const confirmImport = () => {
    if (importPreview) {
      onImport?.(importPreview);
      toast.success(`${importPreview.length} flashcards importados com sucesso!`);
      setShowPreviewModal(false);
      setImportPreview(null);
    }
  };

  // Cancelar importação
  const cancelImport = () => {
    setShowPreviewModal(false);
    setImportPreview(null);
  };

  return (
    <div className="space-y-6">
      {/* Seção de Exportação */}
      {showExport && (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <Download className="w-6 h-6 text-accent-500" />
            <h3 className="font-police-subtitle uppercase tracking-wider text-gray-900 dark:text-white font-semibold text-lg">
              EXPORTAR FLASHCARDS
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-police-body mb-3">
                Exporte seus flashcards para usar no Anki ou fazer backup.
              </p>
              
              {flashcards.length > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="outline" className="font-police-numbers">
                    {flashcards.length} cards
                  </Badge>
                  <Badge variant="secondary" className="font-police-body">
                    {deckName}
                  </Badge>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-police-body font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                FORMATO DE EXPORTAÇÃO
              </label>
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => setExportFormat('json')}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    exportFormat === 'json'
                      ? 'border-accent-500 bg-accent-50 dark:bg-accent-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-accent-300'
                  }`}
                >
                  <FileJson className="w-6 h-6 mx-auto mb-1 text-accent-600" />
                  <span className="text-xs font-police-body uppercase">JSON</span>
                </button>
                
                <button
                  onClick={() => setExportFormat('csv')}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    exportFormat === 'csv'
                      ? 'border-accent-500 bg-accent-50 dark:bg-accent-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-accent-300'
                  }`}
                >
                  <FileText className="w-6 h-6 mx-auto mb-1 text-green-600" />
                  <span className="text-xs font-police-body uppercase">CSV</span>
                </button>
                
                <button
                  onClick={() => setExportFormat('anki')}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    exportFormat === 'anki'
                      ? 'border-accent-500 bg-accent-50 dark:bg-accent-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-accent-300'
                  }`}
                >
                  <Package className="w-6 h-6 mx-auto mb-1 text-blue-600" />
                  <span className="text-xs font-police-body uppercase">ANKI</span>
                </button>
                
                <button
                  onClick={() => setExportFormat('apkg')}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    exportFormat === 'apkg'
                      ? 'border-accent-500 bg-accent-50 dark:bg-accent-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-accent-300'
                  }`}
                >
                  <Package className="w-6 h-6 mx-auto mb-1 text-purple-600" />
                  <span className="text-xs font-police-body uppercase">.APKG</span>
                </button>
              </div>
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex gap-2">
                <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-blue-700 dark:text-blue-300 font-police-body">
                  <p className="font-semibold mb-1">Formatos disponíveis:</p>
                  <ul className="space-y-1 ml-2">
                    <li>• <strong>JSON:</strong> Formato completo com todos os dados</li>
                    <li>• <strong>CSV:</strong> Compatível com Excel/Google Sheets</li>
                    <li>• <strong>ANKI:</strong> JSON compatível com estrutura Anki</li>
                    <li>• <strong>.APKG:</strong> Formato nativo do Anki (importação direta)</li>
                  </ul>
                </div>
              </div>
            </div>

            <Button
              onClick={handleExport}
              disabled={isExporting || flashcards.length === 0}
              className="w-full bg-accent-500 hover:bg-accent-600 text-black font-police-subtitle uppercase tracking-wider"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  EXPORTANDO...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  EXPORTAR {flashcards.length} FLASHCARDS
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Seção de Importação */}
      {showImport && (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <Upload className="w-6 h-6 text-accent-500" />
            <h3 className="font-police-subtitle uppercase tracking-wider text-gray-900 dark:text-white font-semibold text-lg">
              IMPORTAR FLASHCARDS
            </h3>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 font-police-body">
              Importe flashcards de arquivos JSON ou CSV.
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.csv,.ankijson,.apkg"
              onChange={handleFileSelect}
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-accent-400 transition-colors"
            >
              <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-sm font-police-subtitle uppercase tracking-wider text-gray-700 dark:text-gray-300 font-semibold mb-1">
                CLIQUE PARA SELECIONAR ARQUIVO
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-police-body">
                Formatos aceitos: JSON, CSV, ANKIJSON, APKG
              </p>
            </div>

            {isImporting && (
              <div className="flex items-center justify-center gap-2 text-accent-600 dark:text-accent-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm font-police-body">Importando flashcards...</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Preview da Importação */}
      {showPreviewModal && importPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="font-police-subtitle uppercase tracking-wider text-gray-900 dark:text-white font-semibold text-lg">
                  PREVIEW DA IMPORTAÇÃO
                </h3>
                <button
                  onClick={cancelImport}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[50vh]">
              <div className="mb-4">
                <Badge variant="success" className="font-police-numbers">
                  {importPreview.length} flashcards encontrados
                </Badge>
              </div>

              <div className="space-y-3">
                {importPreview.slice(0, 5).map((card, index) => (
                  <div key={index} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="outline" className="text-xs">
                        #{index + 1}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {card.type || 'basic'}
                      </Badge>
                    </div>
                    <p className="text-sm font-police-body text-gray-900 dark:text-white mb-1">
                      <strong>Frente:</strong> {card.front?.substring(0, 100)}
                      {card.front?.length > 100 && '...'}
                    </p>
                    <p className="text-sm font-police-body text-gray-600 dark:text-gray-400">
                      <strong>Verso:</strong> {card.back?.substring(0, 100)}
                      {card.back?.length > 100 && '...'}
                    </p>
                    {card.tags?.length > 0 && (
                      <div className="mt-2 flex gap-1">
                        {card.tags.slice(0, 3).map((tag: string, i: number) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                
                {importPreview.length > 5 && (
                  <p className="text-center text-sm text-gray-500 dark:text-gray-400 font-police-body">
                    ... e mais {importPreview.length - 5} flashcards
                  </p>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-3">
                <Button
                  onClick={confirmImport}
                  className="flex-1 bg-accent-500 hover:bg-accent-600 text-black font-police-subtitle uppercase tracking-wider"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  IMPORTAR TODOS
                </Button>
                <Button
                  onClick={cancelImport}
                  variant="outline"
                  className="flex-1 font-police-subtitle uppercase tracking-wider"
                >
                  CANCELAR
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}