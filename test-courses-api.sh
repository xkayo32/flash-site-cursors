#!/bin/bash

# Comprehensive Test Script for Courses Management API
# Tests all CRUD operations, modules/lessons hierarchy, and file uploads

BASE_URL="http://173.208.151.106:8180"
API_URL="${BASE_URL}/api/v1"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Global variables for storing test data
JWT_TOKEN=""
TEST_COURSE_ID=""
TEST_MODULE_ID=""
TEST_LESSON_ID=""

# Helper functions
print_header() {
    echo -e "\n${BLUE}================== $1 ==================${NC}"
}

print_test() {
    echo -e "\n${YELLOW}Testing: $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
    ((PASSED_TESTS++))
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
    ((FAILED_TESTS++))
}

print_info() {
    echo -e "ℹ $1"
}

((TOTAL_TESTS++))

# Test function template
run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_status="$3"
    
    print_test "$test_name"
    ((TOTAL_TESTS++))
    
    # Execute the test command and capture response
    response=$(eval "$test_command" 2>&1)
    status_code=$(echo "$response" | tail -n1 | grep -o '[0-9]\+$' || echo "000")
    
    if [ "$status_code" = "$expected_status" ]; then
        print_success "$test_name - Status: $status_code"
        echo "$response" | head -n -1 | jq '.' 2>/dev/null || echo "$response" | head -n -1
    else
        print_error "$test_name - Expected: $expected_status, Got: $status_code"
        echo "$response" | head -n -1
    fi
}

# Authentication setup
setup_auth() {
    print_header "AUTHENTICATION SETUP"
    
    print_test "Login to get JWT token"
    ((TOTAL_TESTS++))
    
    login_response=$(curl -s -w "\n%{http_code}" -X POST \
        -H "Content-Type: application/x-www-form-urlencoded" \
        -d "email=admin@studypro.com&password=Admin@123" \
        "${API_URL}/auth/login")
    
    status_code=$(echo "$login_response" | tail -n1)
    response_body=$(echo "$login_response" | head -n -1)
    
    if [ "$status_code" = "200" ]; then
        JWT_TOKEN=$(echo "$response_body" | jq -r '.token // .data.token' 2>/dev/null)
        if [ "$JWT_TOKEN" != "null" ] && [ -n "$JWT_TOKEN" ]; then
            print_success "Authentication successful"
            print_info "Token: ${JWT_TOKEN:0:20}..."
        else
            print_error "Failed to extract token from response"
            echo "$response_body"
            exit 1
        fi
    else
        print_error "Authentication failed - Status: $status_code"
        echo "$response_body"
        exit 1
    fi
}

