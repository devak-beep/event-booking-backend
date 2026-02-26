#!/bin/bash

BASE_URL="http://localhost:5000"
TOKEN=""
ADMIN_ID=""
ASSET_ID=""
ASSIGNMENT_ID=""
MAINTENANCE_ID=""
WARRANTY_ID=""
ALERT_ID=""

echo "=========================================="
echo "IT Asset Management API Test Suite"
echo "=========================================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

pass() {
    echo -e "${GREEN}✓ PASS${NC}: $1"
}

fail() {
    echo -e "${RED}✗ FAIL${NC}: $1"
}

info() {
    echo -e "${YELLOW}ℹ INFO${NC}: $1"
}

# Test 1: Health Check
echo -e "\n=== TEST 1: Health Check ==="
RESPONSE=$(curl -s $BASE_URL/health)
if echo "$RESPONSE" | grep -q "Server is running"; then
    pass "Health check"
else
    fail "Health check"
fi

# Test 2: Register User (Idempotent - should fail on duplicate)
echo -e "\n=== TEST 2: User Registration ==="
RESPONSE=$(curl -s -X POST $BASE_URL/auth/register \
    -H "Content-Type: application/json" \
    -d '{"name":"Test Admin","email":"testadmin@test.com","password":"test123","role":"admin"}')

if echo "$RESPONSE" | grep -q "success.*true"; then
    pass "User registration"
    ADMIN_ID=$(echo "$RESPONSE" | jq -r '.data.user.id')
    TOKEN=$(echo "$RESPONSE" | jq -r '.data.token')
else
    info "User already exists, logging in..."
    RESPONSE=$(curl -s -X POST $BASE_URL/auth/login \
        -H "Content-Type: application/json" \
        -d '{"email":"testadmin@test.com","password":"test123"}')
    TOKEN=$(echo "$RESPONSE" | jq -r '.data.token')
    ADMIN_ID=$(echo "$RESPONSE" | jq -r '.data.user.id')
    pass "User login (idempotent)"
fi

# Test 3: Duplicate Registration (Idempotency Check)
echo -e "\n=== TEST 3: Duplicate Registration (Idempotency) ==="
RESPONSE=$(curl -s -X POST $BASE_URL/auth/register \
    -H "Content-Type: application/json" \
    -d '{"name":"Test Admin","email":"testadmin@test.com","password":"test123","role":"admin"}')

if echo "$RESPONSE" | grep -q "already registered"; then
    pass "Duplicate registration blocked"
else
    fail "Duplicate registration not blocked"
fi

# Test 4: Login
echo -e "\n=== TEST 4: Login ==="
RESPONSE=$(curl -s -X POST $BASE_URL/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"testadmin@test.com","password":"test123"}')

if echo "$RESPONSE" | grep -q "token"; then
    pass "Login successful"
else
    fail "Login failed"
fi

# Test 5: Invalid Login
echo -e "\n=== TEST 5: Invalid Login ==="
RESPONSE=$(curl -s -X POST $BASE_URL/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"testadmin@test.com","password":"wrong"}')

if echo "$RESPONSE" | grep -q "Invalid credentials"; then
    pass "Invalid credentials rejected"
else
    fail "Invalid credentials not rejected"
fi

# Test 6: Get Profile
echo -e "\n=== TEST 6: Get Profile ==="
RESPONSE=$(curl -s $BASE_URL/auth/profile \
    -H "Authorization: Bearer $TOKEN")

if echo "$RESPONSE" | grep -q "testadmin@test.com"; then
    pass "Get profile"
else
    fail "Get profile"
fi

# Test 7: Create Asset
echo -e "\n=== TEST 7: Create Asset ==="
RESPONSE=$(curl -s -X POST $BASE_URL/assets \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"type":"Laptop","brand":"Dell","model":"XPS 15","serialNumber":"TEST001","location":"Office-A","purchaseDate":"2024-01-15","purchaseCost":120000}')

