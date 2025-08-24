#!/bin/bash

echo "📊 Atualizando dados dos cursos com estatísticas"
echo "================================================="

BACKEND_URL="http://localhost:8180"
ADMIN_EMAIL="admin@studypro.com"
ADMIN_PASSWORD="Admin@123"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Login
echo -e "${YELLOW}🔑 Fazendo login como admin...${NC}"
login_response=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$ADMIN_EMAIL\", \"password\":\"$ADMIN_PASSWORD\"}" \
    "$BACKEND_URL/api/v1/auth/login")

TOKEN=$(echo $login_response | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "❌ Falha no login"
    exit 1
fi

echo -e "${GREEN}✅ Autenticado${NC}"

# Função para atualizar módulos e aulas
update_course_stats() {
    local course_id="$1"
    local modules="$2"
    local lessons="$3"
    
    echo -e "\n${YELLOW}Atualizando curso ID: $course_id${NC}"
    echo "Módulos: $modules, Aulas: $lessons"
    
    # Adicionar módulos ao curso
    for i in $(seq 1 $modules); do
        module_response=$(curl -s -X POST \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/x-www-form-urlencoded" \
            -d "title=Módulo $i" \
            -d "description=Conteúdo do módulo $i" \
            -d "order_index=$i" \
            "$BACKEND_URL/api/v1/courses/$course_id/modules")
        
        success=$(echo "$module_response" | grep -o '"success":true')
        if [ -n "$success" ]; then
            echo "✅ Módulo $i criado"
            
            module_id=$(echo "$module_response" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
            
            # Adicionar aulas ao módulo
            lessons_per_module=$((lessons / modules))
            for j in $(seq 1 $lessons_per_module); do
                lesson_response=$(curl -s -X POST \
                    -H "Authorization: Bearer $TOKEN" \
                    -H "Content-Type: application/x-www-form-urlencoded" \
                    -d "title=Aula $j" \
                    -d "description=Conteúdo da aula $j" \
                    -d "order_index=$j" \
                    -d "duration_minutes=45" \
                    -d "type=video" \
                    "$BACKEND_URL/api/v1/courses/$course_id/modules/$module_id/lessons")
                
                lesson_success=$(echo "$lesson_response" | grep -o '"success":true')
                if [ -n "$lesson_success" ]; then
                    echo "  ✅ Aula $j adicionada ao módulo $i"
                fi
            done
        fi
    done
}

# Buscar cursos existentes
echo -e "\n${YELLOW}📚 Buscando cursos para atualizar...${NC}"
courses_response=$(curl -s -X GET \
    -H "Authorization: Bearer $TOKEN" \
    "$BACKEND_URL/api/v1/courses?limit=100")

# Extrair IDs e títulos dos cursos
course_ids=($(echo "$courses_response" | grep -o '"id":"[^"]*' | cut -d'"' -f4))
course_titles=($(echo "$courses_response" | grep -o '"title":"[^"]*' | cut -d'"' -f4))

# Configurações de módulos e aulas para cada curso
declare -A course_config
course_config["POLÍCIA FEDERAL"]="8 40"
course_config["RECEITA FEDERAL"]="10 50"
course_config["TJ/TRF"]="6 30"
course_config["BANCO CENTRAL"]="7 35"
course_config["TCU"]="12 60"
course_config["INSS"]="5 25"
course_config["PRF"]="7 35"
course_config["AGEPEN"]="6 30"
course_config["CGU"]="9 45"
course_config["SEFAZ"]="8 40"
course_config["Direito Constitucional"]="10 50"

# Atualizar cada curso
for i in "${!course_ids[@]}"; do
    course_id="${course_ids[$i]}"
    
    # Buscar detalhes do curso
    course_detail=$(curl -s -X GET \
        -H "Authorization: Bearer $TOKEN" \
        "$BACKEND_URL/api/v1/courses/$course_id")
    
    title=$(echo "$course_detail" | grep -o '"title":"[^"]*' | head -1 | cut -d'"' -f4)
    
    echo -e "\n${YELLOW}Processando: $title${NC}"
    
    # Verificar se já tem módulos
    existing_modules=$(echo "$course_detail" | grep -o '"modules":[0-9]*' | cut -d':' -f2)
    
    if [ "$existing_modules" -eq "0" ] || [ -z "$existing_modules" ]; then
        # Determinar configuração baseada no título
        for key in "${!course_config[@]}"; do
            if [[ "$title" == *"$key"* ]]; then
                config="${course_config[$key]}"
                modules=$(echo $config | cut -d' ' -f1)
                lessons=$(echo $config | cut -d' ' -f2)
                
                echo "Configuração encontrada: $modules módulos, $lessons aulas"
                update_course_stats "$course_id" "$modules" "$lessons"
                break
            fi
        done
    else
        echo "✓ Curso já possui $existing_modules módulos"
    fi
done

echo -e "\n${GREEN}🎉 Atualização concluída!${NC}"

# Verificar resultado final
echo -e "\n${YELLOW}📊 Verificando estatísticas finais...${NC}"
final_response=$(curl -s -X GET \
    -H "Authorization: Bearer $TOKEN" \
    "$BACKEND_URL/api/v1/courses?status=published")

echo "$final_response" | jq -r '.data[] | "✅ \(.title): \(.stats.modules) módulos, \(.stats.lessons) aulas"'

echo -e "\n${GREEN}✨ Dados dos cursos atualizados com sucesso!${NC}"