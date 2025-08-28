const fs = require('fs');
const JSZip = require('jszip');
const sqlite3 = require('sqlite3').verbose();

async function analyzeComplexApkgFile() {
  try {
    console.log('🔍 Análise detalhada do arquivo Idiomatic Expressions P1.apkg...');
    
    const fileData = fs.readFileSync('/home/administrator/flash-site-cursors/Idiomatic Expressions P1.apkg');
    console.log(`📦 Arquivo carregado: ${(fileData.length / (1024*1024)).toFixed(2)} MB`);
    
    // Descompactar o ZIP
    const zip = await JSZip.loadAsync(fileData);
    const fileNames = Object.keys(zip.files);
    console.log(`📂 Total de arquivos: ${fileNames.length}`);
    
    // Analisar tipos de arquivos
    const mediaFiles = fileNames.filter(name => /^\d+$/.test(name));
    const dbFiles = fileNames.filter(name => name.includes('collection'));
    const otherFiles = fileNames.filter(name => !mediaFiles.includes(name) && !dbFiles.includes(name));
    
    console.log(`🎵 Arquivos de mídia numerados: ${mediaFiles.length}`);
    console.log(`💾 Arquivos de banco: ${dbFiles.length} (${dbFiles.join(', ')})`);
    console.log(`📄 Outros arquivos: ${otherFiles.length} (${otherFiles.join(', ')})`);
    
    // Examinar alguns arquivos de mídia
    console.log('\n🎵 Analisando arquivos de mídia:');
    const sampleMedia = mediaFiles.slice(0, 5);
    for (const fileName of sampleMedia) {
      const file = zip.files[fileName];
      if (file) {
        const data = await file.async('uint8array');
        const signature = Array.from(data.slice(0, 4)).map(b => b.toString(16).padStart(2, '0')).join(' ');
        console.log(`  ${fileName}: ${data.length} bytes, assinatura: ${signature}`);
        
        // Detectar tipo de arquivo pela assinatura
        if (signature.startsWith('ff d8 ff')) {
          console.log(`    → Arquivo JPEG`);
        } else if (signature.startsWith('89 50 4e 47')) {
          console.log(`    → Arquivo PNG`);
        } else if (signature.startsWith('47 49 46')) {
          console.log(`    → Arquivo GIF`);
        } else if (signature.startsWith('00 00 00')) {
          console.log(`    → Possível arquivo de áudio/vídeo`);
        } else {
          console.log(`    → Tipo desconhecido`);
        }
      }
    }
    
    // Verificar arquivo media (metadados)
    const mediaFile = zip.files['media'];
    if (mediaFile) {
      const mediaContent = await mediaFile.async('text');
      console.log('\n📋 Conteúdo do arquivo media:');
      const mediaData = JSON.parse(mediaContent);
      const mediaEntries = Object.entries(mediaData);
      console.log(`   Total de entradas de mídia: ${mediaEntries.length}`);
      
      // Mostrar algumas entradas
      mediaEntries.slice(0, 10).forEach(([key, value]) => {
        console.log(`   ${key}: ${value}`);
      });
      
      if (mediaEntries.length > 10) {
        console.log(`   ... e mais ${mediaEntries.length - 10} entradas`);
      }
    }
    
    // Analisar banco em detalhes
    const collectionFile = zip.files['collection.anki2'];
    if (collectionFile) {
      const dbData = await collectionFile.async('uint8array');
      const tempDbPath = '/tmp/complex_anki.db';
      fs.writeFileSync(tempDbPath, dbData);
      
      const db = new sqlite3.Database(tempDbPath);
      
      // Verificar se há mais notas que não foram capturadas
      console.log('\n💾 Análise detalhada do banco:');
      
      await new Promise((resolve) => {
        db.all("SELECT COUNT(*) as total FROM notes", [], (err, result) => {
          if (!err && result) {
            console.log(`   Total de notas: ${result[0].total}`);
          }
          resolve();
        });
      });
      
      await new Promise((resolve) => {
        db.all("SELECT COUNT(*) as total FROM cards", [], (err, result) => {
          if (!err && result) {
            console.log(`   Total de cards: ${result[0].total}`);
          }
          resolve();
        });
      });
      
      // Verificar todas as notas
      await new Promise((resolve) => {
        db.all("SELECT * FROM notes", [], (err, notes) => {
          if (!err && notes) {
            console.log(`\n📝 Todas as ${notes.length} notas encontradas:`);
            notes.forEach((note, i) => {
              console.log(`\n--- NOTA ${i + 1} ---`);
              console.log(`ID: ${note.id}`);
              console.log(`GUID: ${note.guid}`);
              console.log(`Tags: "${note.tags}"`);
              
              if (note.flds) {
                const fields = note.flds.split('\x1f');
                console.log(`Campos (${fields.length}):`);
                fields.forEach((field, idx) => {
                  const preview = field.length > 100 ? field.substring(0, 100) + '...' : field;
                  console.log(`  ${idx}: "${preview}"`);
                });
              }
            });
          }
          resolve();
        });
      });
      
      // Verificar estrutura col
      await new Promise((resolve) => {
        db.all("SELECT * FROM col", [], (err, cols) => {
          if (!err && cols && cols.length > 0) {
            console.log('\n⚙️ Configuração da coleção:');
            const col = cols[0];
            
            try {
              const decks = JSON.parse(col.decks);
              console.log(`   Decks: ${Object.keys(decks).length}`);
              Object.values(decks).forEach(deck => {
                console.log(`     - ${deck.name}`);
              });
            } catch (e) {
              console.log('   Erro ao parsear decks');
            }
            
            try {
              const models = JSON.parse(col.models);
              console.log(`   Modelos: ${Object.keys(models).length}`);
              Object.values(models).forEach(model => {
                console.log(`     - ${model.name} (${model.flds?.length || 0} campos)`);
              });
            } catch (e) {
              console.log('   Erro ao parsear modelos');
            }
          }
          resolve();
        });
      });
      
      db.close();
      fs.unlinkSync(tempDbPath);
    }
    
  } catch (error) {
    console.error('❌ Erro durante análise:', error);
  }
}

analyzeComplexApkgFile();