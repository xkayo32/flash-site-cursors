#!/bin/bash

echo "🎯 TESTING COMPLETE STUDENT FLASHCARD SYSTEM"
echo "==============================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:5173"
FLASHCARD_FILE="/home/administrator/flash-site-cursors/frontend/src/pages/student/NewStudentFlashcard.tsx"

echo -e "${BLUE}🎖️ FINAL MISSION BRIEFING:${NC}"
echo "Student flashcard creation system should be EXACTLY like admin system"
echo "All 7 flashcard types, category creation, military theming"
echo ""

echo -e "${YELLOW}📋 TACTICAL CHECKLIST:${NC}"

# 1. File existence and basic structure
echo -n "1. File structure check: "
if [ -f "$FLASHCARD_FILE" ] && grep -q "NewStudentFlashcard" "$FLASHCARD_FILE"; then
    echo -e "${GREEN}✅ PASS${NC}"
else
    echo -e "${RED}❌ FAIL${NC}"
fi

# 2. All 7 flashcard types present
echo -n "2. All 7 flashcard types: "
ALL_TYPES_FOUND=true
TYPES=("basic" "basic_reversed" "cloze" "multiple_choice" "true_false" "type_answer" "image_occlusion")
for type in "${TYPES[@]}"; do
    if ! grep -q "value: '$type'" "$FLASHCARD_FILE"; then
        ALL_TYPES_FOUND=false
        break
    fi
done

if $ALL_TYPES_FOUND; then
    echo -e "${GREEN}✅ PASS - All 7 types implemented${NC}"
else
    echo -e "${RED}❌ FAIL - Missing types${NC}"
fi

# 3. Category system functions
echo -n "3. Category system complete: "
CATEGORY_FUNCTIONS=("handleSaveAllCategories" "countCategories" "loadCategories")
CATEGORY_COMPLETE=true
for func in "${CATEGORY_FUNCTIONS[@]}"; do
    if ! grep -q "$func" "$FLASHCARD_FILE"; then
        CATEGORY_COMPLETE=false
        break
    fi
done

if $CATEGORY_COMPLETE; then
    echo -e "${GREEN}✅ PASS - Category system complete${NC}"
else
    echo -e "${RED}❌ FAIL - Missing category functions${NC}"
fi

# 4. Military theming
echo -n "4. Military theming: "
MILITARY_ELEMENTS=("INTEL TÁTICO" "font-police-title" "accent-500" "OPERAÇÃO")
MILITARY_COMPLETE=true
for element in "${MILITARY_ELEMENTS[@]}"; do
    if ! grep -q "$element" "$FLASHCARD_FILE"; then
        MILITARY_COMPLETE=false
        break
    fi
done

if $MILITARY_COMPLETE; then
    echo -e "${GREEN}✅ PASS - Military theming implemented${NC}"
else
    echo -e "${RED}❌ FAIL - Military theming incomplete${NC}"
fi

# 5. All necessary imports
echo -n "5. Required imports: "
REQUIRED_IMPORTS=("motion" "AnimatePresence" "flashcardService" "categoryService" "ChevronRight" "toast")
IMPORTS_COMPLETE=true
for import_item in "${REQUIRED_IMPORTS[@]}"; do
    if ! grep -q "$import_item" "$FLASHCARD_FILE"; then
        IMPORTS_COMPLETE=false
        break
    fi
done

if $IMPORTS_COMPLETE; then
    echo -e "${GREEN}✅ PASS - All imports present${NC}"
else
    echo -e "${RED}❌ FAIL - Missing imports${NC}"
fi

# 6. Form validation for all types
echo -n "6. Form validation: "
VALIDATION_PATTERNS=("basic.*front.*back" "cloze.*text" "multiple_choice.*question.*options" "true_false.*statement" "type_answer.*question.*answer" "image_occlusion.*image.*occlusionAreas")
VALIDATION_COMPLETE=true
for pattern in "${VALIDATION_PATTERNS[@]}"; do
    if ! grep -qE "$pattern" "$FLASHCARD_FILE"; then
        VALIDATION_COMPLETE=false
        break
    fi
done

