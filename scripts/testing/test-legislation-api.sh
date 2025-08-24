#!/bin/bash

# Test script for Legislation API
# Usage: ./test-legislation-api.sh [BASE_URL] [JWT_TOKEN]

BASE_URL=${1:-"http://localhost:8180/api/v1"}
JWT_TOKEN=${2:-""}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    case $status in
        "PASS")
            echo -e "${GREEN}✅ PASS${NC}: $message"
            ;;
        "FAIL")
            echo -e "${RED}❌ FAIL${NC}: $message"
            ;;
        "INFO")
            echo -e "${BLUE}ℹ️  INFO${NC}: $message"
            ;;
        "WARN")
            echo -e "${YELLOW}⚠️  WARN${NC}: $message"
            ;;
    esac
}

# Function to make HTTP request
make_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    
    print_status "INFO" "Testing: $description"
    echo "Request: $method $BASE_URL$endpoint"
    
    if [ -n "$JWT_TOKEN" ]; then
        if [ -n "$data" ]; then
            response=$(curl -s -w "\n%{http_code}" -X "$method" \
                -H "Content-Type: application/json" \
                -H "Authorization: Bearer $JWT_TOKEN" \
                -d "$data" \
                "$BASE_URL$endpoint")
        else
            response=$(curl -s -w "\n%{http_code}" -X "$method" \
                -H "Authorization: Bearer $JWT_TOKEN" \
                "$BASE_URL$endpoint")
        fi
    else
        if [ -n "$data" ]; then
            response=$(curl -s -w "\n%{http_code}" -X "$method" \
                -H "Content-Type: application/json" \
                -d "$data" \
                "$BASE_URL$endpoint")
        else
            response=$(curl -s -w "\n%{http_code}" -X "$method" \
                "$BASE_URL$endpoint")
        fi
    fi
    
    # Extract response body and status code
    body=$(echo "$response" | sed '$d')
    status_code=$(echo "$response" | tail -n1)
    
    # Print response
    echo "Status: $status_code"
    echo "Response: $body" | jq . 2>/dev/null || echo "Response: $body"
    echo ""
    
    # Return the actual HTTP status code
    return 0
}

# Test header
echo "============================================"
echo "🏛️  LEGISLATION API TEST SUITE"
echo "============================================"
echo "Base URL: $BASE_URL"
echo "JWT Token: ${JWT_TOKEN:0:20}${JWT_TOKEN:20:+...}"
echo "============================================"
echo ""

# Test counter
total_tests=0
passed_tests=0

# Function to run test and count results
run_test() {
    total_tests=$((total_tests + 1))
    make_request "$@"
    if [ "$status_code" = "200" ] || [ "$status_code" = "201" ] || [ "$status_code" = "204" ]; then
        passed_tests=$((passed_tests + 1))
        print_status "PASS" "Test passed (HTTP $status_code)"
    else
        print_status "FAIL" "Test failed (HTTP $status_code)"
    fi
    echo "----------------------------------------"
}

# Function for tests that expect specific status codes (like 404, 400)
run_error_test() {
    local expected_status=$5
    total_tests=$((total_tests + 1))
    make_request "$1" "$2" "$3" "$4"
    if [ "$status_code" = "$expected_status" ]; then
        passed_tests=$((passed_tests + 1))
        print_status "PASS" "Test passed - expected error (HTTP $status_code)"
    else
        print_status "FAIL" "Test failed - expected HTTP $expected_status, got HTTP $status_code"
    fi
    echo "----------------------------------------"
}

# 1. GET /legislation - List all legislation
run_test "GET" "/legislation" "" "Get all legislation"

# 2. GET /legislation with filters
run_test "GET" "/legislation?type=law&limit=5" "" "Get legislation filtered by type=law"

# 3. GET /legislation with search
run_test "GET" "/legislation?keyword=penal&limit=3" "" "Get legislation with keyword search"

# 4. GET /legislation with pagination
run_test "GET" "/legislation?limit=2&offset=0&sort=year&order=desc" "" "Get legislation with pagination"

# 5. GET /legislation/search - Full-text search
run_test "GET" "/legislation/search?q=homicídio&limit=3" "" "Search legislation with full-text"

# 6. GET /legislation/search with filters
run_test "GET" "/legislation/search?q=crime&type=law&subject_area=Direito Penal" "" "Search with filters"

# 7. GET /legislation/types - Get all types
run_test "GET" "/legislation/types" "" "Get legislation types"

# 8. GET /legislation/subjects - Get all subject areas
run_test "GET" "/legislation/subjects" "" "Get legislation subject areas"

# 9. GET /legislation/recent - Recent legislation
run_test "GET" "/legislation/recent?limit=5" "" "Get recent legislation"

# 10. GET /legislation/popular - Popular legislation
run_test "GET" "/legislation/popular?limit=5" "" "Get popular legislation"

# 11. GET /legislation/:id - Get specific legislation
run_test "GET" "/legislation/leg_001" "" "Get Constitution (CF/88)"