# Test Courses endpoints
test_courses() {
    print_header "COURSES CRUD OPERATIONS"
    
    # Test 1: List all courses
    print_test "GET /api/v1/courses - List all courses"
    ((TOTAL_TESTS++))
    
    list_response=$(curl -s -w "\n%{http_code}" \
        -H "Authorization: Bearer $JWT_TOKEN" \
        "${API_URL}/courses")
    
    status_code=$(echo "$list_response" | tail -n1)
    response_body=$(echo "$list_response" | head -n -1)
    
    if [ "$status_code" = "200" ]; then
        success=$(echo "$response_body" | jq -r '.success')
        if [ "$success" = "true" ]; then
            print_success "List courses successful"
            course_count=$(echo "$response_body" | jq '.data | length')
            print_info "Found $course_count courses"
        else
            print_error "List courses failed - success: false"
        fi
    else
        print_error "List courses failed - Status: $status_code"
    fi
    
    # Test 2: Get course statistics
    print_test "GET /api/v1/courses/stats - Get course statistics"
    ((TOTAL_TESTS++))
    
    stats_response=$(curl -s -w "\n%{http_code}" \
        -H "Authorization: Bearer $JWT_TOKEN" \
        "${API_URL}/courses/stats")
    
    status_code=$(echo "$stats_response" | tail -n1)
    response_body=$(echo "$stats_response" | head -n -1)
    
    if [ "$status_code" = "200" ]; then
        success=$(echo "$response_body" | jq -r '.success')
        if [ "$success" = "true" ]; then
            print_success "Get course stats successful"
            total_courses=$(echo "$response_body" | jq '.data.total_courses')
            print_info "Total courses: $total_courses"
        else
            print_error "Get course stats failed - success: false"
        fi
    else
        print_error "Get course stats failed - Status: $status_code"
    fi
    
    # Test 3: Create new course
    print_test "POST /api/v1/courses - Create new course"
    ((TOTAL_TESTS++))
    
    create_response=$(curl -s -w "\n%{http_code}" -X POST \
        -H "Authorization: Bearer $JWT_TOKEN" \
        -H "Content-Type: application/x-www-form-urlencoded" \
        -d "title=Curso de Teste API&description=Curso criado para testar a API&category=TECNOLOGIA&price=99.90&difficulty_level=intermediate&duration_hours=20&duration_months=2&certification_available=true&requirements=[\"Conhecimento básico\",\"Computador com internet\"]&objectives=[\"Aprender API REST\",\"Dominar testes automatizados\"]&tags=[\"API\",\"TESTE\"]&instructor_name=Prof. Teste&instructor_rank=INSTRUTOR" \
        "${API_URL}/courses")
    
    status_code=$(echo "$create_response" | tail -n1)
    response_body=$(echo "$create_response" | head -n -1)
    
    if [ "$status_code" = "201" ]; then
        success=$(echo "$response_body" | jq -r '.success')
        if [ "$success" = "true" ]; then
            TEST_COURSE_ID=$(echo "$response_body" | jq -r '.data.id')
            print_success "Create course successful"
            print_info "Course ID: $TEST_COURSE_ID"
        else
            print_error "Create course failed - success: false"
            echo "$response_body"
        fi
    else
        print_error "Create course failed - Status: $status_code"
        echo "$response_body"
    fi
    
    # Test 4: Get specific course
    if [ -n "$TEST_COURSE_ID" ]; then
        print_test "GET /api/v1/courses/:id - Get specific course"
        ((TOTAL_TESTS++))
        
        get_response=$(curl -s -w "\n%{http_code}" \
            -H "Authorization: Bearer $JWT_TOKEN" \
            "${API_URL}/courses/$TEST_COURSE_ID")
        
        status_code=$(echo "$get_response" | tail -n1)
        response_body=$(echo "$get_response" | head -n -1)
        
        if [ "$status_code" = "200" ]; then
            success=$(echo "$response_body" | jq -r '.success')
            if [ "$success" = "true" ]; then
                print_success "Get course successful"
                course_title=$(echo "$response_body" | jq -r '.data.title')
                print_info "Course title: $course_title"
            else
                print_error "Get course failed - success: false"
            fi
        else
            print_error "Get course failed - Status: $status_code"
        fi
    fi
    
    # Test 5: Update course
    if [ -n "$TEST_COURSE_ID" ]; then
        print_test "PUT /api/v1/courses/:id - Update course"
        ((TOTAL_TESTS++))
        
        update_response=$(curl -s -w "\n%{http_code}" -X PUT \
            -H "Authorization: Bearer $JWT_TOKEN" \
            -H "Content-Type: application/x-www-form-urlencoded" \
            -d "title=Curso de Teste API - Atualizado&description=Curso atualizado via API&price=149.90&status=published" \
            "${API_URL}/courses/$TEST_COURSE_ID")
        
        status_code=$(echo "$update_response" | tail -n1)
        response_body=$(echo "$update_response" | head -n -1)
        
        if [ "$status_code" = "200" ]; then
            success=$(echo "$response_body" | jq -r '.success')
            if [ "$success" = "true" ]; then
                print_success "Update course successful"
                updated_title=$(echo "$response_body" | jq -r '.data.title')
                print_info "Updated title: $updated_title"
            else
                print_error "Update course failed - success: false"
            fi
        else
            print_error "Update course failed - Status: $status_code"
        fi
    fi
}

