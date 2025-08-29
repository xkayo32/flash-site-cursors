// Helper para lidar com diferentes versões do Anki

export interface AnkiVersionInfo {
  version: 'anki2' | 'anki21' | 'anki23' | 'unknown';
  collectionFile: string;
  isSupported: boolean;
  fallbackFormat?: string;
  message?: string;
}

export class AnkiVersionHelper {
  // Mapear versões conhecidas do Anki
  private static readonly ANKI_VERSIONS = {
    ANKI_2_0: 'collection.anki2',     // Anki 2.0.x
    ANKI_2_1: 'collection.anki21',    // Anki 2.1.x (mais comum)
    ANKI_2_3: 'collection.anki23',    // Anki 2.3.x (futuro)
  };

  // Detectar versão do Anki baseado nos arquivos do ZIP
  static detectAnkiVersion(zipFiles: { [key: string]: any }): AnkiVersionInfo {
    const fileNames = Object.keys(zipFiles);
    
    // Verificar Anki 2.1 (mais comum atualmente)
    if (fileNames.includes(this.ANKI_VERSIONS.ANKI_2_1)) {
      return {
        version: 'anki21',
        collectionFile: this.ANKI_VERSIONS.ANKI_2_1,
        isSupported: true,
        message: 'Anki 2.1.x detectado - formato totalmente suportado'
      };
    }
    
    // Verificar Anki 2.0 (versão antiga mas ainda usada)
    if (fileNames.includes(this.ANKI_VERSIONS.ANKI_2_0)) {
      return {
        version: 'anki2',
        collectionFile: this.ANKI_VERSIONS.ANKI_2_0,
        isSupported: true,
        message: 'Anki 2.0.x detectado - formato suportado com limitações'
      };
    }
    
    // Verificar possível Anki 2.3 (futuro)
    if (fileNames.includes(this.ANKI_VERSIONS.ANKI_2_3)) {
      return {
        version: 'anki23',
        collectionFile: this.ANKI_VERSIONS.ANKI_2_3,
        isSupported: false,
        fallbackFormat: 'json',
        message: 'Anki 2.3.x detectado - versão não suportada, use exportação JSON'
      };
    }
    
    // Procurar por qualquer arquivo collection.*
    const collectionFile = fileNames.find(f => f.startsWith('collection.'));
    if (collectionFile) {
      return {
        version: 'unknown',
        collectionFile,
        isSupported: false,
        fallbackFormat: 'json',
        message: `Versão desconhecida do Anki (${collectionFile}) - recomendamos exportar como JSON`
      };
    }
    
    // Nenhum arquivo de coleção encontrado
    return {
      version: 'unknown',
      collectionFile: '',
      isSupported: false,
      fallbackFormat: 'json',
      message: 'Formato APKG inválido ou corrompido - arquivo de coleção não encontrado'
    };
  }

  // Converter modelo do Anki para nosso formato baseado na versão
  static convertAnkiModel(model: any, version: AnkiVersionInfo['version']): string {
    // Mapear tipos de modelo por versão
    const modelMappings: { [key: string]: { [key: string]: string } } = {
      anki2: {
        'Basic': 'basic',
        'Basic (and reversed card)': 'basic_inverted',
        'Cloze': 'cloze',
        'Basic (type in the answer)': 'type_answer'
      },
      anki21: {
        'Basic': 'basic',
        'Basic (and reversed card)': 'basic_inverted',
        'Basic (type in the answer)': 'type_answer',
        'Cloze': 'cloze',
        'Basic (optional reversed card)': 'basic_inverted',
        'Image Occlusion': 'image_occlusion'
      },
      anki23: {
        // Preparado para futuras versões
        'Basic': 'basic',
        'Basic (and reversed card)': 'basic_inverted',
        'Cloze': 'cloze',
        'Image Occlusion Enhanced': 'image_occlusion'
      }
    };

    const versionMap = modelMappings[version] || modelMappings.anki21;
    const modelName = model?.name || 'Basic';
    
    return versionMap[modelName] || 'basic';
  }

  // Processar campos baseado na versão
  static processFields(fields: any, version: AnkiVersionInfo['version']): any {
    // Normalizar nomes de campos por versão
    const fieldMappings: { [key: string]: { [key: string]: string } } = {
      anki2: {
        'Front': 'front',
        'Back': 'back',
        'Text': 'text',
        'Extra': 'extra',
        'MyMedia': 'media'
      },
      anki21: {
        'Front': 'front',
        'Back': 'back',
        'Text': 'text',
        'Extra': 'extra',
        'Header': 'header',
        'Image': 'image',
        'MyMedia': 'media'
      }
    };

    const versionMap = fieldMappings[version] || fieldMappings.anki21;
    const processedFields: any = {};
    
    if (typeof fields === 'object' && fields !== null) {
      for (const [key, value] of Object.entries(fields)) {
        const mappedKey = versionMap[key] || key.toLowerCase();
        processedFields[mappedKey] = value;
      }
    }
    
    return processedFields;
  }

  // Sugerir formato alternativo baseado na versão
  static getSuggestedExportFormat(version: AnkiVersionInfo['version']): string {
    switch (version) {
      case 'anki2':
      case 'anki21':
        return 'apkg';
      case 'anki23':
      case 'unknown':
      default:
        return 'json';
    }
  }

  // Verificar se SQL.js está disponível
  static async checkSqlJsAvailability(): Promise<boolean> {
    try {
      // Tentar carregar SQL.js
      const response = await fetch('https://sql.js.org/dist/sql-wasm.js');
      return response.ok;
    } catch {
      return false;
    }
  }

  // Obter mensagem de ajuda para versão não suportada
  static getVersionHelpMessage(version: AnkiVersionInfo): string {
    if (version.isSupported) {
      return `✅ ${version.message}`;
    }
    
    let helpMessage = `⚠️ ${version.message}\n\n`;
    helpMessage += 'Opções disponíveis:\n';
    helpMessage += '1. No Anki, exporte seu deck como "Anki Deck Package (*.apkg)" com Anki 2.1.x\n';
    helpMessage += '2. Ou exporte como "Cards in Plain Text (*.txt)" e converta para JSON\n';
    helpMessage += '3. Use a extensão AnkiConnect para exportar diretamente como JSON\n\n';
    helpMessage += `Formato recomendado: ${version.fallbackFormat?.toUpperCase() || 'JSON'}`;
    
    return helpMessage;
  }

  // Validar estrutura do banco SQLite
  static validateSqliteStructure(db: any): boolean {
    try {
      // Verificar tabelas essenciais do Anki
      const requiredTables = ['notes', 'cards', 'col'];
      const tables = db.exec("SELECT name FROM sqlite_master WHERE type='table'");
      
      if (!tables || tables.length === 0) {
        return false;
      }
      
      const tableNames = tables[0].values.map((row: any[]) => row[0]);
      return requiredTables.every(table => tableNames.includes(table));
    } catch {
      return false;
    }
  }
}

export default AnkiVersionHelper;