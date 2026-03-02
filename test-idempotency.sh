#!/bin/bash

# Idempotency Tests for New APIs

echo "🧪 Starting Idempotency Tests..."
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

# Test 1: Create User with Assignment (Idempotency)
echo "📝 Test 1: Create User with Assignment (Idempotency)"
echo "Creating user first time..."
RESPONSE1=$(curl -s -X POST http://localhost:5000/users/with-assignment \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userData": {
      "name": "Test User Idem",
      "email": "testidem@example.com",
      "password": "test123",
      "role": "user"
    },
    "assetIds": []
  }')

echo "$RESPONSE1" | jq '.success, .message'

echo "Creating same user again (should fail)..."
RESPONSE2=$(curl -s -X POST http://localhost:5000/users/with-assignment \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userData": {
      "name": "Test User Idem",
      "email": "testidem@example.com",
      "password": "test123",
      "role": "user"
    },
    "assetIds": []
  }')

SUCCESS2=$(echo "$RESPONSE2" | jq -r '.success')
if [ "$SUCCESS2" = "false" ]; then
  echo "✅ Idempotency maintained - duplicate prevented"
else
  echo "❌ Idempotency failed - duplicate created"
fi
echo ""

# Test 2: Assign Multiple Assets (Idempotency)
echo "📝 Test 2: Assign Multiple Assets (Idempotency)"

# Get available assets
ASSETS=$(curl -s -X GET "http://localhost:5000/master-data?assetType=assignable&status=available&limit=2" \
  -H "Authorization: Bearer $TOKEN")
ASSET1=$(echo "$ASSETS" | jq -r '.data.masterData[0]._id')
ASSET2=$(echo "$ASSETS" | jq -r '.data.masterData[1]._id')

if [ "$ASSET1" = "null" ] || [ "$ASSET2" = "null" ]; then
  echo "⚠️  Not enough available assets for test"
else
  # Get user
  USER_ID=$(echo "$RESPONSE1" | jq -r '.data.user._id')
  
  echo "Assigning assets first time..."
  ASSIGN1=$(curl -s -X POST http://localhost:5000/assignments/assign-multiple \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"assetIds\": [\"$ASSET1\", \"$ASSET2\"],
      \"userId\": \"$USER_ID\",
      \"notes\": \"Test assignment\"
    }")
  
  echo "$ASSIGN1" | jq '.success, .count'
  
  echo "Assigning same assets again (should fail)..."
  ASSIGN2=$(curl -s -X POST http://localhost:5000/assignments/assign-multiple \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"assetIds\": [\"$ASSET1\", \"$ASSET2\"],
      \"userId\": \"$USER_ID\",
      \"notes\": \"Test assignment\"
    }")
  
  SUCCESS_ASSIGN=$(echo "$ASSIGN2" | jq -r '.success')
  if [ "$SUCCESS_ASSIGN" = "false" ]; then
    echo "✅ Idempotency maintained - duplicate assignment prevented"
  else
    echo "❌ Idempotency failed - duplicate assignment created"
  fi
fi
echo ""

# Test 3: Create Multiple Assets (Idempotency)
echo "📝 Test 3: Create Multiple Assets (Idempotency)"

TIMESTAMP=$(date +%s)
echo "Creating assets first time..."
CREATE1=$(curl -s -X POST http://localhost:5000/assets/multiple \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"assets\": [
      {
        \"name\": \"Test Laptop\",
        \"assetType\": \"assignable\",
        \"category\": \"Laptop\",
        \"brand\": \"Test\",
        \"model\": \"Test Model\",
        \"serialNumber\": \"TEST${TIMESTAMP}001\",
        \"purchaseDate\": \"2024-02-26\",
        \"purchaseCost\": 50000
      },
      {
        \"name\": \"Test Laptop\",
        \"assetType\": \"assignable\",
        \"category\": \"Laptop\",
        \"brand\": \"Test\",
        \"model\": \"Test Model\",
        \"serialNumber\": \"TEST${TIMESTAMP}002\",
        \"purchaseDate\": \"2024-02-26\",
        \"purchaseCost\": 50000
      }
    ]
  }")

echo "$CREATE1" | jq '.success, .count'

echo "Creating same assets again (should fail due to duplicate serial)..."
CREATE2=$(curl -s -X POST http://localhost:5000/assets/multiple \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"assets\": [
      {
        \"name\": \"Test Laptop\",
        \"assetType\": \"assignable\",
        \"category\": \"Laptop\",
        \"brand\": \"Test\",
        \"model\": \"Test Model\",
        \"serialNumber\": \"TEST${TIMESTAMP}001\",
        \"purchaseDate\": \"2024-02-26\",
        \"purchaseCost\": 50000
      }
    ]
  }")

SUCCESS_CREATE=$(echo "$CREATE2" | jq -r '.success')
if [ "$SUCCESS_CREATE" = "false" ]; then
  echo "✅ Idempotency maintained - duplicate serial prevented"
else
  echo "❌ Idempotency failed - duplicate serial created"
fi
echo ""

# Test 4: Complete Maintenance (Idempotency)
echo "📝 Test 4: Complete Maintenance (Idempotency)"

# Create maintenance first
MAINT_ASSET=$(curl -s -X GET "http://localhost:5000/master-data?limit=1" \
  -H "Authorization: Bearer $TOKEN" | jq -r '.data.masterData[0]._id')