if echo "$RESPONSE" | grep -q "AST"; then
    pass "Create asset"
    ASSET_ID=$(echo "$RESPONSE" | jq -r '.data._id')
else
    fail "Create asset"
fi

# Test 8: Duplicate Serial Number (Idempotency Check)
echo -e "\n=== TEST 8: Duplicate Serial Number (Idempotency) ==="
RESPONSE=$(curl -s -X POST $BASE_URL/assets \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"type":"Laptop","brand":"HP","model":"ProBook","serialNumber":"TEST001","location":"Office-B"}')

if echo "$RESPONSE" | grep -q "already exists"; then
    pass "Duplicate serial blocked"
else
    fail "Duplicate serial not blocked"
fi

# Test 9: Get All Assets
echo -e "\n=== TEST 9: Get All Assets ==="
RESPONSE=$(curl -s "$BASE_URL/assets?page=1&limit=10" \
    -H "Authorization: Bearer $TOKEN")

if echo "$RESPONSE" | grep -q "pagination"; then
    pass "Get all assets with pagination"
else
    fail "Get all assets"
fi

# Test 10: Get Asset by ID
echo -e "\n=== TEST 10: Get Asset by ID ==="
RESPONSE=$(curl -s "$BASE_URL/assets/$ASSET_ID" \
    -H "Authorization: Bearer $TOKEN")

if echo "$RESPONSE" | grep -q "TEST001"; then
    pass "Get asset by ID"
else
    fail "Get asset by ID"
fi

# Test 11: Update Asset
echo -e "\n=== TEST 11: Update Asset ==="
RESPONSE=$(curl -s -X PUT "$BASE_URL/assets/$ASSET_ID" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"location":"Office-C"}')

if echo "$RESPONSE" | grep -q "Office-C"; then
    pass "Update asset"
else
    fail "Update asset"
fi

# Test 12: Filter Assets
echo -e "\n=== TEST 12: Filter Assets by Status ==="
RESPONSE=$(curl -s "$BASE_URL/assets?status=available" \
    -H "Authorization: Bearer $TOKEN")

if echo "$RESPONSE" | grep -q "available"; then
    pass "Filter assets by status"
else
    fail "Filter assets"
fi

# Test 13: Assign Asset
echo -e "\n=== TEST 13: Assign Asset ==="
RESPONSE=$(curl -s -X POST $BASE_URL/assignments/assign \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"assetId\":\"$ASSET_ID\",\"userId\":\"$ADMIN_ID\",\"notes\":\"Test assignment\"}")

if echo "$RESPONSE" | grep -q "active"; then
    pass "Assign asset"
    ASSIGNMENT_ID=$(echo "$RESPONSE" | jq -r '.data._id')
else
    fail "Assign asset"
fi

# Test 14: Duplicate Assignment (Idempotency Check)
echo -e "\n=== TEST 14: Duplicate Assignment (Idempotency) ==="
RESPONSE=$(curl -s -X POST $BASE_URL/assignments/assign \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"assetId\":\"$ASSET_ID\",\"userId\":\"$ADMIN_ID\"}")

if echo "$RESPONSE" | grep -q "not available"; then
    pass "Duplicate assignment blocked"
else
    fail "Duplicate assignment not blocked"
fi

# Test 15: Return Asset
echo -e "\n=== TEST 15: Return Asset ==="
RESPONSE=$(curl -s -X POST $BASE_URL/assignments/return \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"assignmentId\":\"$ASSIGNMENT_ID\"}")

if echo "$RESPONSE" | grep -q "returned"; then
    pass "Return asset"
else
    fail "Return asset"
fi

# Test 16: Get Assignment History
echo -e "\n=== TEST 16: Get Assignment History ==="
RESPONSE=$(curl -s "$BASE_URL/assignments/history/$ASSET_ID" \
    -H "Authorization: Bearer $TOKEN")

