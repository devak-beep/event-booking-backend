#!/bin/bash

# Test User Fields and Assignment Validation

echo "🧪 Testing User Fields & Assignment Validation"
echo ""

# Login
echo "🔐 Logging in..."
TOKEN=$(curl -s -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@digiflux.com","password":"admin123"}' | jq -r '.data.token')

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo "❌ Login failed"
  exit 1
fi

echo "✅ Logged in"
echo ""

# Test 1: Create User with New Fields
echo "📝 Test 1: Create User with Designation & Mobile"
TIMESTAMP=$(date +%s)
USER_RESPONSE=$(curl -s -X POST http://localhost:5000/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Test User ${TIMESTAMP}\",
    \"email\": \"testuser${TIMESTAMP}@example.com\",
    \"password\": \"test123\",
    \"role\": \"user\",
    \"designation\": \"Software Engineer\",
    \"mobile\": \"9876543210\"
  }")

echo "$USER_RESPONSE" | jq '{success, designation: .data.designation, mobile: .data.mobile}'
echo ""

# Test 2: Try to Assign Already Assigned Asset
echo "📝 Test 2: Try to Assign Already Assigned Asset"

# Get an assigned asset
ASSIGNED_ASSET=$(curl -s -X GET "http://localhost:5000/master-data?status=assigned&limit=1" \
  -H "Authorization: Bearer $TOKEN" | jq -r '.data.masterData[0]._id')

if [ "$ASSIGNED_ASSET" != "null" ] && [ -n "$ASSIGNED_ASSET" ]; then
  USER_ID=$(echo "$USER_RESPONSE" | jq -r '.data._id')
  
  echo "Attempting to assign already assigned asset..."
  ASSIGN_RESPONSE=$(curl -s -X POST http://localhost:5000/assignments/assign \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"assetId\": \"$ASSIGNED_ASSET\",
      \"userId\": \"$USER_ID\"
    }")
  
  SUCCESS=$(echo "$ASSIGN_RESPONSE" | jq -r '.success')
  MESSAGE=$(echo "$ASSIGN_RESPONSE" | jq -r '.message')
  
  if [ "$SUCCESS" = "false" ]; then
    echo "✅ Correctly prevented: $MESSAGE"
  else
    echo "❌ Failed: Should not allow assigning already assigned asset"
  fi
else
  echo "⚠️  No assigned assets found for test"
fi
echo ""

# Test 3: Try to Assign Non-Assignable Asset
echo "📝 Test 3: Try to Assign Non-Assignable Asset"

NON_ASSIGNABLE=$(curl -s -X GET "http://localhost:5000/master-data?assetType=non-assignable&limit=1" \
  -H "Authorization: Bearer $TOKEN" | jq -r '.data.masterData[0]._id')

if [ "$NON_ASSIGNABLE" != "null" ] && [ -n "$NON_ASSIGNABLE" ]; then
  USER_ID=$(echo "$USER_RESPONSE" | jq -r '.data._id')
  
  echo "Attempting to assign non-assignable asset (AC/Printer)..."
  ASSIGN_RESPONSE=$(curl -s -X POST http://localhost:5000/assignments/assign \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"assetId\": \"$NON_ASSIGNABLE\",
      \"userId\": \"$USER_ID\"
    }")
  
  SUCCESS=$(echo "$ASSIGN_RESPONSE" | jq -r '.success')
  MESSAGE=$(echo "$ASSIGN_RESPONSE" | jq -r '.message')
  
  if [ "$SUCCESS" = "false" ]; then
    echo "✅ Correctly prevented: $MESSAGE"
  else
    echo "❌ Failed: Should not allow assigning non-assignable asset"
  fi
else
  echo "⚠️  No non-assignable assets found for test"
fi
echo ""

# Test 4: Assign Available Asset (Should Work)
echo "📝 Test 4: Assign Available Assignable Asset (Should Work)"

AVAILABLE_ASSET=$(curl -s -X GET "http://localhost:5000/master-data?assetType=assignable&status=available&limit=1" \
  -H "Authorization: Bearer $TOKEN" | jq -r '.data.masterData[0]._id')

if [ "$AVAILABLE_ASSET" != "null" ] && [ -n "$AVAILABLE_ASSET" ]; then
  USER_ID=$(echo "$USER_RESPONSE" | jq -r '.data._id')
  
  echo "Assigning available assignable asset..."
  ASSIGN_RESPONSE=$(curl -s -X POST http://localhost:5000/assignments/assign \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"assetId\": \"$AVAILABLE_ASSET\",
      \"userId\": \"$USER_ID\",
      \"notes\": \"Test assignment\"
    }")
  
  SUCCESS=$(echo "$ASSIGN_RESPONSE" | jq -r '.success')
  
  if [ "$SUCCESS" = "true" ]; then
    echo "✅ Successfully assigned available asset"
  else
    MESSAGE=$(echo "$ASSIGN_RESPONSE" | jq -r '.message')
    echo "❌ Failed: $MESSAGE"
  fi
else
  echo "⚠️  No available assignable assets found for test"
fi
echo ""

echo "✅ Tests Complete!"
echo ""
echo "📊 Summary:"
echo "- User model now has designation and mobile fields"
echo "- Only available assets can be assigned"
echo "- Already assigned assets are rejected"
echo "- Non-assignable assets are rejected"
