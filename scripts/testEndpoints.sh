#!/bin/bash

# API Endpoint Testing Script using cURL
# Tests all endpoints for the Metacognition Learning Engine
# Run with: bash scripts/testEndpoints.sh

BASE_URL="http://localhost:3000/api"
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Sample content for testing
SAMPLE_CONTENT='Photosynthesis is the process by which plants, algae, and some bacteria convert light energy into chemical energy stored in glucose. This process occurs primarily in the chloroplasts of plant cells, specifically in structures called thylakoids and stroma. The process has two main stages: light-dependent reactions and light-independent reactions (Calvin cycle). During the light-dependent reactions, which occur in the thylakoid membranes, chlorophyll absorbs light energy. This energy is used to split water molecules (H₂O) in a process called photolysis, releasing oxygen as a byproduct. The energy is also used to produce ATP (adenosine triphosphate) and NADPH, which are energy-carrying molecules. The light-independent reactions, also known as the Calvin cycle, take place in the stroma of the chloroplast.'

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║   Metacognition Learning Engine - API Endpoint Tests      ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${BLUE}🌐 Base URL: $BASE_URL${NC}"
echo ""

# Test 1: Generate Chunks
echo "════════════════════════════════════════════════════════════"
echo -e "${YELLOW}TEST 1: Generate Chunks from Content${NC}"
echo "════════════════════════════════════════════════════════════"
echo -e "${BLUE}📤 POST /api/chunks/generate${NC}"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/chunks/generate" \
  -H "Content-Type: application/json" \
  -d "{
    \"content\": \"$SAMPLE_CONTENT\",
    \"title\": \"Photosynthesis Study Session\"
  }")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✅ Status: $HTTP_CODE${NC}"
  echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"

  # Extract sessionId for later tests
  SESSION_ID=$(echo "$BODY" | python3 -c "import sys, json; print(json.load(sys.stdin).get('sessionId', ''))" 2>/dev/null)
  CHUNK_ID=$(echo "$BODY" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data['chunks'][0]['chunkId'] if data.get('chunks') else '')" 2>/dev/null)

  echo -e "${GREEN}💾 Saved sessionId: $SESSION_ID${NC}"
  echo -e "${GREEN}💾 Saved chunkId: $CHUNK_ID${NC}"
else
  echo -e "${RED}❌ Status: $HTTP_CODE${NC}"
  echo "$BODY"
fi

echo ""
sleep 1

# Test 2: Get All Sessions
echo "════════════════════════════════════════════════════════════"
echo -e "${YELLOW}TEST 2: Get All Sessions${NC}"
echo "════════════════════════════════════════════════════════════"
echo -e "${BLUE}📤 GET /api/sessions${NC}"

RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/sessions")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✅ Status: $HTTP_CODE${NC}"
  echo "$BODY" | python3 -m json.tool 2>/dev/null | head -20
else
  echo -e "${RED}❌ Status: $HTTP_CODE${NC}"
  echo "$BODY"
fi

echo ""
sleep 1

# Test 3: Get Specific Session
if [ -n "$SESSION_ID" ]; then
  echo "════════════════════════════════════════════════════════════"
  echo -e "${YELLOW}TEST 3: Get Specific Session${NC}"
  echo "════════════════════════════════════════════════════════════"
  echo -e "${BLUE}📤 GET /api/sessions/$SESSION_ID${NC}"

  RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/sessions/$SESSION_ID")
  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | sed '$d')

  if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Status: $HTTP_CODE${NC}"
    echo "$BODY" | python3 -m json.tool 2>/dev/null | head -30
  else
    echo -e "${RED}❌ Status: $HTTP_CODE${NC}"
    echo "$BODY"
  fi

  echo ""
  sleep 1
fi

# Test 4: Submit Response
if [ -n "$SESSION_ID" ] && [ -n "$CHUNK_ID" ]; then
  echo "════════════════════════════════════════════════════════════"
  echo -e "${YELLOW}TEST 4: Submit Chunk Response${NC}"
  echo "════════════════════════════════════════════════════════════"
  echo -e "${BLUE}📤 POST /api/responses${NC}"

  RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/responses" \
    -H "Content-Type: application/json" \
    -d "{
      \"sessionId\": \"$SESSION_ID\",
      \"chunkId\": \"$CHUNK_ID\",
      \"goal\": \"explain\",
      \"strategy\": \"self-explain\",
      \"userAnswer\": \"Photosynthesis converts light energy into chemical energy. It occurs in chloroplasts through light-dependent reactions and the Calvin cycle.\",
      \"confidence\": 75
    }")

  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | sed '$d')

  if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Status: $HTTP_CODE${NC}"
    echo "$BODY" | python3 -m json.tool 2>/dev/null
  else
    echo -e "${RED}❌ Status: $HTTP_CODE${NC}"
    echo "$BODY"
  fi

  echo ""
  sleep 1
fi

# Test 5: Get Session Summary
if [ -n "$SESSION_ID" ]; then
  echo "════════════════════════════════════════════════════════════"
  echo -e "${YELLOW}TEST 5: Get Session Summary${NC}"
  echo "════════════════════════════════════════════════════════════"
  echo -e "${BLUE}📤 GET /api/sessions/$SESSION_ID/summary${NC}"

  RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/sessions/$SESSION_ID/summary")
  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | sed '$d')

  if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Status: $HTTP_CODE${NC}"
    echo "$BODY" | python3 -m json.tool 2>/dev/null
  else
    echo -e "${RED}❌ Status: $HTTP_CODE${NC}"
    echo "$BODY"
  fi

  echo ""
fi

echo "════════════════════════════════════════════════════════════"
echo -e "${GREEN}✅ Test suite completed!${NC}"
echo "════════════════════════════════════════════════════════════"
echo ""
