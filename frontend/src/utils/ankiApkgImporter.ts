// Utilitário para importar flashcards (versão simplificada sem JSZip)
class AnkiApkgImporter {
  constructor() {
    // Versão simplificada sem JSZip para evitar problemas de compatibilidade
  }

  // Converter campos Anki para nosso formato
  private parseAnkiFields(fields: string): { front: string; back: string; extra?: string } {
    const parts = fields.split('\x1f'); // Anki usa \x1f como separador de campos
    return {
      front: parts[0] || '',
      back: parts[1] || '',
      extra: parts.slice(2).join(' ')
    };
  }

  // Detectar tipo de flashcard baseado no modelo Anki
  private detectCardType(modelName: string, fields: string): string {
    const lowerName = modelName.toLowerCase();
    
    if (lowerName.includes('cloze')) {
      return 'cloze';
    } else if (lowerName.includes('reverse') || lowerName.includes('inverted')) {
      return 'basic_inverted';
    } else if (fields.includes('{{c1::') || fields.includes('{{c2::')) {
      return 'cloze';
    }
    
    return 'basic';
  }

  // Processar banco de dados Anki (JSON simulado)
  private processDatabase(dbContent: string): any[] {
    try {
      const db = JSON.parse(dbContent);
      const flashcards: any[] = [];
      
      // Processar notas
      if (db.notes && Array.isArray(db.notes)) {
        db.notes.forEach((note: any) => {
          const fields = this.parseAnkiFields(note.flds || '');
          const tags = note.tags ? note.tags.split(' ').filter((t: string) => t) : [];
          
          // Detectar tipo baseado no modelo
          let modelName = 'Basic';
          if (db.col && db.col.models) {
            const models = typeof db.col.models === 'string' 
              ? JSON.parse(db.col.models) 
              : db.col.models;
            const model = Object.values(models).find((m: any) => m.id === note.mid);
            if (model && (model as any).name) {
              modelName = (model as any).name;
            }
          }
          
          const flashcard = {
            id: `imported_${note.id || Date.now()}_${Math.random()}`,
            type: this.detectCardType(modelName, fields.front),
            front: fields.front,
            back: fields.back,
            extra: fields.extra,
            tags: tags,
            difficulty: 'medium',
            created_at: new Date().toISOString()
          };
          
          flashcards.push(flashcard);
        });
      }
      
      return flashcards;
    } catch (error) {
      console.error('Error processing Anki database:', error);
      throw new Error('Invalid Anki database format');
    }
  }

  // Importar arquivo .apkg (versão simplificada - apenas JSON)
  async importApkg(file: File): Promise<any[]> {
    try {
      const extension = file.name.split('.').pop()?.toLowerCase();
      
      if (extension === 'apkg') {
        // Por enquanto, .apkg não é suportado devido a problemas com JSZip
        throw new Error('Arquivos .apkg temporariamente indisponíveis. Use formato JSON ou CSV.');
      }
      
      // Tentar ler como texto (JSON/CSV)
      const content = await file.text();
      
      if (extension === 'json') {
        return this.importJson(content);
      }
      
      throw new Error('Formato não suportado. Use JSON por enquanto.');
    } catch (error) {
      console.error('Error importing file:', error);
      throw error;
    }
  }

  // Método alternativo para importar JSON exportado pelo nosso sistema
  async importJson(content: string): Promise<any[]> {
    try {
      const data = JSON.parse(content);
      
      // Se for nosso formato de exportação
      if (data.notes && Array.isArray(data.notes)) {
        return this.processDatabase(content);
      }
      
      // Se for array direto de flashcards
      if (Array.isArray(data)) {
        return data;
      }
      
      // Se for um deck com cards
      if (data.cards && Array.isArray(data.cards)) {
        return data.cards;
      }
      
      throw new Error('Unrecognized JSON format');
    } catch (error) {
      console.error('Error importing JSON:', error);
      throw error;
    }
  }
}

// Exportar instância
export const ankiApkgImporter = new AnkiApkgImporter();

// Função auxiliar para importar
export async function importFromApkg(file: File): Promise<any[]> {
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  if (extension === 'apkg') {
    return ankiApkgImporter.importApkg(file);
  } else if (extension === 'json' || extension === 'ankijson') {
    const content = await file.text();
    return ankiApkgImporter.importJson(content);
  } else {
    throw new Error('Unsupported file format. Use .apkg or .json');
  }
}