#!/bin/bash

# Script para verificar dados hardcoded nas páginas admin

echo "=== Verificando Dados Hardcoded nas Páginas Admin ==="
echo ""

ADMIN_DIR="/home/administrator/flash-site-cursors/frontend/src/pages/admin"
ISSUES_FOUND=0

# Lista de páginas para verificar
PAGES=(
    "AdminDashboard.tsx"
    "UserManager.tsx"
    "CourseCreator.tsx"
    "CourseEditor.tsx"
    "CategoryManager.tsx"
    "QuestionEditor.tsx"
    "FlashcardManager.tsx"
    "IndividualFlashcards.tsx"
    "MockExamManagerSimple.tsx"
    "PreviousExamsManagerSimple.tsx"
    "SummaryEditor.tsx"
    "LegislationManager.tsx"
    "AdminSettings.tsx"
    "ContentManager.tsx"
)

# Padrões que indicam dados hardcoded
PATTERNS=(
    "const.*=.*\[\s*{.*id:"
    "const.*=.*\[\s*{.*name:"
    "const.*=.*\[\s*{.*title:"
    "mockData"
    "fakeData"
    "dummyData"
    "exampleData"
    "testData"
    "sampleData"
    "const users = \["
    "const courses = \["
    "const questions = \["
    "const flashcards = \["
    "const categories = \["
)

for PAGE in "${PAGES[@]}"; do
    FILE="$ADMIN_DIR/$PAGE"
    
    if [ -f "$FILE" ]; then
        echo "📄 Verificando: $PAGE"
        FOUND=false
        
        for PATTERN in "${PATTERNS[@]}"; do
            MATCHES=$(grep -n "$PATTERN" "$FILE" 2>/dev/null | head -3)
            
            if [ ! -z "$MATCHES" ]; then
                if [ "$FOUND" = false ]; then
                    echo "  ⚠️  DADOS HARDCODED ENCONTRADOS:"
                    FOUND=true
                    ((ISSUES_FOUND++))
                fi
                echo "    Pattern: $PATTERN"
                echo "$MATCHES" | while read -r line; do
                    echo "      Linha $line"
                done
            fi
        done
        
        # Verificar especificamente por arrays grandes de objetos
        LARGE_ARRAYS=$(awk '/const.*=.*\[/{p=1} p{print NR": "$0} /\];/{if(p) exit}' "$FILE" | head -10)
        if [ $(echo "$LARGE_ARRAYS" | wc -l) -gt 5 ]; then
            if [ "$FOUND" = false ]; then
                echo "  ⚠️  POSSÍVEL ARRAY HARDCODED GRANDE:"
                FOUND=true
                ((ISSUES_FOUND++))
            fi
            echo "$LARGE_ARRAYS" | head -5
        fi
        
        if [ "$FOUND" = false ]; then
            echo "  ✅ OK - Sem dados hardcoded óbvios"
        fi
        
        echo ""
    else
        echo "❌ Arquivo não encontrado: $PAGE"
        echo ""
    fi
done

echo "=== RESUMO ==="
echo "Total de páginas com possíveis dados hardcoded: $ISSUES_FOUND"

if [ $ISSUES_FOUND -gt 0 ]; then
    echo ""
    echo "⚠️  Recomendação: Verificar manualmente as páginas com issues encontradas"
    exit 1
else
    echo "✅ Nenhum dado hardcoded óbvio encontrado!"
    exit 0
fi