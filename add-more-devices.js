const mongoose = require('mongoose');
require('dotenv').config();

const MasterData = require('./models/MasterData');
const Vendor = require('./models/Vendor');

async function addMoreDevices() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');

    // Get existing vendors
    const vendors = await Vendor.find();
    const techVendor = vendors.find(v => v.type === 'IT Equipment');
    const furnitureVendor = vendors.find(v => v.type === 'Office Furniture');

    const newDevices = [
      {
        assetId: "AST000011",
        name: "iPhone 13 Pro",
        assetType: "assignable",
        category: "Mobile Phone",
        brand: "Apple",
        model: "iPhone 13 Pro",
        serialNumber: "IPH13P001",
        purchaseDate: new Date("2024-01-10"),
        purchaseCost: 120000,
        vendor: techVendor._id,
        location: "Office Floor 3",
        condition: "excellent",
        status: "assigned",
        warrantyExpiryDate: new Date("2025-01-10"),
        nextMaintenanceDate: new Date("2024-07-10")
      },
      {
        assetId: "AST000012",
        name: "Samsung Galaxy S23",
        assetType: "assignable",
        category: "Mobile Phone",
        brand: "Samsung",
        model: "Galaxy S23",
        serialNumber: "SGS23001",
        purchaseDate: new Date("2024-02-05"),
        purchaseCost: 75000,
        vendor: techVendor._id,
        location: "Office Floor 2",
        condition: "excellent",
        status: "available",
        warrantyExpiryDate: new Date("2025-02-05"),
        nextMaintenanceDate: new Date("2024-08-05")
      },
      {
        assetId: "AST000013",
        name: "iPad Pro 12.9",
        assetType: "assignable",
        category: "Tablet",
        brand: "Apple",
        model: "iPad Pro 12.9",
        serialNumber: "IPADP129001",
        purchaseDate: new Date("2024-01-20"),
        purchaseCost: 95000,
        vendor: techVendor._id,
        location: "Office Floor 4",
        condition: "excellent",
        status: "assigned",
        warrantyExpiryDate: new Date("2025-01-20"),
        nextMaintenanceDate: new Date("2024-07-20")
      },
      {
        assetId: "AST000014",
        name: "Samsung Galaxy Tab S8",
        assetType: "assignable",
        category: "Tablet",
        brand: "Samsung",
        model: "Galaxy Tab S8",
        serialNumber: "SGTS8001",
        purchaseDate: new Date("2024-02-12"),
        purchaseCost: 55000,
        vendor: techVendor._id,
        location: "Office Floor 3",
        condition: "excellent",
        status: "available",
        warrantyExpiryDate: new Date("2025-02-12")
      },
      {
        assetId: "AST000015",
        name: "Dell UltraSharp 32 inch",
        assetType: "assignable",
        category: "Monitor",
        brand: "Dell",
        model: "UltraSharp U3223QE",
        serialNumber: "DLUS32001",
        purchaseDate: new Date("2024-01-25"),
        purchaseCost: 45000,
        vendor: techVendor._id,
        location: "Office Floor 4",
        condition: "excellent",
        status: "assigned",
        warrantyExpiryDate: new Date("2027-01-25")
      },
      {
        assetId: "AST000016",
        name: "LG UltraWide 34 inch",
        assetType: "assignable",
        category: "Monitor",
        brand: "LG",
        model: "34WN80C-B",
        serialNumber: "LGUW34001",
        purchaseDate: new Date("2024-02-08"),
        purchaseCost: 38000,
        vendor: techVendor._id,
        location: "Office Floor 3",
        condition: "excellent",
        status: "available",
        warrantyExpiryDate: new Date("2027-02-08")
      },
      {
        assetId: "AST000017",
        name: "Apple 20W USB-C Charger",
        assetType: "assignable",
        category: "Charger",
        brand: "Apple",
        model: "20W USB-C",
        serialNumber: "APCH20W001",
        purchaseDate: new Date("2024-01-15"),
        purchaseCost: 1900,
        vendor: techVendor._id,
        location: "Office Floor 3",
        condition: "good",
        status: "assigned",
        warrantyExpiryDate: new Date("2025-01-15")
      },
      {
        assetId: "AST000018",
        name: "Anker 65W GaN Charger",
        assetType: "assignable",
        category: "Charger",
        brand: "Anker",
        model: "PowerPort III",
        serialNumber: "ANKCH65W001",
        purchaseDate: new Date("2024-02-01"),
        purchaseCost: 3500,
        vendor: techVendor._id,
        location: "Office Floor 2",
        condition: "excellent",
        status: "available",
        warrantyExpiryDate: new Date("2025-02-01")
      },
      {
        assetId: "AST000019",
        name: "OnePlus 11",
        assetType: "assignable",
        category: "Mobile Phone",
        brand: "OnePlus",
        model: "OnePlus 11",
        serialNumber: "OP11001",
        purchaseDate: new Date("2024-02-18"),
        purchaseCost: 56000,
        vendor: techVendor._id,
        location: "Office Floor 2",
        condition: "excellent",
        status: "available",
        warrantyExpiryDate: new Date("2025-02-18")
      },
      {
        assetId: "AST000020",
        name: "Lenovo Tab P11 Pro",
        assetType: "assignable",
        category: "Tablet",
        brand: "Lenovo",
        model: "Tab P11 Pro",
        serialNumber: "LNTP11P001",
        purchaseDate: new Date("2024-02-20"),
        purchaseCost: 42000,
        vendor: techVendor._id,
        location: "Office Floor 1",
        condition: "excellent",
        status: "available",
        warrantyExpiryDate: new Date("2025-02-20")
      },
      {
        assetId: "AST000021",
        name: "BenQ 27 inch Monitor",
        assetType: "assignable",
        category: "Monitor",
        brand: "BenQ",
        model: "GW2780",
        serialNumber: "BNQM27001",
        purchaseDate: new Date("2024-02-22"),
        purchaseCost: 15000,
        vendor: techVendor._id,
        location: "Office Floor 2",
        condition: "excellent",
        status: "available",
        warrantyExpiryDate: new Date("2027-02-22")
      },
      {
        assetId: "AST000022",
        name: "Samsung 65W Charger",
        assetType: "assignable",
        category: "Charger",
        brand: "Samsung",
        model: "65W Super Fast",
        serialNumber: "SGCH65W001",
        purchaseDate: new Date("2024-02-10"),
        purchaseCost: 2500,
        vendor: techVendor._id,
        location: "Office Floor 3",
        condition: "excellent",
        status: "available",
        warrantyExpiryDate: new Date("2025-02-10")
      }
    ];

    const created = await MasterData.insertMany(newDevices);
    console.log(`✅ Added ${created.length} new devices`);

    console.log('\n📊 New Devices Summary:');
    console.log(`   Mobile Phones: ${newDevices.filter(d => d.category === 'Mobile Phone').length}`);
    console.log(`   Tablets: ${newDevices.filter(d => d.category === 'Tablet').length}`);
    console.log(`   Large Monitors: ${newDevices.filter(d => d.category === 'Monitor').length}`);
    console.log(`   Chargers: ${newDevices.filter(d => d.category === 'Charger').length}`);

    const total = await MasterData.countDocuments();
    console.log(`\n📈 Total Master Data Records: ${total}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addMoreDevices();
