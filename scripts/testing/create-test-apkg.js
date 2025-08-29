const fs = require('fs');
const JSZip = require('jszip');
const sqlite3 = require('sqlite3').verbose();

// Definir flashcards de teste no escopo global
const flashcards = [
  {
    id: 1,
    guid: 'test-guid-1',
    flds: 'O que é JavaScript?\x1fUma linguagem de programação para desenvolvimento web',
    tags: 'programacao javascript web'
  },
  {
    id: 2, 
    guid: 'test-guid-2',
    flds: 'Qual a diferença entre let e var?\x1flet tem escopo de bloco, var tem escopo de função',
    tags: 'javascript variaveis escopo'
  },
  {
    id: 3,
    guid: 'test-guid-3', 
    flds: 'O que é React?\x1fUma biblioteca JavaScript para criar interfaces de usuário',
    tags: 'react javascript frontend'
  },
  {
    id: 4,
    guid: 'test-guid-4',
    flds: 'Complete: {{c1::PostgreSQL}} é um sistema de banco de dados relacional\x1f',
    tags: 'cloze banco-dados sql'
  },
  {
    id: 5,
    guid: 'test-guid-5',
    flds: 'O que significa {{c1::API}}?\x1fApplication Programming Interface - Interface de Programação de Aplicações',
    tags: 'cloze api conceitos'
  }
];

async function createTestApkgFile() {
  try {
    console.log('🔧 Criando arquivo .apkg de teste com dados reais...');
    
    // Criar banco SQLite em memória
    const tempDbPath = '/tmp/test_collection.anki21';
    
    // Remover arquivo existente se houver
    try {
      fs.unlinkSync(tempDbPath);
    } catch (e) {
      // Ignorar erro se arquivo não existir
    }
    
    const db = new sqlite3.Database(tempDbPath);
    
    // Criar estrutura básica do banco Anki
    await new Promise((resolve, reject) => {
      db.serialize(() => {
        // Tabela col (coleção)
        db.run(`
          CREATE TABLE col (
            id integer primary key,
            crt integer not null,
            mod integer not null,
            scm integer not null,
            ver integer not null,
            dty integer not null,
            usn integer not null,
            ls integer not null,
            conf text not null,
            models text not null,
            decks text not null,
            dconf text not null,
            tags text not null
          )
        `);
        
        // Tabela notes (notas/flashcards)
        db.run(`
          CREATE TABLE notes (
            id integer primary key,
            guid text not null,
            mid integer not null,
            mod integer not null,
            usn integer not null,
            tags text not null,
            flds text not null,
            sfld text not null,
            csum integer not null,
            flags integer not null,
            data text not null
          )
        `);
        
        // Tabela cards
        db.run(`
          CREATE TABLE cards (
            id integer primary key,
            nid integer not null,
            did integer not null,
            ord integer not null,
            mod integer not null,
            usn integer not null,
            type integer not null,
            queue integer not null,
            due integer not null,
            ivl integer not null,
            factor integer not null,
            reps integer not null,
            lapses integer not null,
            left integer not null,
            odue integer not null,
            odid integer not null,
            flags integer not null,
            data text not null
          )
        `);
        
        // Inserir configuração da coleção
        db.run(`
          INSERT INTO col VALUES (
            1, 1640995200, 1640995200, 1640995200, 11, 0, 0, 0,
            '{"nextPos": 1, "estTimes": true, "activeDecks": [1]}',
            '{"1": {"id": 1, "name": "Basic", "type": 0}}',
            '{"1": {"id": 1, "name": "Default"}}',
            '{"1": {"id": 1, "name": "Default"}}',
            '{}'
          )
        `);
        
        // Inserir flashcards de teste
        let completed = 0;
        flashcards.forEach((card, index) => {
          db.run(`
            INSERT INTO notes VALUES (
              ?, ?, 1, 1640995200, 0, ?, ?, ?, 0, 0, ''
            )
          `, [
            card.id,
            card.guid, 
            card.tags,
            card.flds,
            card.flds.split('\x1f')[0] // sfld é o primeiro campo
          ], (err) => {
            if (err) {
              reject(err);
              return;
            }
            
            // Inserir card correspondente
            db.run(`
              INSERT INTO cards VALUES (
                ?, ?, 1, 0, 1640995200, 0, 0, 0, 0, 0, 2500, 0, 0, 0, 0, 0, 0, ''
              )
            `, [card.id, card.id], (err) => {
              if (err) {
                reject(err);
                return;
              }
              
              completed++;
              if (completed === flashcards.length) {
                resolve();
              }
            });
          });
        });
      });
    });
    
    // Fechar banco
    db.close();
    
    console.log('💾 Banco SQLite criado com sucesso');
    
    // Criar arquivo .apkg (ZIP)
    const zip = new JSZip();
    
    // Ler o banco criado
    const dbData = fs.readFileSync(tempDbPath);
    zip.file('collection.anki21', dbData);
    
    // Adicionar arquivo media (vazio)
    zip.file('media', '{}');
    
    // Gerar o arquivo .apkg
    const apkgBuffer = await zip.generateAsync({type: 'nodebuffer'});
    const apkgPath = '/home/administrator/flash-site-cursors/Test_Flashcards.apkg';
    
    fs.writeFileSync(apkgPath, apkgBuffer);
    
    console.log(`✅ Arquivo .apkg criado: ${apkgPath}`);
    console.log(`📊 Contém ${flashcards.length} flashcards de teste`);
    console.log('📋 Tipos: básicos e cloze deletion');
    
    // Limpar arquivo temporário
    fs.unlinkSync(tempDbPath);
    
  } catch (error) {
    console.error('❌ Erro ao criar arquivo .apkg:', error);
  }
}

createTestApkgFile();