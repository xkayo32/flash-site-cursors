#!/bin/bash

# Comprehensive Payment API Test Suite
# Tests all payment system endpoints with detailed validation

BASE_URL="http://localhost:8180/api/v1"
TIMESTAMP=$(date +%s)
TEST_CARD_NUMBER="4242"
NEW_PAYMENT_METHOD_ID=""
PAYMENT_COUNT=0
SUCCESS_COUNT=0
FAIL_COUNT=0

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_header() {
    echo -e "${BLUE}=================================="
    echo -e "🚀 PAYMENT API TEST SUITE"
    echo -e "==================================${NC}"
    echo ""
}

print_test() {
    echo -e "${YELLOW}$1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
    ((SUCCESS_COUNT++))
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
    ((FAIL_COUNT++))
}

print_summary() {
    echo ""
    echo -e "${BLUE}=================================="
    echo -e "📊 TEST SUMMARY"
    echo -e "==================================${NC}"
    echo -e "Total Tests: $((SUCCESS_COUNT + FAIL_COUNT))"
    echo -e "${GREEN}Passed: $SUCCESS_COUNT${NC}"
    echo -e "${RED}Failed: $FAIL_COUNT${NC}"
    
    if [ $FAIL_COUNT -eq 0 ]; then
        echo -e "${GREEN}🎉 ALL TESTS PASSED!${NC}"
    else
        echo -e "${RED}❌ SOME TESTS FAILED${NC}"
    fi
}

# Validate JSON response
validate_json() {
    local response="$1"
    local test_name="$2"
    
    if echo "$response" | jq . >/dev/null 2>&1; then
        local success=$(echo "$response" | jq -r '.success // false')
        if [ "$success" = "true" ]; then
            print_success "$test_name - Valid JSON response with success=true"
            return 0
        else
            local message=$(echo "$response" | jq -r '.message // "No message"')
            print_error "$test_name - API returned success=false: $message"
            return 1
        fi
    else
        print_error "$test_name - Invalid JSON response"
        echo "Response: $response"
        return 1
    fi
}

# Main test execution
print_header

# 1. Authentication Test
print_test "1. 🔐 Testing Authentication..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email": "aluno@example.com", "password": "aluno123"}')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token // empty' 2>/dev/null)

