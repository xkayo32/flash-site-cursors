#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

async function createTestApkg() {
  const zip = new JSZip();
  
  // Create test database
  const database = {
    col: {
      id: 1,
      crt: 1700000000,
      mod: 1700000100,
      scm: 1700000000,
      ver: 11,
      dty: 0,
      usn: 0,
      ls: 0,
      conf: "{}",
      models: JSON.stringify({
        "1234": {
          name: "Basic",
          type: 0,
          flds: [
            { name: "Front", ord: 0 },
            { name: "Back", ord: 1 },
            { name: "Extra", ord: 2 }
          ]
        }
      }),
      decks: JSON.stringify({
        "1": {
          name: "Test Deck",
          desc: "Test deck for import"
        }
      }),
      dconf: "{}",
      tags: "{}"
    },
    notes: [
      {
        id: 1001,
        guid: "test-guid-1",
        mid: "1234",
        mod: 1700000000,
        usn: -1,
        tags: "geografia capitais",
        flds: "Qual é a capital do Brasil?\x1fBrasília\x1fA capital foi transferida do Rio de Janeiro em 1960",
        sfld: "Qual é a capital do Brasil?",
        csum: 12345,
        flags: 0,
        data: ""
      },
      {
        id: 1002,
        guid: "test-guid-2",
        mid: "1234",
        mod: 1700000000,
        usn: -1,
        tags: "matematica algebra",
        flds: "Resolva: 2x + 5 = 15\x1fx = 5\x1fSubtraia 5 de ambos os lados e divida por 2",
        sfld: "Resolva: 2x + 5 = 15",
        csum: 23456,
        flags: 0,
        data: ""
      },
      {
        id: 1003,
        guid: "test-guid-3",
        mid: "1234",
        mod: 1700000000,
        usn: -1,
        tags: "historia brasil",
        flds: "A República foi {{c1::proclamada}} em {{c2::1889}}\x1f\x1fFim do período imperial brasileiro",
        sfld: "A República foi proclamada em 1889",
        csum: 34567,
        flags: 0,
        data: ""
      }
    ],
    cards: [
      {id: 2001, nid: 1001, did: 1, ord: 0, mod: 1700000000, usn: -1, type: 0, queue: 0, due: 1, ivl: 0, factor: 2500, reps: 0, lapses: 0, left: 0},
      {id: 2002, nid: 1002, did: 1, ord: 0, mod: 1700000000, usn: -1, type: 0, queue: 0, due: 2, ivl: 0, factor: 2500, reps: 0, lapses: 0, left: 0},
      {id: 2003, nid: 1003, did: 1, ord: 0, mod: 1700000000, usn: -1, type: 0, queue: 0, due: 3, ivl: 0, factor: 2500, reps: 0, lapses: 0, left: 0}
    ],
    revlog: []
  };
  
  // Add files to ZIP
  zip.file('collection.anki2', JSON.stringify(database, null, 2));
  zip.file('media', '{}');
  
  // Generate ZIP file
  const content = await zip.generateAsync({ type: 'nodebuffer' });
  
  // Save to file
  const outputPath = '/tmp/test_deck.apkg';
  fs.writeFileSync(outputPath, content);
  
  console.log(`✅ Created test .apkg file: ${outputPath}`);
  console.log(`📦 File size: ${(content.length / 1024).toFixed(2)} KB`);
  console.log('');
  console.log('📋 Test cards included:');
  console.log('1. Geografia: Capital do Brasil');
  console.log('2. Matemática: Equação simples');
  console.log('3. História: República (com cloze)');
  console.log('');
  console.log('✨ Ready to test import at:');
  console.log('http://localhost:5173/admin/flashcards/decks/new');
}

createTestApkg().catch(console.error);