# Quick Start Guide - Dynamic CRUD System

## 🚀 System Overview

You now have a complete **domain-driven dynamic CRUD system** that automatically creates API routes and pages for any entity based on schema definitions.

## 📍 What You Have

### 1. Dynamic Pages
- **Route**: `/page/[schema-id]`
- **Example**: `http://localhost:3000/page/vendors`
- **Features**: Full CRUD UI with search, filters, modals

### 2. Dynamic API Routes
- **Base**: `/api/data/[schema-id]`
- **Operations**: GET, POST, PUT, DELETE
- **Storage**: JSON file at `data/all-data.json`

### 3. ID Generation
- **Type**: ULID (Universally Unique Lexicographically Sortable Identifier)
- **Benefits**: Sortable, timestamped, URL-safe
- **Example**: `01HZJQK7X8P3R9WSTV5N2M4E6C`

## 🎯 Quick Test

### Test the Vendors API

```bash
# 1. Create a vendor
curl -X POST http://localhost:3000/api/data/vendors \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Company",
    "email": "test@company.com",
    "phone": "+1234567890",
    "address": "123 Test St",
    "city": "Test City",
    "state": "TC",
    "zipCode": "12345",
    "country": "USA",
    "registrationNumber": "REG123",
    "taxId": "TAX123",
    "categories": ["technology"],
    "status": "ACTIVE",
    "rating": 5
  }'

# 2. List all vendors
curl http://localhost:3000/api/data/vendors

# 3. Search vendors
curl http://localhost:3000/api/data/vendors?search=test&status=ACTIVE

# 4. Get specific vendor (use ID from create response)
curl http://localhost:3000/api/data/vendors/{ULID}

# 5. Update vendor
curl -X PUT http://localhost:3000/api/data/vendors/{ULID} \
  -H "Content-Type: application/json" \
  -d '{"status": "INACTIVE"}'

# 6. Delete vendor
curl -X DELETE http://localhost:3000/api/data/vendors/{ULID}
```

### Test the UI

1. Navigate to: `http://localhost:3000/page/vendors`
2. Click "Add Vendor" to create
3. Use search box to filter
4. Click cards to view details
5. Use edit/delete buttons

## 📦 Add a New Entity (Example: Products)

### Step 1: Define Schema

Add to `src/shared/schemas/all-schemas.ts`:

```typescript
export const productSchema: FormSchema = {
  id: 'products',
  name: 'products',
  title: 'Create New Product',
  singular_name: 'Product',
  plural_name: 'Products',
  sections: [
    {
      id: 'basic-info',
      title: 'Product Information',
      fields: [
        {
          id: 'name',
          name: 'name',
          label: 'Product Name',
          type: 'text',
          component: 'text',
          required: true,
          role: 'title',
        },
        {
          id: 'price',
          name: 'price',
          label: 'Price',
          type: 'number',
          component: 'number',
          required: true,
        },
        {
          id: 'description',
          name: 'description',
          label: 'Description',
          type: 'textarea',
          component: 'textarea',
          role: 'description',
        },
        {
          id: 'status',
          name: 'status',
          label: 'Status',
          type: 'select',
          component: 'select',
          required: true,
          role: 'status',
          options: [
            { label: 'Active', value: 'ACTIVE', color: 'success' },
            { label: 'Inactive', value: 'INACTIVE', color: 'destructive' },
          ],
        },
      ],
    },
  ],
};

// Register in ALL_SCHEMAS
export const ALL_SCHEMAS: Record<string, FormSchema> = {
  vendors: vendorSchema,
  products: productSchema, // Add here
};
```

### Step 2: Initialize Storage

Add to `data/all-data.json`:

```json
{
  "vendors": [],
  "products": []  // Add this line
}
```

### Step 3: Use It!

✅ **Page**: `http://localhost:3000/page/products`
✅ **API**: `http://localhost:3000/api/data/products`

That's it! No additional code needed!

## 📂 File Structure Reference

```
src/
├── shared/
│   ├── domain/              # Domain-driven design layer
│   │   ├── repositories/    # Data access
│   │   ├── services/        # Business logic
│   │   ├── controllers/     # HTTP handling
│   │   ├── validators/      # Validation
│   │   └── errors/          # Error handling
│   ├── schemas/
│   │   └── all-schemas.ts   # ⭐ Add schemas here
│   └── utils/
│       └── schema-registry.ts
├── app/
│   ├── api/data/[schema-id]/ # ⭐ Auto-generated API routes
│   └── page/[schema-id]/     # ⭐ Auto-generated pages
└── data/
    └── all-data.json         # ⭐ Your data storage

⭐ = Key files you'll work with
```

## 🔧 API Endpoints

All schemas automatically get these endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/data/{schema-id}` | List all entities |
| GET | `/api/data/{schema-id}?search=...&status=...` | Filtered list |
| POST | `/api/data/{schema-id}` | Create entity |
| GET | `/api/data/{schema-id}/{id}` | Get single entity |
| PUT | `/api/data/{schema-id}/{id}` | Update entity |
| DELETE | `/api/data/{schema-id}/{id}` | Delete entity |

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "data": { /* entity or array */ },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message here"
}
```

## 🎨 Field Types Supported

- `text` - Single line text
- `textarea` - Multi-line text
- `email` - Email with validation
- `tel` / `phone` - Phone number
- `number` - Numeric input
- `url` - URL with validation
- `select` - Dropdown selection
- `checkbox` - Checkboxes (single or multiple)
- `date` - Date picker

## 🔍 Filters Available

All entities support these query parameters:

- `?search=term` - Search across name, email, phone, description
- `?status=ACTIVE` - Filter by status
- `?category=technology` - Filter by category

## 🛠️ Key Features

✅ **ULID IDs** - Sortable, timestamped unique identifiers
✅ **Auto CRUD** - Full CRUD operations automatically
✅ **Validation** - Schema-based validation built-in
✅ **Type Safety** - Full TypeScript support
✅ **DDD Pattern** - Repository → Service → Controller
✅ **Error Handling** - Comprehensive error responses
✅ **Filtering** - Search and filter support
✅ **Single Source** - Schema drives everything

## 📚 Documentation

- **Full Architecture**: See `DYNAMIC_CRUD_ARCHITECTURE.md`
- **Schema System**: See `DYNAMIC_SCHEMA_IMPLEMENTATION.md`
- **Schema README**: See `src/shared/schemas/README.md`

## 🐛 Troubleshooting

### Issue: "Schema not found"
**Solution**: Make sure schema is registered in `ALL_SCHEMAS` object

### Issue: "Data not saving"
**Solution**: Check `data/all-data.json` has your schema key initialized

### Issue: API returns empty array
**Solution**: Create entities first, or check filters aren't too restrictive

### Issue: Validation errors
**Solution**: Check schema field validation rules match your data

## 🎉 What's Next?

1. ✅ Test vendors: `http://localhost:3000/page/vendors`
2. ✅ Test API: `curl http://localhost:3000/api/data/vendors`
3. ➡️ Add more entities (tenders, products, shipments)
4. ➡️ Customize validation rules
5. ➡️ Add custom business logic in services
6. ➡️ Migrate from JSON to database

## 💡 Pro Tips

1. **IDs are ULIDs**: They're sortable by creation time!
2. **Schema = Everything**: Update schema once, everything updates
3. **Extend Services**: Add custom logic by extending `BaseService`
4. **Custom Validation**: Override `validateCreate()` / `validateUpdate()`
5. **Filtering**: Works automatically for common fields

## 🚀 You're Ready!

Your dynamic CRUD system is fully operational. Just add schemas and go! 🎊

