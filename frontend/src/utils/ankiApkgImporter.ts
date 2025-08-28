// Utilitário para importar flashcards do Anki (.apkg)
import JSZip from 'jszip';
import initSqlJs, { Database } from 'sql.js';

class AnkiApkgImporter {
  constructor() {
    // Versão simplificada sem JSZip para evitar problemas de compatibilidade
  }

  // Limpar formatação HTML de campos do Anki
  private cleanHtml(text: string): string {
    if (!text) return '';
    
    // Remover tags HTML comuns do Anki
    let cleaned = text
      // Remover divs e spans
      .replace(/<\/?div[^>]*>/gi, '')
      .replace(/<\/?span[^>]*>/gi, '')
      // Converter entidades HTML
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&quot;/gi, '"')
      // Remover espaços múltiplos
      .replace(/\s+/g, ' ')
      .trim();
    
    return cleaned;
  }

  // Converter campos Anki para nosso formato
  private parseAnkiFields(fields: string): { front: string; back: string; extra?: string } {
    const parts = fields.split('\x1f'); // Anki usa \x1f como separador de campos
    return {
      front: this.cleanHtml(parts[0] || ''),
      back: this.cleanHtml(parts[1] || ''),
      extra: parts.slice(2).map(p => this.cleanHtml(p)).join(' ')
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
        return await this.importApkgFile(file);
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

  // Importar arquivo .apkg real do Anki
  async importApkgFile(file: File): Promise<any[]> {
    try {
      console.log('Iniciando importação de arquivo .apkg:', file.name);
      
      // Ler o arquivo como ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      
      // Descompactar o arquivo .apkg (é um ZIP)
      const zip = await JSZip.loadAsync(arrayBuffer);
      
      console.log('Arquivo .apkg descompactado, arquivos encontrados:', Object.keys(zip.files));
      
      // Procurar pelo arquivo collection.anki21 ou collection.anki2
      let collectionFile = zip.files['collection.anki21'] || zip.files['collection.anki2'];
      
      if (!collectionFile) {
        throw new Error('Arquivo de coleção não encontrado no .apkg');
      }
      
      console.log('Arquivo de coleção encontrado:', collectionFile.name);
      
      // Ler o arquivo SQLite
      const dbData = await collectionFile.async('uint8array');
      
      console.log('Inicializando SQL.js...');
      const SQL = await initSqlJs({
        locateFile: (file) => `https://sql.js.org/dist/${file}`
      });
      
      console.log('Abrindo banco de dados Anki...');
      const db = new SQL.Database(dbData);
      
      // Extrair os dados reais do banco
      const flashcards = await this.extractRealAnkiData(db);
      
      // Fechar o banco
      db.close();
      
      console.log(`Importação real concluída: ${flashcards.length} flashcards extraídos`);
      return flashcards;
      
    } catch (error) {
      console.error('Erro ao importar arquivo .apkg:', error);
      throw new Error(`Erro ao processar arquivo .apkg: ${error.message}`);
    }
  }

  // Extrair dados reais do banco SQLite do Anki
  private async extractRealAnkiData(db: Database): Promise<any[]> {
    try {
      console.log('Extraindo dados reais do banco Anki...');
      
      // Primeiro, vamos ver que tabelas existem
      const tablesResult = db.exec("SELECT name FROM sqlite_master WHERE type='table'");
      console.log('Tabelas encontradas:', tablesResult);
      
      // Buscar todas as notas (notes) - contêm o conteúdo dos flashcards
      const notesResult = db.exec(`
        SELECT id, flds, tags, mid
        FROM notes 
        LIMIT 50
      `);
      
      console.log('Query de notes executada:', notesResult);
      
      if (!notesResult || notesResult.length === 0) {
        // Tentar query mais simples
        const simpleNotesResult = db.exec("SELECT * FROM notes LIMIT 10");
        console.log('Query simples de notes:', simpleNotesResult);
        
        if (!simpleNotesResult || simpleNotesResult.length === 0) {
          throw new Error('Nenhuma nota encontrada no banco de dados');
        }
        
        // Processar dados da query simples
        return this.processSimpleNotes(simpleNotesResult[0]);
      }
      
      // Processar as notas encontradas
      const flashcards: any[] = [];
      const notesData = notesResult[0];
      
      console.log(`Processando ${notesData.values.length} notas...`);
      
      for (const row of notesData.values) {
        try {
          const flashcard = this.convertAnkiNoteToFlashcard(row, notesData.columns);
          if (flashcard) {
            flashcards.push(flashcard);
          }
        } catch (error) {
          console.warn('Erro ao processar nota:', error);
          continue;
        }
      }
      
      return flashcards;
      
    } catch (error) {
      console.error('Erro ao extrair dados do banco:', error);
      
      // Fallback: tentar extrair dados básicos
      try {
        const basicResult = db.exec("SELECT * FROM notes LIMIT 5");
        if (basicResult && basicResult.length > 0) {
          console.log('Usando extração básica como fallback...');
          return this.processSimpleNotes(basicResult[0]);
        }
      } catch (fallbackError) {
        console.error('Erro no fallback:', fallbackError);
      }
      
      throw new Error(`Erro ao processar banco Anki: ${error.message}`);
    }
  }
  
  // Processar notas de forma simples
  private processSimpleNotes(notesData: any): any[] {
    const flashcards: any[] = [];
    
    console.log('Processando notas simples:', notesData);
    console.log('Colunas:', notesData.columns);
    console.log('Primeira linha de exemplo:', notesData.values[0]);
    
    for (let i = 0; i < Math.min(notesData.values.length, 20); i++) {
      const row = notesData.values[i];
      
      try {
        console.log(`Processando linha ${i}:`, row);
        
        // Encontrar índices das colunas
        const fldsIndex = notesData.columns.indexOf('flds');
        const tagsIndex = notesData.columns.indexOf('tags');
        const idIndex = notesData.columns.indexOf('id');
        
        // Extrair campos usando os índices corretos
        const fieldsData = (fldsIndex >= 0 && row[fldsIndex] && typeof row[fldsIndex] === 'string') ? 
          row[fldsIndex].split('\x1f') : ['', ''];
        const tags = (tagsIndex >= 0 && row[tagsIndex] && typeof row[tagsIndex] === 'string') ? 
          row[tagsIndex].split(' ').filter(tag => tag.length > 0) : [];
        const noteId = idIndex >= 0 ? row[idIndex] : i;
        
        // Limpar HTML dos campos
        const cleanedFields = fieldsData.map(field => this.cleanHtml(field));
        
        // Detectar se é cloze ou básico
        const isClozeDeletion = cleanedFields[0] && cleanedFields[0].includes('{{c1::');
        
        if (isClozeDeletion) {
          flashcards.push({
            type: 'cloze',
            difficulty: 'medium',
            category: tags[0] || 'Anki Import',
            text: cleanedFields[0],
            tags: tags,
            source: `Anki - Note ${noteId}`
          });
        } else {
          flashcards.push({
            type: 'basic',
            difficulty: 'medium', 
            category: tags[0] || 'Anki Import',
            front: cleanedFields[0] || 'Frente não encontrada',
            back: cleanedFields[1] || 'Verso não encontrado',
            tags: tags,
            source: `Anki - Note ${noteId}`
          });
        }
      } catch (error) {
        console.warn(`Erro ao processar linha ${i}:`, error);
        continue;
      }
    }
    
    return flashcards;
  }
  
  // Converter nota do Anki para formato do sistema
  private convertAnkiNoteToFlashcard(row: any[], columns: string[]): any | null {
    try {
      const noteData = {};
      columns.forEach((col, index) => {
        noteData[col] = row[index];
      });
      
      const fields = noteData['flds'] ? noteData['flds'].split('\x1f') : [];
      const tags = noteData['tags'] ? noteData['tags'].split(' ').filter(tag => tag.length > 0) : [];
      
      // Limpar HTML dos campos
      const cleanedFields = fields.map(field => this.cleanHtml(field));
      
      // Detectar tipo de card baseado no conteúdo
      const isClozeDeletion = cleanedFields[0] && cleanedFields[0].includes('{{c1::');
      
      if (isClozeDeletion) {
        return {
          type: 'cloze',
          difficulty: 'medium',
          category: tags[0] || 'Anki Import',
          text: cleanedFields[0],
          tags: tags,
          source: `Anki - Note ${noteData['id']}`
        };
      } else {
        return {
          type: 'basic',
          difficulty: 'medium',
          category: tags[0] || 'Anki Import', 
          front: cleanedFields[0] || 'Campo frontal vazio',
          back: cleanedFields[1] || 'Campo traseiro vazio',
          tags: tags,
          source: `Anki - Note ${noteData['id']}`
        };
      }
    } catch (error) {
      console.error('Erro ao converter nota:', error);
      return null;
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