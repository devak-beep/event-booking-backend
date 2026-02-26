const mongoose = require('mongoose');
require('dotenv').config();

const Vendor = require('./models/Vendor');
const MasterData = require('./models/MasterData');

const vendors = [
  {
    name: "Rajesh Kumar",
    company: "Tech Solutions Pvt Ltd",
    contacts: [
      { name: "Rajesh Kumar", mobile: "9876543210" },
      { name: "Amit Sharma", mobile: "9876543211" }
    ],
    city: "Mumbai",
    type: "IT Equipment"
  },
  {
    name: "Suresh Patel",
    company: "Office Supplies Co",
    contacts: [
      { name: "Suresh Patel", mobile: "9123456789" },
      { name: "Ramesh Kumar", mobile: "9123456790" }
    ],
    city: "Delhi",
    type: "Office Furniture"
  },
  {
    name: "Priya Singh",
    company: "HVAC Systems India",
    contacts: [
      { name: "Priya Singh", mobile: "9988776655" },
      { name: "Vikram Reddy", mobile: "9988776656" },
      { name: "Anita Desai", mobile: "9988776657" }
    ],
    city: "Bangalore",
    type: "HVAC & Appliances"
  },
  {
    name: "Anil Mehta",
    company: "Network Solutions Ltd",
    contacts: [
      { name: "Anil Mehta", mobile: "9876512345" }
    ],
    city: "Pune",
    type: "Networking Equipment"
  },
  {
    name: "Kavita Joshi",
    company: "Print & Scan Services",
    contacts: [
      { name: "Kavita Joshi", mobile: "9765432109" },
      { name: "Deepak Verma", mobile: "9765432108" }
    ],
    city: "Hyderabad",
    type: "Printers & Scanners"
  }
];

