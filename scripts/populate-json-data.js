const fs = require('fs');
const path = require('path');

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Create initial users.json
const users = [
  {
    "id": "1",
    "email": "admin@gradian.com",
    "name": "Admin User",
    "role": "admin",
    "department": "IT",
    "avatar": "/avatars/admin.jpg",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": "2",
    "email": "mahyar.abidi@gradian.com",
    "name": "Mahyar Abidi",
    "role": "procurement",
    "department": "Supply Chain",
    "avatar": "/avatars/mahyar.jpg",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
];

// Create initial tenders.json
const tenders = [
  {
    "id": "1",
    "title": "Laboratory Equipment Procurement",
    "description": "Procurement of advanced laboratory equipment for research facilities",
    "status": "published",
    "budget": 500000,
    "currency": "USD",
    "openingDate": "2024-01-15T00:00:00.000Z",
    "closingDate": "2024-02-15T00:00:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
];

// Create initial purchaseOrders.json
const purchaseOrders = [
  {
    "id": "1",
    "poNumber": "PO-2024-001",
    "vendorId": "1",
    "status": "pending",
    "totalAmount": 25000,
    "currency": "USD",
    "orderDate": "2024-01-10T00:00:00.000Z",
    "expectedDeliveryDate": "2024-02-10T00:00:00.000Z",
    "createdAt": "2024-01-10T00:00:00.000Z",
    "updatedAt": "2024-01-10T00:00:00.000Z"
  }
];

// Create initial shipments.json
const shipments = [
  {
    "id": "1",
    "trackingNumber": "TRK-001",
    "vendorId": "1",
    "status": "in_transit",
    "origin": "Boston, MA",
    "destination": "San Francisco, CA",
    "shippedDate": "2024-01-15T00:00:00.000Z",
    "expectedDeliveryDate": "2024-01-20T00:00:00.000Z",
    "createdAt": "2024-01-15T00:00:00.000Z",
    "updatedAt": "2024-01-15T00:00:00.000Z"
  }
];

// Create initial invoices.json
const invoices = [
  {
    "id": "1",
    "invoiceNumber": "INV-2024-001",
    "vendorId": "1",
    "amount": 25000,
    "currency": "USD",
    "status": "pending",
    "dueDate": "2024-02-15T00:00:00.000Z",
    "createdAt": "2024-01-15T00:00:00.000Z",
    "updatedAt": "2024-01-15T00:00:00.000Z"
  }
];

// Create initial notifications.json
const notifications = [
  {
    "id": "1",
    "title": "New Vendor Registration",
    "message": "Transfarma has registered as a new vendor",
    "type": "info",
    "isRead": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
];

// Write all files
const datasets = {
  users,
  tenders,
  purchaseOrders,
  shipments,
  invoices,
  notifications
};

Object.entries(datasets).forEach(([name, data]) => {
  const filePath = path.join(dataDir, `${name}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`Created ${filePath}`);
});

console.log('All JSON files created successfully!');