# Test Modules endpoints
test_modules() {
    print_header "MODULES CRUD OPERATIONS"
    
    if [ -z "$TEST_COURSE_ID" ]; then
        print_error "Skipping module tests - no course ID available"
        return
    fi
    
    # Test 1: Create new module
    print_test "POST /api/v1/courses/:courseId/modules - Create new module"
    ((TOTAL_TESTS++))
    
    module_response=$(curl -s -w "\n%{http_code}" -X POST \
        -H "Authorization: Bearer $JWT_TOKEN" \
        -H "Content-Type: application/x-www-form-urlencoded" \
        -d "title=Módulo de Teste&description=Módulo criado para testar a API&is_published=true" \
        "${API_URL}/courses/$TEST_COURSE_ID/modules")
    
    status_code=$(echo "$module_response" | tail -n1)
    response_body=$(echo "$module_response" | head -n -1)
    
    if [ "$status_code" = "201" ]; then
        success=$(echo "$response_body" | jq -r '.success')
        if [ "$success" = "true" ]; then
            TEST_MODULE_ID=$(echo "$response_body" | jq -r '.data.id')
            print_success "Create module successful"
            print_info "Module ID: $TEST_MODULE_ID"
        else
            print_error "Create module failed - success: false"
        fi
    else
        print_error "Create module failed - Status: $status_code"
        echo "$response_body"
    fi
    
    # Test 2: List course modules
    print_test "GET /api/v1/courses/:courseId/modules - List course modules"
    ((TOTAL_TESTS++))
    
    list_modules_response=$(curl -s -w "\n%{http_code}" \
        -H "Authorization: Bearer $JWT_TOKEN" \
        "${API_URL}/courses/$TEST_COURSE_ID/modules")
    
    status_code=$(echo "$list_modules_response" | tail -n1)
    response_body=$(echo "$list_modules_response" | head -n -1)
    
    if [ "$status_code" = "200" ]; then
        success=$(echo "$response_body" | jq -r '.success')
        if [ "$success" = "true" ]; then
            print_success "List modules successful"
            module_count=$(echo "$response_body" | jq '.data | length')
            print_info "Found $module_count modules"
        else
            print_error "List modules failed - success: false"
        fi
    else
        print_error "List modules failed - Status: $status_code"
    fi
    
    # Test 3: Update module
    if [ -n "$TEST_MODULE_ID" ]; then
        print_test "PUT /api/v1/courses/:courseId/modules/:id - Update module"
        ((TOTAL_TESTS++))
        
        update_module_response=$(curl -s -w "\n%{http_code}" -X PUT \
            -H "Authorization: Bearer $JWT_TOKEN" \
            -H "Content-Type: application/x-www-form-urlencoded" \
            -d "title=Módulo de Teste - Atualizado&description=Módulo atualizado via API" \
            "${API_URL}/courses/$TEST_COURSE_ID/modules/$TEST_MODULE_ID")
        
        status_code=$(echo "$update_module_response" | tail -n1)
        response_body=$(echo "$update_module_response" | head -n -1)
        
        if [ "$status_code" = "200" ]; then
            success=$(echo "$response_body" | jq -r '.success')
            if [ "$success" = "true" ]; then
                print_success "Update module successful"
            else
                print_error "Update module failed - success: false"
            fi
        else
            print_error "Update module failed - Status: $status_code"
        fi
    fi
}

# Test Lessons endpoints
test_lessons() {
    print_header "LESSONS CRUD OPERATIONS"
    
    if [ -z "$TEST_MODULE_ID" ]; then
        print_error "Skipping lesson tests - no module ID available"
        return
    fi
    
    # Test 1: Create new lesson
    print_test "POST /api/v1/modules/:moduleId/lessons - Create new lesson"
    ((TOTAL_TESTS++))
    
    lesson_response=$(curl -s -w "\n%{http_code}" -X POST \
        -H "Authorization: Bearer $JWT_TOKEN" \
        -H "Content-Type: application/x-www-form-urlencoded" \
        -d "title=Aula de Teste&description=Aula criada para testar a API&type=video&duration_minutes=30&video_url=https://example.com/video.mp4&is_published=true&is_free=false" \
        "${API_URL}/modules/$TEST_MODULE_ID/lessons")
    
    status_code=$(echo "$lesson_response" | tail -n1)
    response_body=$(echo "$lesson_response" | head -n -1)
    
    if [ "$status_code" = "201" ]; then
        success=$(echo "$response_body" | jq -r '.success')
        if [ "$success" = "true" ]; then
            TEST_LESSON_ID=$(echo "$response_body" | jq -r '.data.id')
            print_success "Create lesson successful"
            print_info "Lesson ID: $TEST_LESSON_ID"
        else
            print_error "Create lesson failed - success: false"
        fi
    else
        print_error "Create lesson failed - Status: $status_code"
        echo "$response_body"
    fi
    
    # Test 2: List module lessons
    print_test "GET /api/v1/modules/:moduleId/lessons - List module lessons"
    ((TOTAL_TESTS++))
    
    list_lessons_response=$(curl -s -w "\n%{http_code}" \
        -H "Authorization: Bearer $JWT_TOKEN" \
        "${API_URL}/modules/$TEST_MODULE_ID/lessons")
    
    status_code=$(echo "$list_lessons_response" | tail -n1)
    response_body=$(echo "$list_lessons_response" | head -n -1)
    
    if [ "$status_code" = "200" ]; then
        success=$(echo "$response_body" | jq -r '.success')
        if [ "$success" = "true" ]; then
            print_success "List lessons successful"
            lesson_count=$(echo "$response_body" | jq '.data | length')
            print_info "Found $lesson_count lessons"
        else
            print_error "List lessons failed - success: false"
        fi
    else
        print_error "List lessons failed - Status: $status_code"
    fi
    
    # Test 3: Update lesson
    if [ -n "$TEST_LESSON_ID" ]; then
        print_test "PUT /api/v1/modules/:moduleId/lessons/:id - Update lesson"
        ((TOTAL_TESTS++))
        
        update_lesson_response=$(curl -s -w "\n%{http_code}" -X PUT \
            -H "Authorization: Bearer $JWT_TOKEN" \
            -H "Content-Type: application/x-www-form-urlencoded" \
            -d "title=Aula de Teste - Atualizada&description=Aula atualizada via API&duration_minutes=45" \
            "${API_URL}/modules/$TEST_MODULE_ID/lessons/$TEST_LESSON_ID")
        
        status_code=$(echo "$update_lesson_response" | tail -n1)
        response_body=$(echo "$update_lesson_response" | head -n -1)
        
        if [ "$status_code" = "200" ]; then
            success=$(echo "$response_body" | jq -r '.success')
            if [ "$success" = "true" ]; then
                print_success "Update lesson successful"
            else
                print_error "Update lesson failed - success: false"
            fi
        else
            print_error "Update lesson failed - Status: $status_code"
        fi
    fi
}

