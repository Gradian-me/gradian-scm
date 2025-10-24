const fs = require('fs');
const path = require('path');

// Import the mock data
const { 
  mockUsers, 
  mockVendors, 
  mockTenders, 
  mockPurchaseOrders, 
  mockShipments, 
  mockInvoices, 
  mockNotifications 
} = require('../src/lib/mock-data.ts');

// Function to convert dates to ISO strings for JSON serialization
function convertDatesToISO(obj) {
  if (obj === null || obj === undefined) return obj;
  if (obj instanceof Date) return obj.toISOString();
  if (Array.isArray(obj)) return obj.map(convertDatesToISO);
  if (typeof obj === 'object') {
    const converted = {};
    for (const key in obj) {
      converted[key] = convertDatesToISO(obj[key]);
    }
    return converted;
  }
  return obj;
}

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Convert and save each dataset
const datasets = {
  users: convertDatesToISO(mockUsers),
  vendors: convertDatesToISO(mockVendors),
  tenders: convertDatesToISO(mockTenders),
  purchaseOrders: convertDatesToISO(mockPurchaseOrders),
  shipments: convertDatesToISO(mockShipments),
  invoices: convertDatesToISO(mockInvoices),
  notifications: convertDatesToISO(mockNotifications)
};

Object.entries(datasets).forEach(([name, data]) => {
  const filePath = path.join(dataDir, `${name}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`Created ${filePath}`);
});

console.log('All JSON files created successfully!');
