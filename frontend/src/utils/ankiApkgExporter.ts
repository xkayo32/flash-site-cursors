// Utilitário para exportar flashcards para formato .apkg (Anki Package)
// O formato .apkg é um arquivo ZIP contendo:
// - collection.anki2 (banco SQLite)
// - media (arquivo JSON com mapeamento de mídia)
// - arquivos de mídia (0, 1, 2, etc.)

// Import dinâmico para evitar problemas com Vite

// Estrutura do banco de dados Anki
interface AnkiCollection {
  id: number;
  crt: number; // created timestamp
  mod: number; // modified timestamp
  scm: number; // schema modification time
  ver: number; // version
  dty: number; // dirty
  usn: number; // update sequence number
  ls: number; // last sync
  conf: string; // configuration JSON
  models: string; // note types JSON
  decks: string; // decks JSON
  dconf: string; // deck configuration JSON
  tags: string; // tags JSON
}

interface AnkiNote {
  id: number;
  guid: string; // globally unique id
  mid: number; // model id
  mod: number; // modification time
  usn: number; // update sequence number
  tags: string; // space-separated tags
  flds: string; // field values, separated by \x1f
  sfld: string; // sort field
  csum: number; // checksum of first field
  flags: number; // unused
  data: string; // unused
}

interface AnkiCard {
  id: number;
  nid: number; // note id
  did: number; // deck id
  ord: number; // ordinal (which card of the note)
  mod: number; // modification time
  usn: number; // update sequence number
  type: number; // 0=new, 1=learning, 2=review
  queue: number; // -3=sched buried, -2=user buried, -1=suspended, 0=new, 1=learning, 2=review, 3=in learning, 4=preview
  due: number; // due date
  ivl: number; // interval
  factor: number; // ease factor
  reps: number; // number of reviews
  lapses: number; // number of lapses
  left: number; // reps left today
  odue: number; // original due
  odid: number; // original deck id
  flags: number; // unused
  data: string; // unused
}

class AnkiApkgExporter {
  private zip: any;
  private mediaFiles: Map<string, string>;
  private mediaCounter: number;
  
  constructor() {
    this.mediaFiles = new Map();
    this.mediaCounter = 0;
    // Inicialização do zip será feita dinamicamente
  }

  private async initializeZip() {
    if (!this.zip) {
      const JSZip = (await import('jszip')).default;
      this.zip = new JSZip();
    }
    return this.zip;
  }

  // Gerar ID único baseado em timestamp
  private genId(): number {
    return Date.now();
  }