async function seedData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');

    // Clear existing data
    await Vendor.deleteMany({});
    await MasterData.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Insert vendors
    const createdVendors = await Vendor.insertMany(vendors);
    console.log(`✅ Created ${createdVendors.length} vendors`);

    // Create master data entries
    const masterDataEntries = [
      {
        assetId: "AST000001",
        name: "Dell Latitude 5420",
        assetType: "assignable",
        category: "Laptop",
        brand: "Dell",
        model: "Latitude 5420",
        serialNumber: "DL5420001",
        purchaseDate: new Date("2024-01-15"),
        purchaseCost: 55000,
        vendor: createdVendors[0]._id,
        location: "Office Floor 3",
        condition: "excellent",
        status: "assigned",
        warrantyExpiryDate: new Date("2027-01-15"),
        amcExpiryDate: new Date("2025-01-15"),
        nextMaintenanceDate: new Date("2024-07-15")
      },
      {
        assetId: "AST000002",
        name: "HP Monitor 24 inch",
        assetType: "assignable",
        category: "Monitor",
        brand: "HP",
        model: "E24 G4",
        serialNumber: "HPM24001",
        purchaseDate: new Date("2024-01-20"),
        purchaseCost: 12000,
        vendor: createdVendors[0]._id,
        location: "Office Floor 3",
        condition: "excellent",
        status: "assigned",
        warrantyExpiryDate: new Date("2027-01-20"),
        nextMaintenanceDate: new Date("2024-08-20")
      },
      {
        assetId: "AST000003",
        name: "Daikin Air Conditioner",
        assetType: "non-assignable",
        category: "HVAC",
        brand: "Daikin",
        model: "FTKF50TV",
        serialNumber: "DAC50001",
        purchaseDate: new Date("2023-12-10"),
        purchaseCost: 45000,
        vendor: createdVendors[2]._id,
        location: "Office Floor 2",
        condition: "good",
        status: "available",
        warrantyExpiryDate: new Date("2026-12-10"),
        amcExpiryDate: new Date("2024-12-10"),
        nextMaintenanceDate: new Date("2024-06-10")
      },
      {
        assetId: "AST000004",
        name: "Water Purifier",
        assetType: "non-assignable",
        category: "Appliances",
        brand: "Kent",
        model: "Grand Plus",
        serialNumber: "KENT001",
        purchaseDate: new Date("2024-02-01"),
        purchaseCost: 18000,
        vendor: createdVendors[2]._id,
        location: "Office Pantry",
        condition: "excellent",
        status: "available",
        warrantyExpiryDate: new Date("2025-02-01"),
        amcExpiryDate: new Date("2025-02-01"),
        nextMaintenanceDate: new Date("2024-05-01")
      },
      {
        assetId: "AST000005",
        name: "Cisco Router",
        assetType: "non-assignable",
        category: "Networking",
        brand: "Cisco",
        model: "ISR 4331",
        serialNumber: "CSC4331001",
        purchaseDate: new Date("2023-11-15"),
        purchaseCost: 85000,
        vendor: createdVendors[3]._id,
        location: "Server Room",
        condition: "good",
        status: "available",
        warrantyExpiryDate: new Date("2026-11-15"),
        amcExpiryDate: new Date("2024-11-15"),
        nextMaintenanceDate: new Date("2024-05-15")
      },
      {
        assetId: "AST000006",
        name: "HP LaserJet Printer",
        assetType: "non-assignable",
        category: "Printer",
        brand: "HP",
        model: "LaserJet Pro M404dn",
        serialNumber: "HPLJ404001",
        purchaseDate: new Date("2024-01-25"),
        purchaseCost: 22000,
        vendor: createdVendors[4]._id,
        location: "Office Floor 1",
        condition: "excellent",
        status: "available",
        warrantyExpiryDate: new Date("2025-01-25"),
        nextMaintenanceDate: new Date("2024-07-25")
      },
      {
        assetId: "AST000007",
        name: "Lenovo ThinkPad",
        assetType: "assignable",
        category: "Laptop",
        brand: "Lenovo",
        model: "ThinkPad E14",
        serialNumber: "LTE14001",
        purchaseDate: new Date("2024-02-10"),
        purchaseCost: 48000,
        vendor: createdVendors[0]._id,
        location: "Office Floor 2",
        condition: "excellent",
        status: "available",
        warrantyExpiryDate: new Date("2027-02-10"),
        amcExpiryDate: new Date("2025-02-10"),
        nextMaintenanceDate: new Date("2024-08-10")
      },
      {
        assetId: "AST000008",
        name: "Office Desk",
        assetType: "non-assignable",
        category: "Furniture",
        brand: "Godrej",
        model: "Executive Desk",
        serialNumber: "GDJ001",
        purchaseDate: new Date("2023-10-20"),
        purchaseCost: 15000,
        vendor: createdVendors[1]._id,
        location: "Office Floor 3",
        condition: "good",
        status: "available"
      },
      {
        assetId: "AST000009",
        name: "Office Chair",
        assetType: "non-assignable",
        category: "Furniture",
        brand: "Featherlite",
        model: "Ergonomic Chair",
        serialNumber: "FTL001",
        purchaseDate: new Date("2023-10-20"),
        purchaseCost: 8000,
        vendor: createdVendors[1]._id,
        location: "Office Floor 3",
        condition: "good",
        status: "available"
      },
      {
        assetId: "AST000010",
        name: "MacBook Pro",
        assetType: "assignable",
        category: "Laptop",
        brand: "Apple",
        model: "MacBook Pro 14",
        serialNumber: "MBP14001",
        purchaseDate: new Date("2024-02-15"),
        purchaseCost: 180000,
        vendor: createdVendors[0]._id,
        location: "Office Floor 4",
        condition: "excellent",
        status: "assigned",
        warrantyExpiryDate: new Date("2025-02-15"),
        nextMaintenanceDate: new Date("2024-08-15")
      }
    ];

    const createdMasterData = await MasterData.insertMany(masterDataEntries);
    console.log(`✅ Created ${createdMasterData.length} master data entries`);

    console.log('\n📊 Summary:');
    console.log(`   Vendors: ${createdVendors.length}`);
    console.log(`   Master Data: ${createdMasterData.length}`);
    console.log(`   - Assignable: ${masterDataEntries.filter(e => e.assetType === 'assignable').length}`);
    console.log(`   - Non-Assignable: ${masterDataEntries.filter(e => e.assetType === 'non-assignable').length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

seedData();
