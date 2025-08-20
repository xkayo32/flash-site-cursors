import React, { useState, useRef, DragEvent } from 'react';
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

interface ImageUploaderProps {
  value: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  maxSizeInMB?: number;
  acceptedFormats?: string[];
  onUpload?: (file: File) => Promise<string>;
}

export default function ImageUploader({
  value = [],
  onChange,
  maxImages = 5,
  maxSizeInMB = 5,
  acceptedFormats = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  onUpload
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Processar arquivos selecionados ou arrastados
  const processFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    // Validações
    if (value.length + fileArray.length > maxImages) {
      toast.error(`Máximo de ${maxImages} imagens permitidas`);
      return;
    }

    const validFiles = fileArray.filter(file => {
      // Verificar formato
      if (!acceptedFormats.includes(file.type)) {
        toast.error(`${file.name}: Formato não suportado. Use JPG, PNG, GIF ou WebP`);
        return false;
      }
      
      // Verificar tamanho
      const sizeInMB = file.size / (1024 * 1024);
      if (sizeInMB > maxSizeInMB) {
        toast.error(`${file.name}: Arquivo muito grande (máx: ${maxSizeInMB}MB)`);
        return false;
      }
      
      return true;
    });

    if (validFiles.length === 0) return;

    setUploading(true);
    const newImages: string[] = [];

    for (const file of validFiles) {
      try {
        let imageUrl: string;
        
        if (onUpload) {
          // Upload para servidor
          setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
          imageUrl = await onUpload(file);
          setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
        } else {
          // Converter para base64 (fallback)
          imageUrl = await fileToBase64(file);
        }
        
        newImages.push(imageUrl);
        
        // Limpar progresso após 1 segundo
        setTimeout(() => {
          setUploadProgress(prev => {
            const updated = { ...prev };
            delete updated[file.name];
            return updated;
          });
        }, 1000);
      } catch (error) {
        console.error('Erro ao fazer upload:', error);
        toast.error(`Erro ao fazer upload de ${file.name}`);
        setUploadProgress(prev => {
          const updated = { ...prev };
          delete updated[file.name];
          return updated;
        });
      }
    }

    if (newImages.length > 0) {
      onChange([...value, ...newImages]);
      toast.success(`${newImages.length} imagem(ns) adicionada(s)!`);
    }
    
    setUploading(false);
  };

  // Converter arquivo para base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Handlers de drag & drop
  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await processFiles(files);
    }
  };

  // Handler de seleção de arquivo
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await processFiles(files);
    }
    // Limpar input para permitir selecionar o mesmo arquivo novamente
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Remover imagem
  const removeImage = (index: number) => {
    const newImages = value.filter((_, i) => i !== index);
    onChange(newImages);
    toast.success('Imagem removida');
  };

  // Colar imagem da área de transferência
  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    const imageItems = Array.from(items).filter(item => item.type.startsWith('image/'));
    
    if (imageItems.length > 0) {
      const files = imageItems.map(item => item.getAsFile()).filter(Boolean) as File[];
      if (files.length > 0) {
        await processFiles(files);
      }
    }
  };

  return (
    <div className="space-y-4" onPaste={handlePaste}>
      {/* Área de Upload */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 transition-all duration-200
          ${isDragging 
            ? 'border-accent-500 bg-accent-50 dark:bg-accent-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-accent-400'
          }
          ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFormats.join(',')}
          multiple
          className="hidden"
          onChange={handleFileSelect}
          disabled={uploading}
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          {uploading ? (
            <Loader2 className="w-10 h-10 text-accent-500 animate-spin" />
          ) : isDragging ? (
            <Upload className="w-10 h-10 text-accent-500 animate-bounce" />
          ) : (
            <ImageIcon className="w-10 h-10 text-gray-400" />
          )}
          
          <div className="text-center">
            <p className="text-sm font-police-subtitle uppercase tracking-wider text-gray-700 dark:text-gray-300 font-semibold">
              {uploading ? 'FAZENDO UPLOAD...' : isDragging ? 'SOLTE PARA ADICIONAR' : 'ADICIONAR IMAGENS'}
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 font-police-body">
              Arraste imagens ou clique para selecionar
            </p>
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500 font-police-body">
              Máx: {maxImages} imagens • {maxSizeInMB}MB cada • JPG, PNG, GIF, WebP
            </p>
            <p className="mt-2 text-xs text-accent-600 dark:text-accent-400 font-police-body">
              💡 Dica: Você também pode colar imagens com Ctrl+V
            </p>
          </div>
        </div>

        {/* Progress bars */}
        {Object.entries(uploadProgress).length > 0 && (
          <div className="mt-4 space-y-2">
            {Object.entries(uploadProgress).map(([filename, progress]) => (
              <div key={filename} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400 truncate">{filename}</span>
                  <span className="text-gray-600 dark:text-gray-400">{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <div 
                    className="bg-accent-500 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Grid de Imagens */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {value.map((image, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <img
                  src={image}
                  alt={`Imagem ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Overlay com botão de remover */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(index);
                  }}
                  className="flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Remover
                </Button>
              </div>
              
              {/* Badge de número */}
              <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-police-numbers">
                #{index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Contador de imagens */}
      {value.length > 0 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400 font-police-body">
            {value.length} de {maxImages} imagens
          </span>
          {value.length === maxImages && (
            <span className="text-accent-600 dark:text-accent-400 font-police-body flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              Limite máximo atingido
            </span>
          )}
        </div>
      )}
    </div>
  );
}