if echo "$RESPONSE" | grep -q "returned"; then
    pass "Get assignment history"
else
    fail "Get assignment history"
fi

# Test 17: Create Maintenance
echo -e "\n=== TEST 17: Create Maintenance ==="
RESPONSE=$(curl -s -X POST $BASE_URL/maintenance \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"assetId\":\"$ASSET_ID\",\"type\":\"preventive\",\"frequency\":\"monthly\",\"lastDate\":\"2024-01-15\",\"description\":\"Regular check\",\"cost\":500}")

if echo "$RESPONSE" | grep -q "nextDate"; then
    pass "Create maintenance"
    MAINTENANCE_ID=$(echo "$RESPONSE" | jq -r '.data._id')
else
    fail "Create maintenance"
fi

# Test 18: Get All Maintenance
echo -e "\n=== TEST 18: Get All Maintenance ==="
RESPONSE=$(curl -s "$BASE_URL/maintenance" \
    -H "Authorization: Bearer $TOKEN")

if echo "$RESPONSE" | grep -q "preventive"; then
    pass "Get all maintenance"
else
    fail "Get all maintenance"
fi

# Test 19: Update Maintenance
echo -e "\n=== TEST 19: Update Maintenance ==="
RESPONSE=$(curl -s -X PUT "$BASE_URL/maintenance/$MAINTENANCE_ID" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"status":"completed"}')

if echo "$RESPONSE" | grep -q "completed"; then
    pass "Update maintenance"
else
    fail "Update maintenance"
fi

# Test 20: Create Warranty
echo -e "\n=== TEST 20: Create Warranty ==="
RESPONSE=$(curl -s -X POST $BASE_URL/warranty \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"assetId\":\"$ASSET_ID\",\"warrantyExpiry\":\"2027-12-31\",\"amcExpiry\":\"2026-12-31\",\"vendor\":\"Dell India\",\"cost\":5000}")

if echo "$RESPONSE" | grep -q "Dell India"; then
    pass "Create warranty"
    WARRANTY_ID=$(echo "$RESPONSE" | jq -r '.data._id')
else
    fail "Create warranty"
fi

# Test 21: Duplicate Warranty (Idempotency Check)
echo -e "\n=== TEST 21: Duplicate Warranty (Idempotency) ==="
RESPONSE=$(curl -s -X POST $BASE_URL/warranty \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"assetId\":\"$ASSET_ID\",\"warrantyExpiry\":\"2027-12-31\",\"vendor\":\"Dell India\"}")

if echo "$RESPONSE" | grep -q "already exists"; then
    pass "Duplicate warranty blocked"
else
    fail "Duplicate warranty not blocked"
fi

# Test 22: Get All Warranties
echo -e "\n=== TEST 22: Get All Warranties ==="
RESPONSE=$(curl -s "$BASE_URL/warranty" \
    -H "Authorization: Bearer $TOKEN")

if echo "$RESPONSE" | grep -q "Dell India"; then
    pass "Get all warranties"
else
    fail "Get all warranties"
fi

# Test 23: Update Warranty
echo -e "\n=== TEST 23: Update Warranty ==="
RESPONSE=$(curl -s -X PUT "$BASE_URL/warranty/$WARRANTY_ID" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"cost":6000}')

if echo "$RESPONSE" | grep -q "6000"; then
    pass "Update warranty"
else
    fail "Update warranty"
fi

# Test 24: Get Alerts
echo -e "\n=== TEST 24: Get Alerts ==="
RESPONSE=$(curl -s "$BASE_URL/alerts" \
    -H "Authorization: Bearer $TOKEN")

if echo "$RESPONSE" | grep -q "success"; then
    pass "Get alerts"
    ALERT_ID=$(echo "$RESPONSE" | jq -r '.data[0]._id // "none"')
else
    fail "Get alerts"
fi

