# Mock Data Refactoring Summary

## Overview

The mock data structure has been completely refactored to comply with the Prisma schema and implement calculated metrics instead of hardcoded values.

## Key Changes

### 1. **Prisma Schema Compliance**

#### Before:
- Flat data structures with nested objects
- Inconsistent field naming
- Missing required Prisma fields

#### After:
- All entities follow Prisma schema structure
- Proper foreign key relationships
- Consistent field naming (camelCase → snake_case where needed)
- Added required Prisma fields (id, createdAt, updatedAt)

### 2. **Calculated Metrics**

#### Before:
```typescript
export const mockDashboardMetrics: DashboardMetrics = {
  totalSpend: 301000,           // Hardcoded
  costSavings: 17500,           // Hardcoded
  averageVendorRating: 4.6,     // Hardcoded
  onTimeDelivery: 92.3,         // Hardcoded
  // ...
};
```

#### After:
```typescript
export const calculateDashboardMetrics = (): DashboardMetrics => {
  const totalSpend = mockPurchaseOrders.reduce((sum, po) => sum + po.totalAmount, 0);
  const activeVendors = mockVendors.filter(v => v.status === 'ACTIVE').length;
  const averageVendorRating = mockVendors.reduce((sum, v) => sum + v.rating, 0) / mockVendors.length;
  // ... all metrics calculated from actual data
};
```

### 3. **Data Structure Changes**

#### Vendors
```typescript
// Before: Nested objects
{
  primaryContact: { id: '1', name: 'Sarah Johnson', ... },
  performanceMetrics: { onTimeDelivery: 96, ... },
  certifications: [{ id: '1', name: 'ISO 9001:2015', ... }]
}

// After: Prisma-compliant with relations
{
  id: '1',
  name: 'Transfarma',
  status: 'ACTIVE',  // Uppercase enum
  primaryContact: { id: '1', vendorId: '1', isPrimary: true, ... },
  performanceMetrics: { id: '1', vendorId: '1', onTimeDelivery: 96, ... },
  certifications: [{ id: '1', vendorId: '1', name: 'ISO 9001:2015', ... }]
}
```

#### Purchase Orders
```typescript
// Before: Direct vendor object
{
  vendor: mockVendors[0],
  items: [{ id: '1', productName: 'HPLC Column', ... }]
}

// After: Prisma relations
{
  vendorId: '1',
  vendor: mockVendors[0],  // Populated relation
  items: [{ id: '1', purchaseOrderId: '1', productName: 'HPLC Column', ... }]
}
```

### 4. **Status Field Standardization**

All status fields now use uppercase enum values to match Prisma schema:

- `status: 'active'` → `status: 'ACTIVE'`
- `status: 'pending_approval'` → `status: 'PENDING_APPROVAL'`
- `status: 'in_transit'` → `status: 'IN_TRANSIT'`

### 5. **Calculated Analytics**

#### Spend Analysis
```typescript
export const calculateSpendAnalysis = (): SpendAnalysis[] => {
  const spendByCategory = mockPurchaseOrders.reduce((acc, po) => {
    const category = po.tender?.category || 'Other';
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += po.totalAmount;
    return acc;
  }, {} as Record<string, number>);
  // ... calculate percentages and trends
};
```

#### Monthly Trends
```typescript
export const calculateMonthlyTrends = (): MonthlyTrend[] => {
  const monthlyData = mockPurchaseOrders.reduce((acc, po) => {
    const month = po.createdAt.toLocaleDateString('en-US', { month: 'short' });
    if (!acc[month]) {
      acc[month] = { spend: 0, orders: 0 };
    }
    acc[month].spend += po.totalAmount;
    acc[month].orders += 1;
    return acc;
  }, {} as Record<string, { spend: number; orders: number }>);
  // ... return formatted data
};
```

## Benefits

### 1. **Data Consistency**
- All data follows the same structure as the database
- No more mapping between mock and database formats
- Seamless switching between data sources

### 2. **Realistic Metrics**
- Dashboard metrics are calculated from actual data
- Metrics change when data changes
- More realistic representation of system performance

### 3. **Maintainability**
- Single source of truth for data structure
- Easy to add new entities or modify existing ones
- Consistent with production database schema

### 4. **Testing**
- Mock data behaves like real database data
- Better testing of analytics and calculations
- More accurate performance testing

## Migration Impact

### API Routes
- All API routes continue to work without changes
- Data access layer handles the new structure transparently
- No breaking changes for frontend components

### Database Seeding
- Seed script updated to use new structure
- All relationships properly created
- Data integrity maintained

### Frontend Components
- No changes required in React components
- All existing functionality preserved
- Improved data accuracy

## Usage

### Development
```bash
# Continue using mock data (default)
npm run dev

# Switch to database
# Update .env: DATA_SOURCE="database"
# Run: npm run db:setup
npm run dev
```

### Metrics Calculation
```typescript
// Metrics are now calculated in real-time
const metrics = await dashboardDataAccess.getMetrics();
// Returns calculated values based on actual data
```

## File Changes

### Modified Files:
- `src/lib/mock-data.ts` - Completely restructured
- `src/lib/data-access.ts` - Updated to use new structure
- `prisma/seed.ts` - Updated to use new mock data

### New Features:
- Calculated dashboard metrics
- Real-time spend analysis
- Dynamic monthly trends
- Prisma-compliant data structure

## Testing

To verify the changes work correctly:

1. **Mock Data Mode**:
   ```bash
   npm run dev
   # Check dashboard metrics are calculated from data
   ```

2. **Database Mode**:
   ```bash
   npm run db:setup
   # Update .env: DATA_SOURCE="database"
   npm run dev
   # Verify same metrics from database
   ```

The refactoring ensures that your mock data now perfectly mirrors your database structure while providing realistic, calculated metrics that reflect the actual data relationships and business logic.