if [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
    print_success "Authentication - Token obtained successfully"
    echo "Token: ${TOKEN:0:20}..."
else
    print_error "Authentication - Failed to obtain token"
    echo "Response: $LOGIN_RESPONSE"
    exit 1
fi

echo ""

# 2. Get Payment Methods
print_test "2. 💳 Testing GET /payment/methods..."
METHODS_RESPONSE=$(curl -s -X GET "$BASE_URL/payment/methods" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json")

if validate_json "$METHODS_RESPONSE" "Get Payment Methods"; then
    EXISTING_METHODS=$(echo "$METHODS_RESPONSE" | jq '.data | length')
    echo "   Found $EXISTING_METHODS existing payment methods"
fi

echo ""

# 3. Add New Payment Method
print_test "3. ➕ Testing POST /payment/methods..."
ADD_METHOD_RESPONSE=$(curl -s -X POST "$BASE_URL/payment/methods" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "brand": "mastercard",
        "last4": "5555",
        "expiry_month": 8,
        "expiry_year": 2027,
        "holder_name": "Test User",
        "nickname": "CARTÃO DE TESTE AUTOMATIZADO",
        "is_default": false
    }')

if validate_json "$ADD_METHOD_RESPONSE" "Add Payment Method"; then
    NEW_PAYMENT_METHOD_ID=$(echo "$ADD_METHOD_RESPONSE" | jq -r '.data.id')
    echo "   New payment method ID: $NEW_PAYMENT_METHOD_ID"
fi

echo ""

# 4. Update Payment Method
if [ -n "$NEW_PAYMENT_METHOD_ID" ]; then
    print_test "4. ✏️ Testing PUT /payment/methods/$NEW_PAYMENT_METHOD_ID..."
    UPDATE_METHOD_RESPONSE=$(curl -s -X PUT "$BASE_URL/payment/methods/$NEW_PAYMENT_METHOD_ID" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d '{
            "nickname": "CARTÃO ATUALIZADO VIA TESTE",
            "is_default": true
        }')
    
    validate_json "$UPDATE_METHOD_RESPONSE" "Update Payment Method"
else
    print_error "Update Payment Method - No payment method ID available"
fi

echo ""

# 5. Get Payment History
print_test "5. 📋 Testing GET /payment/history..."
HISTORY_RESPONSE=$(curl -s -X GET "$BASE_URL/payment/history?page=1&limit=5" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json")

if validate_json "$HISTORY_RESPONSE" "Get Payment History"; then
    HISTORY_COUNT=$(echo "$HISTORY_RESPONSE" | jq '.data | length')
    TOTAL_ITEMS=$(echo "$HISTORY_RESPONSE" | jq '.pagination.total_items')
    echo "   Found $HISTORY_COUNT payments (page 1), total: $TOTAL_ITEMS"
fi

echo ""

# 6. Get Payment History with Status Filter
print_test "6. 🔍 Testing GET /payment/history (filtered by status)..."
FILTERED_HISTORY_RESPONSE=$(curl -s -X GET "$BASE_URL/payment/history?status=succeeded" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json")

if validate_json "$FILTERED_HISTORY_RESPONSE" "Get Filtered Payment History"; then
    SUCCEEDED_COUNT=$(echo "$FILTERED_HISTORY_RESPONSE" | jq '.data | length')
    echo "   Found $SUCCEEDED_COUNT successful payments"
fi

echo ""

# 7. Get Billing Address
print_test "7. 🏠 Testing GET /payment/billing..."
BILLING_GET_RESPONSE=$(curl -s -X GET "$BASE_URL/payment/billing" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json")

validate_json "$BILLING_GET_RESPONSE" "Get Billing Address"

echo ""

# 8. Update Billing Address
print_test "8. 🏠 Testing PUT /payment/billing..."
BILLING_UPDATE_RESPONSE=$(curl -s -X PUT "$BASE_URL/payment/billing" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "name": "Test User Updated",
        "email": "test.updated@email.com",
        "line1": "Rua Teste Automatizado, 999",
        "line2": "Sala de Testes",
        "city": "Cidade Teste",
        "state": "SP",
        "postal_code": "12345-678",
        "country": "BR"
    }')

validate_json "$BILLING_UPDATE_RESPONSE" "Update Billing Address"

echo ""

# 9. Get Subscription
print_test "9. 📋 Testing GET /payment/subscription/manage..."
SUBSCRIPTION_RESPONSE=$(curl -s -X GET "$BASE_URL/payment/subscription/manage" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json")

# Subscription might not exist (404), which is valid
if echo "$SUBSCRIPTION_RESPONSE" | jq . >/dev/null 2>&1; then
    success=$(echo "$SUBSCRIPTION_RESPONSE" | jq -r '.success // false')
    if [ "$success" = "true" ]; then
        print_success "Get Subscription - Active subscription found"
        PLAN_NAME=$(echo "$SUBSCRIPTION_RESPONSE" | jq -r '.data.plan_name')
        echo "   Plan: $PLAN_NAME"
    else
        # Check if it's a 404 (no subscription)
        message=$(echo "$SUBSCRIPTION_RESPONSE" | jq -r '.message // ""')
        if [[ "$message" == *"NENHUMA OPERAÇÃO ATIVA"* ]]; then
            print_success "Get Subscription - No active subscription (expected)"
        else
            print_error "Get Subscription - Unexpected error: $message"
        fi
    fi
else
    print_error "Get Subscription - Invalid JSON response"
fi

echo ""

# 10. Get Notification Settings
print_test "10. 🔔 Testing GET /payment/notifications..."
NOTIFICATIONS_GET_RESPONSE=$(curl -s -X GET "$BASE_URL/payment/notifications" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json")

validate_json "$NOTIFICATIONS_GET_RESPONSE" "Get Notification Settings"

echo ""

# 11. Update Notification Settings
print_test "11. 🔔 Testing PUT /payment/notifications..."
NOTIFICATIONS_UPDATE_RESPONSE=$(curl -s -X PUT "$BASE_URL/payment/notifications" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "payment_reminders": false,
        "payment_failures": true,
        "promotional_offers": true
    }')

validate_json "$NOTIFICATIONS_UPDATE_RESPONSE" "Update Notification Settings"

echo ""

# 12. Test Invoice Download (if available)
print_test "12. 📄 Testing GET /payment/invoices/[id]/download..."
# Get first available invoice from history
if [ -n "$HISTORY_RESPONSE" ]; then
    INVOICE_ID=$(echo "$HISTORY_RESPONSE" | jq -r '.data[0].invoice_id // empty' 2>/dev/null)
    
    if [ -n "$INVOICE_ID" ] && [ "$INVOICE_ID" != "null" ]; then
        INVOICE_DOWNLOAD_RESPONSE=$(curl -s -X GET "$BASE_URL/payment/invoices/$INVOICE_ID/download" \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json")
        
        validate_json "$INVOICE_DOWNLOAD_RESPONSE" "Download Invoice"
    else
        print_success "Download Invoice - No invoices available to test (expected)"
    fi
else
    print_error "Download Invoice - No payment history available"
fi

echo ""

# 13. Clean up - Remove test payment method
if [ -n "$NEW_PAYMENT_METHOD_ID" ]; then
    print_test "13. 🗑️ Testing DELETE /payment/methods/$NEW_PAYMENT_METHOD_ID..."
    DELETE_METHOD_RESPONSE=$(curl -s -X DELETE "$BASE_URL/payment/methods/$NEW_PAYMENT_METHOD_ID" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json")
    
    validate_json "$DELETE_METHOD_RESPONSE" "Delete Payment Method"
else
    print_error "Delete Payment Method - No payment method ID to delete"
fi

echo ""

# 14. Verify payment method was deleted
print_test "14. ✅ Testing GET /payment/methods (verification after delete)..."
FINAL_METHODS_RESPONSE=$(curl -s -X GET "$BASE_URL/payment/methods" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json")

if validate_json "$FINAL_METHODS_RESPONSE" "Verify Payment Methods After Delete"; then
    FINAL_METHODS_COUNT=$(echo "$FINAL_METHODS_RESPONSE" | jq '.data | length')
    echo "   Final payment methods count: $FINAL_METHODS_COUNT"
    
    # Check if our test method was actually deleted
    if [ -n "$NEW_PAYMENT_METHOD_ID" ]; then
        DELETED_METHOD=$(echo "$FINAL_METHODS_RESPONSE" | jq --arg id "$NEW_PAYMENT_METHOD_ID" '.data[] | select(.id == $id)')
        if [ -z "$DELETED_METHOD" ]; then
            print_success "Delete Verification - Test payment method successfully removed"
        else
            print_error "Delete Verification - Test payment method still exists"
        fi
    fi
fi

echo ""

# Final summary
print_summary

# Exit with appropriate code
if [ $FAIL_COUNT -eq 0 ]; then
    exit 0
else
    exit 1
fi