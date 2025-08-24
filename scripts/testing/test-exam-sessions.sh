#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_URL="http://173.208.151.106:8182/api/v1"

echo -e "${YELLOW}🔧 Testing Exam Sessions API${NC}"
echo "======================================="

# Get auth token from localStorage or login
echo -e "${YELLOW}1. Getting auth token...${NC}"

# Use the admin credentials
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "aluno@example.com",
    "password": "aluno123"
  }')

TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | sed 's/"token":"//')

if [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ Failed to get auth token${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Got token: ${TOKEN:0:20}...${NC}"

# Test 1: Get available previous exams
echo -e "\n${YELLOW}2. Getting available previous exams...${NC}"
EXAMS_RESPONSE=$(curl -s -X GET "$API_URL/previousexams" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "$EXAMS_RESPONSE" | jq '.' 2>/dev/null || echo "$EXAMS_RESPONSE"

# Extract first exam ID
EXAM_ID=$(echo "$EXAMS_RESPONSE" | grep -o '"id":"[^"]*' | head -1 | sed 's/"id":"//')

if [ -z "$EXAM_ID" ]; then
  echo -e "${RED}❌ No exams found${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Found exam ID: $EXAM_ID${NC}"

# Test 2: Start a new exam session
echo -e "\n${YELLOW}3. Starting new exam session...${NC}"
SESSION_RESPONSE=$(curl -s -X POST "$API_URL/exam-sessions/previous/$EXAM_ID/sessions" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "$SESSION_RESPONSE" | jq '.' 2>/dev/null || echo "$SESSION_RESPONSE"

# Extract session ID
SESSION_ID=$(echo "$SESSION_RESPONSE" | grep -o '"id":"[^"]*' | head -1 | sed 's/"id":"//')

if [ -z "$SESSION_ID" ]; then
  echo -e "${RED}❌ Failed to create session${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Created session ID: $SESSION_ID${NC}"

# Test 3: Get session details
echo -e "\n${YELLOW}4. Getting session details...${NC}"
SESSION_DETAILS=$(curl -s -X GET "$API_URL/exam-sessions/sessions/$SESSION_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "$SESSION_DETAILS" | jq '{id, examId, status, totalQuestions, questions: .questions | length}' 2>/dev/null || echo "$SESSION_DETAILS"

# Test 4: Save an answer
echo -e "\n${YELLOW}5. Saving an answer...${NC}"

# Get first question ID
QUESTION_ID=$(echo "$SESSION_DETAILS" | grep -o '"questions":\[{"id":"[^"]*' | sed 's/.*"id":"//')

if [ -n "$QUESTION_ID" ]; then
  ANSWER_RESPONSE=$(curl -s -X PUT "$API_URL/exam-sessions/sessions/$SESSION_ID/answers" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"questionId\": \"$QUESTION_ID\",
      \"alternativeId\": \"alt-$QUESTION_ID-0\"
    }")
  
  echo "$ANSWER_RESPONSE" | jq '.' 2>/dev/null || echo "$ANSWER_RESPONSE"
  echo -e "${GREEN}✅ Answer saved for question: $QUESTION_ID${NC}"
else
  echo -e "${YELLOW}⚠️ No questions found in session${NC}"
fi

# Test 5: Get user's active sessions
echo -e "\n${YELLOW}6. Getting user's active sessions...${NC}"
ACTIVE_SESSIONS=$(curl -s -X GET "$API_URL/exam-sessions/sessions?status=active&examType=previous" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "$ACTIVE_SESSIONS" | jq '.[0] | {id, examId, status, totalQuestions}' 2>/dev/null || echo "$ACTIVE_SESSIONS"

echo -e "\n${GREEN}✅ All exam session tests completed!${NC}"
echo "======================================="
echo -e "${GREEN}Session ID for testing: $SESSION_ID${NC}"
echo -e "${GREEN}You can now navigate to: http://173.208.151.106:5273/simulations/previous/$EXAM_ID/take${NC}"