if [ "$MAINT_ASSET" != "null" ]; then
  echo "Creating maintenance schedule..."
  MAINT=$(curl -s -X POST http://localhost:5000/maintenance \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"assetId\": \"$MAINT_ASSET\",
      \"type\": \"preventive\",
      \"frequency\": \"monthly\",
      \"serviceDate\": \"2024-02-01\",
      \"description\": \"Test maintenance\"
    }")
  
  MAINT_ID=$(echo "$MAINT" | jq -r '.data._id')
  echo "Maintenance ID: $MAINT_ID"
  
  echo "Completing maintenance first time..."
  COMPLETE1=$(curl -s -X POST "http://localhost:5000/maintenance/$MAINT_ID/complete" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "cost": 1000,
      "performedBy": "Test Tech"
    }')
  
  echo "$COMPLETE1" | jq '.success'
  
  echo "Completing same maintenance again (should fail)..."
  COMPLETE2=$(curl -s -X POST "http://localhost:5000/maintenance/$MAINT_ID/complete" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "cost": 1000,
      "performedBy": "Test Tech"
    }')
  
  SUCCESS_COMPLETE=$(echo "$COMPLETE2" | jq -r '.success')
  if [ "$SUCCESS_COMPLETE" = "false" ]; then
    echo "✅ Idempotency maintained - already completed"
  else
    echo "❌ Idempotency failed - completed twice"
  fi
else
  echo "⚠️  No assets available for maintenance test"
fi
echo ""

# Test 5: Create Vendor (Idempotency)
echo "📝 Test 5: Create Vendor (Idempotency)"

VENDOR_TIMESTAMP=$(date +%s)
echo "Creating vendor first time..."
VENDOR1=$(curl -s -X POST http://localhost:5000/vendors \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Test Vendor ${VENDOR_TIMESTAMP}\",
    \"company\": \"Test Company\",
    \"contacts\": [{\"name\": \"Test\", \"mobile\": \"9999999999\"}],
    \"city\": \"Test City\",
    \"type\": \"Test Type\"
  }")

echo "$VENDOR1" | jq '.success'

echo "Creating same vendor again (allowed - no unique constraint on name)..."
VENDOR2=$(curl -s -X POST http://localhost:5000/vendors \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Test Vendor ${VENDOR_TIMESTAMP}\",
    \"company\": \"Test Company\",
    \"contacts\": [{\"name\": \"Test\", \"mobile\": \"9999999999\"}],
    \"city\": \"Test City\",
    \"type\": \"Test Type\"
  }")

SUCCESS_VENDOR=$(echo "$VENDOR2" | jq -r '.success')
if [ "$SUCCESS_VENDOR" = "true" ]; then
  echo "⚠️  Note: Vendors allow duplicates (no unique constraint)"
else
  echo "✅ Vendor creation prevented"
fi
echo ""

# Test 6: Complaint Status Transitions (Idempotency)
echo "📝 Test 6: Complaint Status Transitions (Idempotency)"

# Get first available asset
echo "Getting an asset..."
ASSET_DATA=$(curl -s -X GET http://localhost:5000/assets \
  -H "Authorization: Bearer $TOKEN")
ASSET_ID=$(echo "$ASSET_DATA" | jq -r '.data.assets[0]._id // empty')

if [ -z "$ASSET_ID" ]; then
  echo "No assets found, creating one..."
  ASSET_CREATE=$(curl -s -X POST http://localhost:5000/assets \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"name\": \"Test Asset for Complaint\",
      \"serialNumber\": \"TEST-COMPLAINT-$(date +%s)\",
      \"category\": \"Laptop\",
      \"status\": \"available\"
    }")
  ASSET_ID=$(echo "$ASSET_CREATE" | jq -r '.data._id // empty')
fi

if [ -z "$ASSET_ID" ]; then
  echo "⚠️  Could not get/create asset, skipping complaint test"
else
  echo "Using asset: $ASSET_ID"
  
  echo "Creating a complaint..."
  COMPLAINT=$(curl -s -X POST http://localhost:5000/complaints \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"assetId\": \"$ASSET_ID\",
      \"title\": \"Test Complaint\",
      \"description\": \"Test issue\",
      \"priority\": \"medium\"
    }")

  COMPLAINT_ID=$(echo "$COMPLAINT" | jq -r '.data._id')
  echo "Complaint created: $COMPLAINT_ID"

  echo "Transitioning to acknowledged..."
  curl -s -X PATCH http://localhost:5000/complaints/$COMPLAINT_ID \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"status":"acknowledged"}' | jq '.success'

  echo "Transitioning to in-progress..."
  curl -s -X PATCH http://localhost:5000/complaints/$COMPLAINT_ID \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"status":"in-progress"}' | jq '.success'

  echo "Completing complaint..."
  curl -s -X PATCH http://localhost:5000/complaints/$COMPLAINT_ID \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"status":"completed"}' | jq '.success'

  echo "Attempting to reopen completed complaint (should fail)..."
  REOPEN=$(curl -s -X PATCH http://localhost:5000/complaints/$COMPLAINT_ID \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"status":"new"}')

  SUCCESS_REOPEN=$(echo "$REOPEN" | jq -r '.success')
  if [ "$SUCCESS_REOPEN" = "false" ]; then
    echo "✅ Completed complaint cannot be reopened"
  else
    echo "❌ Completed complaint was reopened (should be prevented)"
  fi
fi
echo ""

echo "✅ Idempotency Tests Complete!"
echo ""
echo "📊 Summary:"
echo "- User creation: Prevents duplicates by email"
echo "- Asset assignment: Prevents duplicate assignments"
echo "- Asset creation: Prevents duplicate serial numbers"
echo "- Maintenance completion: Prevents double completion"
echo "- Vendor creation: Allows duplicates (add unique constraint if needed)"
echo "- Complaint status: Prevents reopening completed complaints"
