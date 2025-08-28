const fs = require('fs');
const JSZip = require('jszip');
const sqlite3 = require('sqlite3').verbose();

async function analyzeApkgFile() {
  try {
    console.log('🔍 Analisando arquivo .apkg local...');
    
    // Ler o arquivo (usar parâmetro ou arquivo padrão)
    const filePath = process.argv[2] || '/home/administrator/flash-site-cursors/Test_Flashcards.apkg';
    const fileData = fs.readFileSync(filePath);
    console.log(`📦 Arquivo carregado: ${fileData.length} bytes`);
    
    // Descompactar o ZIP
    const zip = await JSZip.loadAsync(fileData);
    console.log('📂 Arquivos no .apkg:', Object.keys(zip.files));
    
    // Encontrar arquivo de banco
    const collectionFile = zip.files['collection.anki21'] || zip.files['collection.anki2'];
    if (!collectionFile) {
      console.error('❌ Arquivo de coleção não encontrado');
      return;
    }
    
    console.log(`💾 Banco encontrado: ${collectionFile.name}`);
    
    // Extrair banco para arquivo temporário
    const dbData = await collectionFile.async('nodebuffer');
    const tempDbPath = '/tmp/temp_anki.db';
    fs.writeFileSync(tempDbPath, dbData);
    
    // Analisar estrutura do banco
    const db = new sqlite3.Database(tempDbPath);
    
    // Listar tabelas
    db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
      if (err) {
        console.error('❌ Erro ao listar tabelas:', err);
        return;
      }
      
      console.log('🗂️  Tabelas encontradas:', tables.map(t => t.name));
      
      // Analisar estrutura da tabela notes
      db.all("PRAGMA table_info(notes)", [], (err, notesCols) => {
        if (err) {
          console.error('❌ Erro ao analisar notes:', err);
          return;
        }
        
        console.log('📋 Estrutura da tabela notes:', notesCols);
        
        // Buscar todas as notas para ver o conteúdo real
        db.all("SELECT COUNT(*) as total FROM notes", [], (err, countResult) => {
          if (err) {
            console.error('❌ Erro ao contar notes:', err);
            return;
          }
          
          console.log(`📊 Total de notas no banco: ${countResult[0].total}`);
          
          // Buscar várias notas
          db.all("SELECT * FROM notes LIMIT 10", [], (err, notes) => {
          if (err) {
            console.error('❌ Erro ao buscar notes:', err);
            return;
          }
          
          console.log(`📝 Primeiras ${notes.length} notas:`, notes);
          
          // Analisar campos das notas
          notes.forEach((note, i) => {
            console.log(`\n--- NOTA ${i + 1} ---`);
            console.log('ID:', note.id);
            console.log('GUID:', note.guid);
            console.log('Model ID:', note.mid);
            console.log('Tags:', note.tags);
            console.log('Fields (raw):', note.flds);
            
            if (note.flds) {
              const fields = note.flds.split('\x1f');
              console.log('Fields (parsed):');
              fields.forEach((field, idx) => {
                console.log(`  Campo ${idx}: "${field}"`);
              });
            }
          });
          
          // Analisar também a tabela cards
          console.log('\n🃏 Analisando tabela cards...');
          db.all("SELECT COUNT(*) as total FROM cards", [], (err, cardCount) => {
            if (err) {
              console.error('❌ Erro ao contar cards:', err);
              return;
            }
            
            console.log(`📊 Total de cards no banco: ${cardCount[0].total}`);
            
            db.all("SELECT * FROM cards LIMIT 5", [], (err, cards) => {
              if (err) {
                console.error('❌ Erro ao buscar cards:', err);
                return;
              }
              
              console.log('🃏 Primeiros cards:', cards);
              
              // Fechar banco
              db.close();
              
              // Limpar arquivo temporário
              fs.unlinkSync(tempDbPath);
              
              console.log('\n✅ Análise concluída!');
            });
          });
          });
        });
      });
    });
    
  } catch (error) {
    console.error('❌ Erro durante análise:', error);
  }
}

analyzeApkgFile();