# 12. GET /legislation/:id - Get another specific legislation
run_test "GET" "/legislation/leg_002" "" "Get Criminal Code"

# 13. GET /legislation/:id/articles - Get articles of legislation
run_test "GET" "/legislation/leg_001/articles" "" "Get articles of Constitution"

# 14. GET /legislation/:id/articles with filter
run_test "GET" "/legislation/leg_002/articles?article_number=121" "" "Get specific article (Art. 121)"

# 15. GET /legislation/:id/related - Get related legislation
run_test "GET" "/legislation/leg_001/related" "" "Get related legislation to Constitution"

# If JWT token is provided, test authenticated endpoints
if [ -n "$JWT_TOKEN" ]; then
    echo ""
    echo "🔐 TESTING AUTHENTICATED ENDPOINTS"
    echo "============================================"
    
    # 16. POST /legislation - Create new legislation (requires auth)
    new_legislation='{
        "title": "Lei Teste API",
        "type": "law",
        "number": "Lei 99.999/24",
        "year": 2024,
        "subject_area": "Direito Administrativo",
        "description": "Lei criada para teste da API",
        "full_text": "Texto completo da lei teste...",
        "articles": [
            {
                "id": "art_test_001",
                "number": "Art. 1º",
                "title": "Objetivo",
                "content": "Esta lei tem por objetivo testar a API de legislação.",
                "paragraphs": []
            }
        ],
        "keywords": ["teste", "api", "legislação"],
        "status": "active",
        "publication_date": "2024-08-12",
        "summary": "Lei criada especificamente para testar a funcionalidade da API."
    }'
    
    run_test "POST" "/legislation" "$new_legislation" "Create new legislation"
    
    # Store the created legislation ID for further tests (if successful)
    if [ $? -eq 201 ]; then
        CREATED_ID=$(echo "$body" | jq -r '.id' 2>/dev/null)
        if [ "$CREATED_ID" != "null" ] && [ -n "$CREATED_ID" ]; then
            print_status "INFO" "Created legislation with ID: $CREATED_ID"
            
            # 17. PUT /legislation/:id - Update legislation
            updated_legislation='{
                "title": "Lei Teste API - Atualizada",
                "description": "Lei criada para teste da API - versão atualizada"
            }'
            
            run_test "PUT" "/legislation/$CREATED_ID" "$updated_legislation" "Update created legislation"
            
            # 18. POST /legislation/:id/bookmark - Bookmark legislation
            bookmark_data='{"notes": "Marcado para teste da API"}'
            run_test "POST" "/legislation/$CREATED_ID/bookmark" "$bookmark_data" "Bookmark legislation"
            
            # 19. GET /legislation/bookmarks - Get user bookmarks
            run_test "GET" "/legislation/bookmarks" "" "Get user bookmarks"
            
            # 20. DELETE /legislation/:id/bookmark - Remove bookmark
            run_test "DELETE" "/legislation/$CREATED_ID/bookmark" "" "Remove bookmark"
            
            # 21. DELETE /legislation/:id - Delete legislation
            run_test "DELETE" "/legislation/$CREATED_ID" "" "Delete created legislation"
        fi
    fi
    
    # 22. Bookmark existing legislation
    run_test "POST" "/legislation/leg_001/bookmark" '{"notes": "Constituição Federal marcada"}' "Bookmark Constitution"
    
    # 23. Get bookmarks again
    run_test "GET" "/legislation/bookmarks" "" "Get bookmarks after adding Constitution"
    
    # 24. Remove bookmark from existing legislation
    run_test "DELETE" "/legislation/leg_001/bookmark" "" "Remove Constitution bookmark"
    
    # 25. GET /legislation/statistics/overview - Statistics (admin only)
    run_test "GET" "/legislation/statistics/overview" "" "Get statistics overview (admin only)"
    
else
    echo ""
    print_status "WARN" "No JWT token provided - skipping authenticated endpoints"
    echo "To test authenticated endpoints, provide JWT token as second argument:"
    echo "  $0 $BASE_URL <jwt_token>"
fi

# Test various error cases
echo ""
echo "🚫 TESTING ERROR CASES"
echo "============================================"

# 26. GET non-existent legislation
run_error_test "GET" "/legislation/nonexistent_id" "" "Get non-existent legislation (should return 404)" 404

# 27. Search without query parameter
run_error_test "GET" "/legislation/search" "" "Search without query parameter (should return 400)" 400

# 28. Get articles of non-existent legislation
run_error_test "GET" "/legislation/nonexistent_id/articles" "" "Get articles of non-existent legislation (should return 404)" 404

# Summary
echo ""
echo "============================================"
echo "📊 TEST RESULTS SUMMARY"
echo "============================================"
echo "Total tests: $total_tests"
echo "Passed: $passed_tests"
echo "Failed: $((total_tests - passed_tests))"
echo "Success rate: $((passed_tests * 100 / total_tests))%"

if [ $passed_tests -eq $total_tests ]; then
    print_status "PASS" "All tests passed! 🎉"
    exit 0
else
    print_status "FAIL" "Some tests failed. Check the output above for details."
    exit 1
fi