# Test Enrollment endpoints
test_enrollment() {
    print_header "ENROLLMENT OPERATIONS"
    
    if [ -z "$TEST_COURSE_ID" ]; then
        print_error "Skipping enrollment tests - no course ID available"
        return
    fi
    
    # Test 1: Enroll in course
    print_test "POST /api/v1/courses/:id/enroll - Enroll in course"
    ((TOTAL_TESTS++))
    
    enroll_response=$(curl -s -w "\n%{http_code}" -X POST \
        -H "Authorization: Bearer $JWT_TOKEN" \
        -H "Content-Type: application/x-www-form-urlencoded" \
        -d "" \
        "${API_URL}/courses/$TEST_COURSE_ID/enroll")
    
    status_code=$(echo "$enroll_response" | tail -n1)
    response_body=$(echo "$enroll_response" | head -n -1)
    
    if [ "$status_code" = "200" ]; then
        success=$(echo "$response_body" | jq -r '.success')
        if [ "$success" = "true" ]; then
            print_success "Course enrollment successful"
        else
            print_error "Course enrollment failed - success: false"
        fi
    else
        print_error "Course enrollment failed - Status: $status_code"
        echo "$response_body"
    fi
    
    # Test 2: Mark lesson as complete
    if [ -n "$TEST_LESSON_ID" ]; then
        print_test "POST /api/v1/courses/:courseId/lessons/:lessonId/complete - Mark lesson complete"
        ((TOTAL_TESTS++))
        
        complete_response=$(curl -s -w "\n%{http_code}" -X POST \
            -H "Authorization: Bearer $JWT_TOKEN" \
            -H "Content-Type: application/x-www-form-urlencoded" \
            -d "" \
            "${API_URL}/courses/$TEST_COURSE_ID/lessons/$TEST_LESSON_ID/complete")
        
        status_code=$(echo "$complete_response" | tail -n1)
        response_body=$(echo "$complete_response" | head -n -1)
        
        if [ "$status_code" = "200" ]; then
            success=$(echo "$response_body" | jq -r '.success')
            if [ "$success" = "true" ]; then
                print_success "Mark lesson complete successful"
            else
                print_error "Mark lesson complete failed - success: false"
            fi
        else
            print_error "Mark lesson complete failed - Status: $status_code"
        fi
    fi
}

# Test File Upload (if we have a test image)
test_file_upload() {
    print_header "FILE UPLOAD OPERATIONS"
    
    if [ -z "$TEST_COURSE_ID" ]; then
        print_error "Skipping file upload tests - no course ID available"
        return
    fi
    
    # Create a small test image if it doesn't exist
    TEST_IMAGE="/tmp/test_course_thumbnail.png"
    if [ ! -f "$TEST_IMAGE" ]; then
        # Create a simple 1x1 PNG image
        printf '\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\x0cIDATx\x9cc\xf8\x00\x00\x00\x01\x00\x01:\x05\x80\x8d\x00\x00\x00\x00IEND\xaeB`\x82' > "$TEST_IMAGE"
    fi
    
    if [ -f "$TEST_IMAGE" ]; then
        print_test "POST /api/v1/courses/:id/thumbnail - Upload course thumbnail"
        ((TOTAL_TESTS++))
        
        upload_response=$(curl -s -w "\n%{http_code}" -X POST \
            -H "Authorization: Bearer $JWT_TOKEN" \
            -F "thumbnail=@$TEST_IMAGE" \
            "${API_URL}/courses/$TEST_COURSE_ID/thumbnail")
        
        status_code=$(echo "$upload_response" | tail -n1)
        response_body=$(echo "$upload_response" | head -n -1)
        
        if [ "$status_code" = "200" ]; then
            success=$(echo "$response_body" | jq -r '.success')
            if [ "$success" = "true" ]; then
                print_success "Upload thumbnail successful"
                thumbnail_url=$(echo "$response_body" | jq -r '.data.thumbnail')
                print_info "Thumbnail URL: $thumbnail_url"
            else
                print_error "Upload thumbnail failed - success: false"
            fi
        else
            print_error "Upload thumbnail failed - Status: $status_code"
            echo "$response_body"
        fi
        
        # Clean up test image
        rm -f "$TEST_IMAGE"
    else
        print_error "Could not create test image for upload test"
    fi
}

