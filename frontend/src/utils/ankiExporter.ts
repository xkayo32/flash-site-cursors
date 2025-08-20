// Utilitário para exportar/importar flashcards em formato compatível com Anki

export interface AnkiNote {
  id: string;
  modelName: string;
  fields: {
    Front: string;
    Back: string;
    Extra?: string;
    Header?: string;
    Source?: string;
    Tags?: string;
  };
  tags: string[];
  type: number; // 0: Basic, 1: Basic (reversed), 2: Cloze
}

export interface AnkiDeck {
  name: string;
  desc: string;
  cards: AnkiCard[];
  notes: AnkiNote[];
  media: AnkiMedia[];
}

export interface AnkiCard {
  id: string;
  nid: string; // Note ID
  ord: number; // Order for cards from same note
  type: number;
  queue: number;
  due: number;
  ivl: number;
  factor: number;
  reps: number;
  lapses: number;
  left: number;
}

export interface AnkiMedia {
  filename: string;
  data: string; // Base64
}

export interface ExportOptions {
  includeSRS?: boolean; // Include spaced repetition data
  includeMedia?: boolean; // Include images
  format?: 'anki' | 'json' | 'csv';
}

class AnkiExporter {
  // Converter nosso formato para formato Anki
  convertToAnkiFormat(flashcards: any[], deckName: string = 'Exported Deck'): AnkiDeck {
    const ankiDeck: AnkiDeck = {
      name: deckName,
      desc: `Deck exported from StudyPro on ${new Date().toISOString()}`,
      cards: [],
      notes: [],
      media: []
    };

    flashcards.forEach((card, index) => {
      // Determinar tipo do modelo Anki
      let modelName = 'Basic';
      let noteType = 0;
      
      if (card.type === 'cloze') {
        modelName = 'Cloze';
        noteType = 2;
      } else if (card.type === 'basic_inverted') {
        modelName = 'Basic (and reversed card)';
        noteType = 1;
      }

      // Criar nota Anki
      const note: AnkiNote = {
        id: `n${Date.now()}_${index}`,
        modelName,
        fields: {
          Front: this.processField(card.front || card.question || ''),
          Back: this.processField(card.back || card.answer || ''),
          Extra: card.extra || card.explanation || '',
          Header: card.header || '',
          Source: card.source || '',
          Tags: (card.tags || []).join(' ')
        },
        tags: card.tags || [],
        type: noteType
      };

      ankiDeck.notes.push(note);

      // Criar card(s) para a nota
      if (noteType === 1) {
        // Basic reversed - criar 2 cards
        ankiDeck.cards.push(this.createCard(note.id, 0));
        ankiDeck.cards.push(this.createCard(note.id, 1));
      } else if (noteType === 2 && card.clozeNumber) {
        // Cloze - criar um card para cada cloze
        ankiDeck.cards.push(this.createCard(note.id, card.clozeNumber - 1));
      } else {
        // Basic - criar 1 card
        ankiDeck.cards.push(this.createCard(note.id, 0));
      }

      // Processar mídia (imagens)
      if (card.images && card.images.length > 0) {
        card.images.forEach((img: string, imgIndex: number) => {
          if (img.startsWith('data:')) {
            const filename = `img_${note.id}_${imgIndex}.png`;
            ankiDeck.media.push({
              filename,
              data: img.split(',')[1] // Remove data:image/png;base64,
            });
            
            // Adicionar referência da imagem no campo
            note.fields.Extra += `\n<img src="${filename}">`;
          }
        });
      }
    });

    return ankiDeck;
  }

  // Processar campo para formato Anki
  private processField(field: string): string {
    // Converter nosso formato de cloze {{c1::text}} para formato Anki
    // No Anki real seria processado diferente, mas mantemos compatível
    return field;
  }

  // Criar um card Anki
  private createCard(noteId: string, order: number): AnkiCard {
    return {
      id: `c${Date.now()}_${order}`,
      nid: noteId,
      ord: order,
      type: 0, // 0: new, 1: learning, 2: review
      queue: 0, // 0: new
      due: 0,
      ivl: 0,
      factor: 2500, // Default ease factor
      reps: 0,
      lapses: 0,
      left: 0
    };
  }

  // Exportar para JSON
  exportToJSON(flashcards: any[], deckName?: string): string {
    const ankiDeck = this.convertToAnkiFormat(flashcards, deckName);
    return JSON.stringify(ankiDeck, null, 2);
  }