  // Gerar GUID
  private genGuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // Calcular checksum de uma string
  private checksum(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  // Criar banco de dados SQLite (simulado como estrutura JSON)
  private createDatabase(flashcards: any[], deckName: string): string {
    const now = Math.floor(Date.now() / 1000);
    const deckId = this.genId();
    
    // Configuração do deck
    const decks = {
      [deckId]: {
        id: deckId,
        mod: now,
        name: deckName,
        usn: -1,
        lrnToday: [0, 0],
        revToday: [0, 0],
        newToday: [0, 0],
        timeToday: [0, 0],
        collapsed: false,
        browserCollapsed: false,
        desc: `Deck exported from StudyPro on ${new Date().toISOString()}`,
        dyn: 0,
        conf: 1,
        extendNew: 10,
        extendRev: 50
      }
    };

    // Modelos de nota (tipos de flashcard)
    const models = {
      [this.genId()]: {
        id: this.genId(),
        name: "Basic",
        type: 0,
        mod: now,
        usn: -1,
        sortf: 0,
        did: null,
        tmpls: [
          {
            name: "Card 1",
            ord: 0,
            qfmt: "{{Front}}",
            afmt: "{{FrontSide}}\n\n<hr id=answer>\n\n{{Back}}"
          }
        ],
        flds: [
          { name: "Front", ord: 0 },
          { name: "Back", ord: 1 }
        ],
        css: `.card {
          font-family: arial;
          font-size: 20px;
          text-align: center;
          color: black;
          background-color: white;
        }`,
        latexPre: "\\documentclass[12pt]{article}\n\\special{papersize=3in,5in}\n\\usepackage[utf8]{inputenc}\n\\usepackage{amssymb,amsmath}\n\\pagestyle{empty}\n\\setlength{\\parindent}{0in}\n\\begin{document}\n",
        latexPost: "\\end{document}",
        latexsvg: false,
        req: [[0, "any", [0]]]
      }
    };

    // Configuração da coleção
    const conf = {
      activeDecks: [deckId],
      curDeck: deckId,
      newSpread: 0,
      collapseTime: 1200,
      timeLim: 0,
      estTimes: true,
      dueCounts: true,
      curModel: Object.keys(models)[0],
      nextPos: 1,
      sortType: "noteFld",
      sortBackwards: false,
      addToCur: true,
      dayLearnFirst: false
    };

    // Criar notas e cards
    const notes: any[] = [];
    const cards: any[] = [];
    
    flashcards.forEach((flashcard, index) => {
      const noteId = this.genId() + index;
      const cardId = this.genId() + index + 1000;
      
      // Processar campos
      let front = flashcard.front || flashcard.question || '';
      let back = flashcard.back || flashcard.answer || '';
      
      // Processar imagens
      if (flashcard.images && flashcard.images.length > 0) {
        flashcard.images.forEach((img: string) => {
          if (img.startsWith('data:')) {
            const mediaName = `${this.mediaCounter}`;
            this.mediaFiles.set(mediaName, img.split(',')[1]);
            back += `<br><img src="${mediaName}">`;
            this.mediaCounter++;
          }
        });
      }
      
      // Criar nota
      notes.push({
        id: noteId,
        guid: this.genGuid(),
        mid: Object.keys(models)[0],
        mod: now,
        usn: -1,
        tags: (flashcard.tags || []).join(' '),
        flds: `${front}\x1f${back}`,
        sfld: front,
        csum: this.checksum(front),
        flags: 0,
        data: ''
      });
      
      // Criar card
      cards.push({
        id: cardId,
        nid: noteId,
        did: deckId,
        ord: 0,
        mod: now,
        usn: -1,
        type: 0, // new
        queue: 0, // new
        due: index + 1,
        ivl: 0,
        factor: 2500,
        reps: 0,
        lapses: 0,
        left: 0,
        odue: 0,
        odid: 0,
        flags: 0,
        data: ''
      });
      
      // Para flashcards invertidos, criar segundo card
      if (flashcard.type === 'basic_inverted') {
        cards.push({
          id: cardId + 10000,
          nid: noteId,
          did: deckId,
          ord: 1,
          mod: now,
          usn: -1,
          type: 0,
          queue: 0,
          due: index + 1,
          ivl: 0,
          factor: 2500,
          reps: 0,
          lapses: 0,
          left: 0,
          odue: 0,
          odid: 0,
          flags: 0,
          data: ''
        });
      }
    });

    // Criar estrutura completa do banco
    const database = {
      col: {
        id: 1,
        crt: now - 86400,
        mod: now,
        scm: now,
        ver: 11,
        dty: 0,
        usn: 0,
        ls: 0,
        conf: JSON.stringify(conf),
        models: JSON.stringify(models),
        decks: JSON.stringify(decks),
        dconf: JSON.stringify({}),
        tags: JSON.stringify({})
      },
      notes: notes,
      cards: cards,
      revlog: []
    };

    return JSON.stringify(database);
  }

  // Criar arquivo de mídia
  private createMediaFile(): string {
    const media: any = {};
    this.mediaFiles.forEach((_, name) => {
      media[name] = name;
    });
    return JSON.stringify(media);
  }

  // Exportar para formato .apkg
  async exportToApkg(flashcards: any[], deckName: string): Promise<Blob> {
    // Inicializar ZIP dinamicamente
    await this.initializeZip();
    
    // Resetar contadores
    this.mediaFiles.clear();
    this.mediaCounter = 0;
    
    // Criar banco de dados
    const database = this.createDatabase(flashcards, deckName);
    
    // Adicionar banco ao ZIP (simulado como JSON por enquanto)
    this.zip.file('collection.anki2', database);
    
    // Adicionar arquivo de mídia
    const mediaFile = this.createMediaFile();
    this.zip.file('media', mediaFile);
    
    // Adicionar arquivos de mídia
    this.mediaFiles.forEach((data, name) => {
      this.zip.file(name, data, { base64: true });
    });
    
    // Gerar arquivo ZIP
    const blob = await this.zip.generateAsync({ type: 'blob' });
    return blob;
  }

  // Método auxiliar para download
  downloadApkg(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.endsWith('.apkg') ? filename : `${filename}.apkg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

// Exportar instância
export const ankiApkgExporter = new AnkiApkgExporter();

// Função auxiliar para exportar diretamente
export async function exportToApkg(flashcards: any[], deckName: string): Promise<void> {
  try {
    const blob = await ankiApkgExporter.exportToApkg(flashcards, deckName);
    const filename = `${deckName.replace(/\s+/g, '_')}_${Date.now()}.apkg`;
    ankiApkgExporter.downloadApkg(blob, filename);
  } catch (error) {
    console.error('Error exporting to .apkg:', error);
    throw error;
  }
}