# Cleanup - Delete test data
cleanup_test_data() {
    print_header "CLEANUP - DELETING TEST DATA"
    
    # Delete lesson
    if [ -n "$TEST_LESSON_ID" ]; then
        print_test "DELETE /api/v1/modules/:moduleId/lessons/:id - Delete lesson"
        ((TOTAL_TESTS++))
        
        delete_lesson_response=$(curl -s -w "\n%{http_code}" -X DELETE \
            -H "Authorization: Bearer $JWT_TOKEN" \
            "${API_URL}/modules/$TEST_MODULE_ID/lessons/$TEST_LESSON_ID")
        
        status_code=$(echo "$delete_lesson_response" | tail -n1)
        if [ "$status_code" = "200" ]; then
            print_success "Delete lesson successful"
        else
            print_error "Delete lesson failed - Status: $status_code"
        fi
    fi
    
    # Delete module
    if [ -n "$TEST_MODULE_ID" ]; then
        print_test "DELETE /api/v1/courses/:courseId/modules/:id - Delete module"
        ((TOTAL_TESTS++))
        
        delete_module_response=$(curl -s -w "\n%{http_code}" -X DELETE \
            -H "Authorization: Bearer $JWT_TOKEN" \
            "${API_URL}/courses/$TEST_COURSE_ID/modules/$TEST_MODULE_ID")
        
        status_code=$(echo "$delete_module_response" | tail -n1)
        if [ "$status_code" = "200" ]; then
            print_success "Delete module successful"
        else
            print_error "Delete module failed - Status: $status_code"
        fi
    fi
    
    # Delete course
    if [ -n "$TEST_COURSE_ID" ]; then
        print_test "DELETE /api/v1/courses/:id - Delete course"
        ((TOTAL_TESTS++))
        
        delete_course_response=$(curl -s -w "\n%{http_code}" -X DELETE \
            -H "Authorization: Bearer $JWT_TOKEN" \
            "${API_URL}/courses/$TEST_COURSE_ID")
        
        status_code=$(echo "$delete_course_response" | tail -n1)
        if [ "$status_code" = "200" ]; then
            print_success "Delete course successful"
        else
            print_error "Delete course failed - Status: $status_code"
        fi
    fi
}

# Test summary
print_summary() {
    print_header "TEST SUMMARY"
    
    echo -e "Total Tests: $TOTAL_TESTS"
    echo -e "${GREEN}Passed: $PASSED_TESTS${NC}"
    echo -e "${RED}Failed: $FAILED_TESTS${NC}"
    
    if [ $FAILED_TESTS -eq 0 ]; then
        echo -e "\n${GREEN}🎉 All tests passed! The Courses API is working correctly.${NC}"
        exit 0
    else
        echo -e "\n${RED}❌ Some tests failed. Please check the API implementation.${NC}"
        exit 1
    fi
}

# Main test execution
main() {
    echo -e "${BLUE}🚀 Starting Courses Management API Tests${NC}"
    echo -e "Base URL: $BASE_URL"
    echo -e "API URL: $API_URL"
    
    # Check if jq is installed
    if ! command -v jq &> /dev/null; then
        echo -e "${RED}Error: jq is not installed. Please install jq to run these tests.${NC}"
        echo -e "Ubuntu/Debian: sudo apt-get install jq"
        echo -e "macOS: brew install jq"
        exit 1
    fi
    
    # Check if curl is installed
    if ! command -v curl &> /dev/null; then
        echo -e "${RED}Error: curl is not installed. Please install curl to run these tests.${NC}"
        exit 1
    fi
    
    # Run tests in order
    setup_auth
    test_courses
    test_modules
    test_lessons
    test_enrollment
    test_file_upload
    cleanup_test_data
    print_summary
}

# Run main function
main "$@"