  // Exportar para CSV
  exportToCSV(flashcards: any[]): string {
    const headers = ['Front', 'Back', 'Tags', 'Type', 'Extra', 'Header', 'Source'];
    const rows = flashcards.map(card => {
      return [
        this.escapeCSV(card.front || card.question || ''),
        this.escapeCSV(card.back || card.answer || ''),
        this.escapeCSV((card.tags || []).join(', ')),
        card.type || 'basic',
        this.escapeCSV(card.extra || ''),
        this.escapeCSV(card.header || ''),
        this.escapeCSV(card.source || '')
      ];
    });

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  // Escapar valores CSV
  private escapeCSV(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  // Criar arquivo para download
  downloadFile(content: string, filename: string, type: string = 'application/json') {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Exportar deck
  async exportDeck(flashcards: any[], deckName: string, options: ExportOptions = {}) {
    const format = options.format || 'json';
    
    if (format === 'json') {
      const content = this.exportToJSON(flashcards, deckName);
      const filename = `${deckName.replace(/\s+/g, '_')}_${Date.now()}.json`;
      this.downloadFile(content, filename);
    } else if (format === 'csv') {
      const content = this.exportToCSV(flashcards);
      const filename = `${deckName.replace(/\s+/g, '_')}_${Date.now()}.csv`;
      this.downloadFile(content, filename, 'text/csv');
    } else if (format === 'anki') {
      // Para formato .apkg real, precisaríamos criar um ZIP com SQLite
      // Por enquanto, exportamos como JSON compatível
      const content = this.exportToJSON(flashcards, deckName);
      const filename = `${deckName.replace(/\s+/g, '_')}_${Date.now()}.ankijson`;
      this.downloadFile(content, filename);
    }
  }
}

// Importador
class AnkiImporter {
  // Importar de JSON
  async importFromJSON(jsonContent: string): Promise<any[]> {
    try {
      const ankiDeck: AnkiDeck = JSON.parse(jsonContent);
      return this.convertFromAnkiFormat(ankiDeck);
    } catch (error) {
      throw new Error('Invalid JSON format');
    }
  }

  // Importar de CSV
  async importFromCSV(csvContent: string): Promise<any[]> {
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',');
    
    const flashcards = [];
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const values = this.parseCSVLine(lines[i]);
      const card: any = {
        id: `imported_${Date.now()}_${i}`,
        type: 'basic',
        front: values[0] || '',
        back: values[1] || '',
        tags: values[2] ? values[2].split(', ') : [],
        extra: values[4] || '',
        header: values[5] || '',
        source: values[6] || ''
      };
      
      if (values[3]) {
        card.type = values[3];
      }
      
      flashcards.push(card);
    }
    
    return flashcards;
  }

  // Parse linha CSV considerando aspas
  private parseCSVLine(line: string): string[] {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];
      
      if (char === '"' && nextChar === '"' && inQuotes) {
        current += '"';
        i++; // Skip next quote
      } else if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current);
    return result;
  }

  // Converter formato Anki para nosso formato
  private convertFromAnkiFormat(ankiDeck: AnkiDeck): any[] {
    const flashcards: any[] = [];
    
    ankiDeck.notes.forEach(note => {
      const card: any = {
        id: note.id,
        type: this.getCardType(note.type, note.modelName),
        front: note.fields.Front,
        back: note.fields.Back,
        extra: note.fields.Extra,
        header: note.fields.Header,
        source: note.fields.Source,
        tags: note.tags,
        difficulty: 'medium',
        created_at: new Date().toISOString()
      };
      
      // Processar imagens da mídia
      if (note.fields.Extra && ankiDeck.media.length > 0) {
        const imgMatches = note.fields.Extra.match(/<img src="([^"]+)">/g);
        if (imgMatches) {
          card.images = [];
          imgMatches.forEach(match => {
            const filename = match.match(/src="([^"]+)"/)?.[1];
            if (filename) {
              const media = ankiDeck.media.find(m => m.filename === filename);
              if (media) {
                card.images.push(`data:image/png;base64,${media.data}`);
              }
            }
          });
        }
      }
      
      flashcards.push(card);
    });
    
    return flashcards;
  }

  // Obter tipo do card baseado no modelo Anki
  private getCardType(noteType: number, modelName: string): string {
    if (noteType === 2 || modelName.toLowerCase().includes('cloze')) {
      return 'cloze';
    } else if (noteType === 1 || modelName.toLowerCase().includes('reversed')) {
      return 'basic_inverted';
    }
    return 'basic';
  }

  // Importar arquivo
  async importFile(file: File): Promise<any[]> {
    const content = await this.readFile(file);
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    if (extension === 'json' || extension === 'ankijson') {
      return this.importFromJSON(content);
    } else if (extension === 'csv') {
      return this.importFromCSV(content);
    } else {
      throw new Error('Unsupported file format. Use JSON or CSV.');
    }
  }

  // Ler arquivo
  private readFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }
}

// Exportar instâncias
export const ankiExporter = new AnkiExporter();
export const ankiImporter = new AnkiImporter();