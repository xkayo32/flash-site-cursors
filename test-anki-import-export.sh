#!/bin/bash

echo "Testing Anki Import/Export Functionality"
echo "========================================="

# Test environment
TEST_FILE="/tmp/test_flashcards.json"

# Create a test JSON file with flashcards
cat > $TEST_FILE << 'EOF'
{
  "name": "Test Deck",
  "desc": "Test deck for import",
  "notes": [
    {
      "id": "n1",
      "modelName": "Basic",
      "fields": {
        "Front": "What is the capital of France?",
        "Back": "Paris",
        "Extra": "France is in Europe",
        "Header": "Geography",
        "Source": "World Atlas",
        "Tags": "geography capitals europe"
      },
      "tags": ["geography", "capitals"],
      "type": 0
    },
    {
      "id": "n2",
      "modelName": "Cloze",
      "fields": {
        "Front": "The {{c1::Eiffel Tower}} is located in {{c2::Paris}}",
        "Back": "",
        "Extra": "Famous landmark"
      },
      "tags": ["landmarks"],
      "type": 2
    }
  ],
  "cards": [],
  "media": []
}
EOF

echo "✅ Created test JSON file: $TEST_FILE"
echo ""
echo "Test File Contents:"
echo "-------------------"
cat $TEST_FILE
echo ""
echo "-------------------"
echo ""
echo "📝 Instructions to test:"
echo "1. Navigate to: http://localhost:5173/admin/flashcards/decks/new"
echo "2. Go to Step 3: CRIAÇÃO DE ARSENAL"
echo "3. Click on 'IMPORTAR/EXPORTAR ANKI' tab"
echo "4. Test Import:"
echo "   - Click on file upload area"
echo "   - Select the test file: $TEST_FILE"
echo "   - Preview imported cards"
echo "   - Click 'IMPORTAR TODOS'"
echo "5. Test Export:"
echo "   - Add some flashcards to the deck"
echo "   - Select export format (JSON/CSV/ANKI)"
echo "   - Click 'EXPORTAR X FLASHCARDS'"
echo ""
echo "✅ Test setup complete!"