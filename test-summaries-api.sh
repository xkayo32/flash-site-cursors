#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# API Base URL
API_URL="http://173.208.151.106:8180/api/v1"

# Function to print colored output
print_test() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}       SUMMARY API TESTS${NC}"
echo -e "${BLUE}=========================================${NC}"

# Test 1: Login as Admin
print_test "1. Admin Login"
ADMIN_LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@studypro.com",
    "password": "Admin@123"
  }')

ADMIN_TOKEN=$(echo "$ADMIN_LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -n "$ADMIN_TOKEN" ]; then
    print_success "Admin login successful"
    echo "Token: ${ADMIN_TOKEN:0:20}..."
else
    print_error "Admin login failed"
    echo "Response: $ADMIN_LOGIN_RESPONSE"
    exit 1
fi

# Test 2: Create Summary
print_test "2. Create Summary"
CREATE_RESPONSE=$(curl -s -X POST "$API_URL/summaries" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "title": "Teste de Resumo API",
    "subject": "Direito Constitucional",
    "topic": "Teste",
    "content": "# Resumo de Teste\n\nEste é um resumo criado para testar a API.",
    "summary_type": "text",
    "difficulty": "basic",
    "estimated_reading_time": 5,
    "tags": ["teste", "api"],
    "visibility": "private"
  }')

SUMMARY_ID=$(echo "$CREATE_RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)

if [ -n "$SUMMARY_ID" ]; then
    print_success "Summary created with ID: $SUMMARY_ID"
else
    print_error "Failed to create summary"
    echo "Response: $CREATE_RESPONSE"
fi

# Test 3: List Summaries
print_test "3. List Summaries"
LIST_RESPONSE=$(curl -s -X GET "$API_URL/summaries" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

SUMMARY_COUNT=$(echo "$LIST_RESPONSE" | grep -o '"total":[0-9]*' | cut -d':' -f2)

if [ -n "$SUMMARY_COUNT" ] && [ "$SUMMARY_COUNT" -gt 0 ]; then
    print_success "Listed $SUMMARY_COUNT summaries"
else
    print_error "Failed to list summaries"
    echo "Response: $LIST_RESPONSE"
fi

# Test 4: Get Summary by ID
if [ -n "$SUMMARY_ID" ]; then
    print_test "4. Get Summary by ID"
    GET_RESPONSE=$(curl -s -X GET "$API_URL/summaries/$SUMMARY_ID" \
      -H "Authorization: Bearer $ADMIN_TOKEN")
    
    FOUND_TITLE=$(echo "$GET_RESPONSE" | grep -o '"title":"[^"]*"' | cut -d'"' -f4)
    
    if [ "$FOUND_TITLE" = "Teste de Resumo API" ]; then
        print_success "Summary retrieved successfully"
    else
        print_error "Failed to retrieve summary"
        echo "Response: $GET_RESPONSE"
    fi
fi

# Test 5: Update Summary
if [ -n "$SUMMARY_ID" ]; then
    print_test "5. Update Summary"
    UPDATE_RESPONSE=$(curl -s -X PUT "$API_URL/summaries/$SUMMARY_ID" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $ADMIN_TOKEN" \
      -d '{
        "title": "Teste de Resumo API - Atualizado",
        "content": "# Resumo de Teste Atualizado\n\nEste resumo foi atualizado via API."
      }')
    
    UPDATED_TITLE=$(echo "$UPDATE_RESPONSE" | grep -o '"title":"[^"]*"' | cut -d'"' -f4)
    
    if [ "$UPDATED_TITLE" = "Teste de Resumo API - Atualizado" ]; then
        print_success "Summary updated successfully"
    else
        print_error "Failed to update summary"
        echo "Response: $UPDATE_RESPONSE"
    fi
fi

# Test 6: Login as Student
print_test "6. Student Login"
STUDENT_LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "aluno@example.com",
    "password": "aluno123"
  }')

STUDENT_TOKEN=$(echo "$STUDENT_LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -n "$STUDENT_TOKEN" ]; then
    print_success "Student login successful"
else
    print_error "Student login failed"
    echo "Response: $STUDENT_LOGIN_RESPONSE"
fi

# Test 7: Get Available Summaries (Student)
if [ -n "$STUDENT_TOKEN" ]; then
    print_test "7. Get Available Summaries (Student)"
    AVAILABLE_RESPONSE=$(curl -s -X GET "$API_URL/summaries/available" \
      -H "Authorization: Bearer $STUDENT_TOKEN")
    
    AVAILABLE_COUNT=$(echo "$AVAILABLE_RESPONSE" | grep -o '"total":[0-9]*' | cut -d':' -f2)
    
    if [ -n "$AVAILABLE_COUNT" ]; then
        print_success "Student can see $AVAILABLE_COUNT available summaries"
    else
        print_error "Failed to get available summaries for student"
        echo "Response: $AVAILABLE_RESPONSE"
    fi
fi

# Test 8: Publish Summary
if [ -n "$SUMMARY_ID" ]; then
    print_test "8. Publish Summary"
    PUBLISH_RESPONSE=$(curl -s -X POST "$API_URL/summaries/$SUMMARY_ID/publish" \
      -H "Authorization: Bearer $ADMIN_TOKEN")
    
    PUBLISHED_STATUS=$(echo "$PUBLISH_RESPONSE" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
    
    if [ "$PUBLISHED_STATUS" = "published" ]; then
        print_success "Summary published successfully"
    else
        print_error "Failed to publish summary"
        echo "Response: $PUBLISH_RESPONSE"
    fi
fi

# Test 9: Search Summaries
print_test "9. Search Summaries"
SEARCH_RESPONSE=$(curl -s -X GET "$API_URL/summaries/search?q=teste" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

SEARCH_COUNT=$(echo "$SEARCH_RESPONSE" | grep -o '"total":[0-9]*' | cut -d':' -f2)

if [ -n "$SEARCH_COUNT" ]; then
    print_success "Search returned $SEARCH_COUNT results"
else
    print_error "Search failed"
    echo "Response: $SEARCH_RESPONSE"
fi

# Test 10: Get Subjects
print_test "10. Get Subjects"
SUBJECTS_RESPONSE=$(curl -s -X GET "$API_URL/summaries/subjects" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

if echo "$SUBJECTS_RESPONSE" | grep -q "subjects"; then
    print_success "Subjects retrieved successfully"
else
    print_error "Failed to get subjects"
    echo "Response: $SUBJECTS_RESPONSE"
fi

# Test 11: Test without authentication
print_test "11. Test Without Authentication"
NO_AUTH_RESPONSE=$(curl -s -X GET "$API_URL/summaries")

if echo "$NO_AUTH_RESPONSE" | grep -q "Unauthorized\|401"; then
    print_success "Authentication required (correct)"
else
    print_warning "Endpoint accessible without authentication"
    echo "Response: $NO_AUTH_RESPONSE"
fi

# Test 12: Delete Summary (cleanup)
if [ -n "$SUMMARY_ID" ]; then
    print_test "12. Delete Summary (Cleanup)"
    DELETE_RESPONSE=$(curl -s -X DELETE "$API_URL/summaries/$SUMMARY_ID" \
      -H "Authorization: Bearer $ADMIN_TOKEN")
    
    if echo "$DELETE_RESPONSE" | grep -q "successfully\|deleted"; then
        print_success "Summary deleted successfully"
    else
        print_error "Failed to delete summary"
        echo "Response: $DELETE_RESPONSE"
    fi
fi

echo -e "\n${BLUE}=========================================${NC}"
echo -e "${BLUE}           TESTS COMPLETED${NC}"
echo -e "${BLUE}=========================================${NC}"

# Summary
echo -e "\n${YELLOW}Test Summary:${NC}"
echo -e "• API Base URL: $API_URL"
echo -e "• Admin Authentication: $([ -n "$ADMIN_TOKEN" ] && echo "✓ Working" || echo "✗ Failed")"
echo -e "• Student Authentication: $([ -n "$STUDENT_TOKEN" ] && echo "✓ Working" || echo "✗ Failed")"
echo -e "• Summary Creation: $([ -n "$SUMMARY_ID" ] && echo "✓ Working" || echo "✗ Failed")"
echo -e "• Basic CRUD Operations: ✓ Tested"
echo -e "• Authorization Control: ✓ Tested"