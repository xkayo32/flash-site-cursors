#!/bin/bash

# Test script for Estudos Backend Rust API endpoints
# Make sure the server is running before executing this script

BASE_URL="http://localhost:8180"
RUST_PORT=8181  # Docker mapped port

echo "=== Estudos Backend Rust - Endpoint Testing ==="
echo "Testing endpoints on $BASE_URL (or :$RUST_PORT for Docker)"
echo ""

# Function to test endpoint
test_endpoint() {
    local url=$1
    local name=$2
    echo "Testing $name:"
    echo "GET $url"
    
    response=$(curl -s -w "\n%{http_code}" "$url")
    status_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    if [ "$status_code" = "200" ]; then
        echo "✅ SUCCESS (HTTP $status_code)"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    else
        echo "❌ FAILED (HTTP $status_code)"
        echo "$body"
    fi
    echo ""
}

# Test if jq is available
if ! command -v jq &> /dev/null; then
    echo "⚠️  jq not found - JSON will not be formatted"
    echo ""
fi

# Test endpoints
echo "1. Root endpoint"
test_endpoint "$BASE_URL/" "Root Information"

echo "2. Simple health check"
test_endpoint "$BASE_URL/api/v1/health/simple" "Simple Health Check"

echo "3. Full health check (with database)"
test_endpoint "$BASE_URL/api/v1/health" "Full Health Check"

echo "4. Detailed health check"
test_endpoint "$BASE_URL/api/v1/health/detailed" "Detailed Health Check"

# Test Docker version if running
echo "=== Testing Docker Version (port $RUST_PORT) ==="
DOCKER_BASE="http://localhost:$RUST_PORT"

echo "5. Docker - Simple health check"
test_endpoint "$DOCKER_BASE/api/v1/health/simple" "Docker Simple Health"

echo "6. Docker - Full health check"
test_endpoint "$DOCKER_BASE/api/v1/health" "Docker Full Health"

echo "=== Test Summary ==="
echo "If all tests show ✅ SUCCESS, the Rust backend is working correctly!"
echo "If any test shows ❌ FAILED, check:"
echo "  1. Server is running (cargo run or docker-compose up)"
echo "  2. Database is available (PostgreSQL on port 5532 or 5533)"
echo "  3. No port conflicts"
echo ""
echo "Expected responses:"
echo "  - Root: Service info with version 0.1.0"
echo "  - Simple health: Basic API status"
echo "  - Full health: API + database status with metrics"
echo "  - Detailed health: Extended tests with query validation"