#!/bin/bash

# Test Vendors and Master Data APIs

echo "🔐 Login as admin..."
TOKEN=$(curl -s -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@digiflux.com","password":"admin123"}' | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed"
  exit 1
fi

echo "✅ Logged in successfully"
echo ""

echo "📋 Fetching Vendors..."
curl -s -X GET "http://localhost:5000/vendors" \
  -H "Authorization: Bearer $TOKEN" | jq '.data.vendors[] | {name, company, city, type, contacts: .contacts | length}'

echo ""
echo "📊 Fetching Master Data..."
curl -s -X GET "http://localhost:5000/master-data?limit=5" \
  -H "Authorization: Bearer $TOKEN" | jq '.data.masterData[] | {assetId, name, assetType, brand, status}'

echo ""
echo "✅ Test complete!"
