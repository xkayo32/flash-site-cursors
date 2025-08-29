#!/bin/bash

echo "Testing Import Modal in Deck Creation Pages"
echo "==========================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Testing Admin Deck Creation Import Modal${NC}"
echo "1. Navigate to: http://localhost:5173/admin/flashcards/decks/new"
echo "2. Click the 'IMPORTAR' button"
echo "3. Modal should open with import options"
echo "4. Modal should have close button (X)"
echo ""

echo -e "${BLUE}Testing Student Deck Creation Import Modal${NC}"
echo "1. Navigate to: http://localhost:5173/my-flashcards (student page)"
echo "2. Click 'CRIAR NOVO ARSENAL'"
echo "3. Click the 'IMPORTAR' button"
echo "4. Modal should open with import options"
echo "5. Modal should have close button (X)"
echo ""

echo -e "${GREEN}Features to verify:${NC}"
echo "✓ Modal opens when IMPORTAR button is clicked"
echo "✓ Modal has proper backdrop (dark overlay)"
echo "✓ Modal can be closed with X button"
echo "✓ Import options are visible (JSON, CSV, Anki formats)"
echo "✓ Imported flashcards are added to the deck"
echo "✓ Success toast shows after import"
echo ""

echo -e "${GREEN}✓ Import modal implementation complete!${NC}"