# Test 25: Update Alert (if exists)
if [ "$ALERT_ID" != "none" ] && [ "$ALERT_ID" != "null" ]; then
    echo -e "\n=== TEST 25: Update Alert ==="
    RESPONSE=$(curl -s -X PATCH "$BASE_URL/alerts/$ALERT_ID" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d '{"status":"resolved"}')

    if echo "$RESPONSE" | grep -q "resolved"; then
        pass "Update alert"
    else
        fail "Update alert"
    fi
else
    echo -e "\n=== TEST 25: Update Alert ==="
    info "No alerts to update"
fi

# Test 26: Get Activity Logs
echo -e "\n=== TEST 26: Get Activity Logs ==="
RESPONSE=$(curl -s "$BASE_URL/logs/activity?limit=10" \
    -H "Authorization: Bearer $TOKEN")

if echo "$RESPONSE" | grep -q "action"; then
    pass "Get activity logs"
else
    fail "Get activity logs"
fi

# Test 27: Get Error Logs
echo -e "\n=== TEST 27: Get Error Logs ==="
RESPONSE=$(curl -s "$BASE_URL/logs/errors?limit=10" \
    -H "Authorization: Bearer $TOKEN")

if echo "$RESPONSE" | grep -q "success"; then
    pass "Get error logs"
else
    fail "Get error logs"
fi

# Test 28: Dashboard Summary
echo -e "\n=== TEST 28: Dashboard Summary ==="
RESPONSE=$(curl -s "$BASE_URL/dashboard/summary" \
    -H "Authorization: Bearer $TOKEN")

if echo "$RESPONSE" | grep -q "total"; then
    pass "Dashboard summary"
    echo "  Total Assets: $(echo "$RESPONSE" | jq -r '.data.total')"
    echo "  Available: $(echo "$RESPONSE" | jq -r '.data.available')"
    echo "  Assigned: $(echo "$RESPONSE" | jq -r '.data.assigned')"
else
    fail "Dashboard summary"
fi

# Test 29: Dashboard Analytics
echo -e "\n=== TEST 29: Dashboard Analytics ==="
RESPONSE=$(curl -s "$BASE_URL/dashboard/analytics" \
    -H "Authorization: Bearer $TOKEN")

if echo "$RESPONSE" | grep -q "oldDevices"; then
    pass "Dashboard analytics"
    echo "  Old Devices: $(echo "$RESPONSE" | jq -r '.data.oldDevices')"
    echo "  Frequent Repair: $(echo "$RESPONSE" | jq -r '.data.frequentRepair')"
    echo "  High Cost Maintenance: $(echo "$RESPONSE" | jq -r '.data.highCostMaintenance')"
else
    fail "Dashboard analytics"
fi

# Test 30: Unauthorized Access
echo -e "\n=== TEST 30: Unauthorized Access ==="
RESPONSE=$(curl -s "$BASE_URL/assets" \
    -H "Authorization: Bearer invalid-token")

if echo "$RESPONSE" | grep -q "Unauthorized"; then
    pass "Unauthorized access blocked"
else
    fail "Unauthorized access not blocked"
fi

# Test 31: Delete Asset (Admin Only)
echo -e "\n=== TEST 31: Delete Asset ==="
RESPONSE=$(curl -s -X DELETE "$BASE_URL/assets/$ASSET_ID" \
    -H "Authorization: Bearer $TOKEN")

if echo "$RESPONSE" | grep -q "deleted"; then
    pass "Delete asset"
else
    fail "Delete asset"
fi

# Test 32: Get Deleted Asset (Should fail)
echo -e "\n=== TEST 32: Get Deleted Asset (Idempotency) ==="
RESPONSE=$(curl -s "$BASE_URL/assets/$ASSET_ID" \
    -H "Authorization: Bearer $TOKEN")

if echo "$RESPONSE" | grep -q "not found"; then
    pass "Deleted asset not found"
else
    fail "Deleted asset still accessible"
fi

echo -e "\n=========================================="
echo "Test Suite Complete"
echo "=========================================="
