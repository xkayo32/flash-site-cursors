#!/bin/bash

echo "Testing .APKG Import/Export Functionality"
echo "=========================================="
echo ""

# Create test files
TEST_DIR="/tmp/anki_test"
mkdir -p $TEST_DIR

# Create a simulated .apkg file (ZIP with JSON database)
cat > $TEST_DIR/collection.anki2 << 'EOF'
{
  "col": {
    "id": 1,
    "crt": 1700000000,
    "mod": 1700000100,
    "scm": 1700000000,
    "ver": 11,
    "dty": 0,
    "usn": 0,
    "ls": 0,
    "conf": "{}",
    "models": "{\"1234\":{\"name\":\"Basic\",\"type\":0}}",
    "decks": "{\"1\":{\"name\":\"Test Deck\"}}",
    "dconf": "{}",
    "tags": "{}"
  },
  "notes": [
    {
      "id": 1001,
      "guid": "test-guid-1",
      "mid": "1234",
      "mod": 1700000000,
      "usn": -1,
      "tags": "geografia capitais",
      "flds": "Qual é a capital do Brasil?\x1fBrasília\x1fA capital foi transferida do Rio de Janeiro em 1960",
      "sfld": "Qual é a capital do Brasil?",
      "csum": 12345,
      "flags": 0,
      "data": ""
    },
    {
      "id": 1002,
      "guid": "test-guid-2",
      "mid": "1234",
      "mod": 1700000000,
      "usn": -1,
      "tags": "matematica algebra",
      "flds": "Resolva: 2x + 5 = 15\x1fx = 5\x1fSubtraia 5 de ambos os lados e divida por 2",
      "sfld": "Resolva: 2x + 5 = 15",
      "csum": 23456,
      "flags": 0,
      "data": ""
    },
    {
      "id": 1003,
      "guid": "test-guid-3",
      "mid": "1234",
      "mod": 1700000000,
      "usn": -1,
      "tags": "historia brasil",
      "flds": "Em que ano foi {{c1::proclamada a República}} no Brasil?\x1f{{c1::1889}}\x1fFim do período imperial",
      "sfld": "Em que ano foi proclamada a República no Brasil?",
      "csum": 34567,
      "flags": 0,
      "data": ""
    }
  ],
  "cards": [
    {"id": 2001, "nid": 1001, "did": 1, "ord": 0, "mod": 1700000000, "usn": -1, "type": 0, "queue": 0, "due": 1, "ivl": 0, "factor": 2500, "reps": 0, "lapses": 0, "left": 0},
    {"id": 2002, "nid": 1002, "did": 1, "ord": 0, "mod": 1700000000, "usn": -1, "type": 0, "queue": 0, "due": 2, "ivl": 0, "factor": 2500, "reps": 0, "lapses": 0, "left": 0},
    {"id": 2003, "nid": 1003, "did": 1, "ord": 0, "mod": 1700000000, "usn": -1, "type": 0, "queue": 0, "due": 3, "ivl": 0, "factor": 2500, "reps": 0, "lapses": 0, "left": 0}
  ],
  "revlog": []
}
EOF

# Create media file
echo '{}' > $TEST_DIR/media

# Create the .apkg file (ZIP)
cd $TEST_DIR
zip -q test_deck.apkg collection.anki2 media
mv test_deck.apkg /tmp/

echo "✅ Created test .apkg file: /tmp/test_deck.apkg"
echo ""
echo "📋 Test Instructions:"
echo "====================================="
echo ""
echo "1. TEST IMPORT FROM .APKG:"
echo "   a) Navigate to: http://localhost:5173/admin/flashcards/decks/new"
echo "   b) Go to Step 3: CRIAÇÃO DE ARSENAL"
echo "   c) Click on 'IMPORTAR/EXPORTAR ANKI' tab"
echo "   d) Click on the upload area"
echo "   e) Select file: /tmp/test_deck.apkg"
echo "   f) Preview the imported cards (should show 3 cards)"
echo "   g) Click 'IMPORTAR TODOS'"
echo ""
echo "2. TEST EXPORT TO .APKG:"
echo "   a) Add some flashcards to the deck (or use imported ones)"
echo "   b) In the export section, select '.APKG' format"
echo "   c) Click 'EXPORTAR X FLASHCARDS'"
echo "   d) File should download as .apkg"
echo "   e) The downloaded file can be imported directly into Anki Desktop"
echo ""
echo "3. VERIFY FORMATS:"
echo "   - JSON: Standard JSON export"
echo "   - CSV: Excel/Sheets compatible"
echo "   - ANKI: JSON with Anki structure"
echo "   - .APKG: Native Anki format (ZIP)"
echo ""
echo "✅ Test setup complete!"
echo ""
echo "File contents preview:"
echo "----------------------"
unzip -l /tmp/test_deck.apkg
echo "----------------------"