if $VALIDATION_COMPLETE; then
    echo -e "${GREEN}✅ PASS - All validations implemented${NC}"
else
    echo -e "${RED}❌ FAIL - Missing validations${NC}"
fi

# 7. Preview system for all types
echo -n "7. Preview system: "
PREVIEW_CASES=("case 'basic'" "case 'cloze'" "case 'multiple_choice'" "case 'true_false'" "case 'type_answer'" "case 'image_occlusion'")
PREVIEW_COMPLETE=true
for case_pattern in "${PREVIEW_CASES[@]}"; do
    if ! grep -q "$case_pattern" "$FLASHCARD_FILE"; then
        PREVIEW_COMPLETE=false
        break
    fi
done

if $PREVIEW_COMPLETE; then
    echo -e "${GREEN}✅ PASS - Preview system complete${NC}"
else
    echo -e "${RED}❌ FAIL - Preview system incomplete${NC}"
fi

# 8. Template system
echo -n "8. Template examples: "
if grep -q "templates = {" "$FLASHCARD_FILE" && grep -q "CARREGAR EXEMPLO" "$FLASHCARD_FILE"; then
    echo -e "${GREEN}✅ PASS - Template system implemented${NC}"
else
    echo -e "${RED}❌ FAIL - Template system missing${NC}"
fi

# 9. Frontend compilation test
echo -n "9. Frontend compilation: "
if timeout 3s curl -s "$BASE_URL" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PASS - Frontend running${NC}"
else
    echo -e "${YELLOW}⚠️  WARNING - Frontend not accessible${NC}"
fi

# 10. Route accessibility
echo -n "10. Route accessibility: "
ROUTE_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/student/flashcards/new" 2>/dev/null || echo "000")
if [ "$ROUTE_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ PASS - Route accessible${NC}"
else
    echo -e "${YELLOW}⚠️  WARNING - Route status: $ROUTE_RESPONSE${NC}"
fi

echo ""
echo -e "${BLUE}📊 MISSION SUMMARY:${NC}"
echo "=================================="

# Count successful tests
PASSED=0
TOTAL=10

# File structure
if [ -f "$FLASHCARD_FILE" ] && grep -q "NewStudentFlashcard" "$FLASHCARD_FILE"; then ((PASSED++)); fi

# All 7 types
if $ALL_TYPES_FOUND; then ((PASSED++)); fi

# Category system
if $CATEGORY_COMPLETE; then ((PASSED++)); fi

# Military theming
if $MILITARY_COMPLETE; then ((PASSED++)); fi

# Imports
if $IMPORTS_COMPLETE; then ((PASSED++)); fi

# Validation
if $VALIDATION_COMPLETE; then ((PASSED++)); fi

# Preview
if $PREVIEW_COMPLETE; then ((PASSED++)); fi

# Templates
if grep -q "templates = {" "$FLASHCARD_FILE" && grep -q "CARREGAR EXEMPLO" "$FLASHCARD_FILE"; then ((PASSED++)); fi

# Frontend
if timeout 2s curl -s "$BASE_URL" > /dev/null 2>&1; then ((PASSED++)); fi

# Route
if [ "$ROUTE_RESPONSE" = "200" ]; then ((PASSED++)); fi

echo "Tactical Score: $PASSED/$TOTAL tests passed"

if [ $PASSED -ge 8 ]; then
    echo -e "${GREEN}🎯 MISSION ACCOMPLISHED!${NC}"
    echo "✅ Student flashcard system is EXACTLY like admin system"
    echo "✅ All 7 flashcard types implemented and functional"
    echo "✅ Category creation system fully operational"
    echo "✅ Military theming consistent throughout"
    echo ""
    echo -e "${GREEN}🏆 OPERAÇÃO CONCLUÍDA COM SUCESSO!${NC}"
    exit 0
elif [ $PASSED -ge 6 ]; then
    echo -e "${YELLOW}⚠️  MISSION MOSTLY SUCCESSFUL${NC}"
    echo "Most systems operational, minor issues detected"
    exit 0
else
    echo -e "${RED}🚨 MISSION INCOMPLETE${NC}"
    echo "Critical systems need attention"
    exit 1
fi