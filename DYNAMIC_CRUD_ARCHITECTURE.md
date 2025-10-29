# Dynamic CRUD Architecture Documentation

## Overview

This document describes the complete domain-driven dynamic CRUD system that provides automatic API routes and data management for any entity based on schema definitions.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                       │
│  /page/[schema-id] → DynamicPageRenderer → UI Components    │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────────┐
│                      API Layer                               │
│      /api/data/[schema-id] → Dynamic CRUD Routes            │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────────┐
│                   Domain Layer (DDD)                         │
│  Controller → Service → Repository → Data Storage           │
└─────────────────────────────────────────────────────────────┘
```

## Layer Responsibilities

### 1. **Data Storage Layer**
- **Location**: `data/all-data.json`
- **Purpose**: Persistent storage for all entities
- **Structure**:
```json
{
  "vendors": [...],
  "tenders": [...],
  "products": [...]
}
```

### 2. **Repository Layer**
- **Location**: `src/shared/domain/repositories/base.repository.ts`
- **Responsibility**: Data access and persistence
- **Operations**:
  - `findAll(filters)` - Get all entities with filtering
  - `findById(id)` - Get single entity
  - `create(data)` - Create new entity
  - `update(id, data)` - Update existing entity
  - `delete(id)` - Delete entity
  - `exists(id)` - Check if entity exists
  - `count(filters)` - Count entities

### 3. **Service Layer**
- **Location**: `src/shared/domain/services/base.service.ts`
- **Responsibility**: Business logic and validation
- **Features**:
  - Data validation before create/update
  - Business rule enforcement
  - Error handling
  - Response formatting

### 4. **Controller Layer**
- **Location**: `src/shared/domain/controllers/base.controller.ts`
- **Responsibility**: HTTP request/response handling
- **Features**:
  - Request parsing
  - Query parameter extraction
  - Response status codes
  - Error response formatting

### 5. **API Routes**
- **Location**: `src/app/api/data/[schema-id]/`
- **Routes**:
  - `GET /api/data/{schema-id}` - List all entities
  - `POST /api/data/{schema-id}` - Create entity
  - `GET /api/data/{schema-id}/{id}` - Get single entity
  - `PUT /api/data/{schema-id}/{id}` - Update entity
  - `DELETE /api/data/{schema-id}/{id}` - Delete entity

## File Structure

```
src/
├── shared/
│   ├── domain/
│   │   ├── types/
│   │   │   └── base.types.ts          # Base type definitions
│   │   ├── interfaces/
│   │   │   ├── repository.interface.ts # Repository contract
│   │   │   └── service.interface.ts    # Service contract
│   │   ├── repositories/
│   │   │   └── base.repository.ts      # Base repository implementation
│   │   ├── services/
│   │   │   └── base.service.ts         # Base service implementation
│   │   ├── controllers/
│   │   │   └── base.controller.ts      # Base controller implementation
│   │   ├── errors/
│   │   │   └── domain.errors.ts        # Domain error classes
│   │   ├── validators/
│   │   │   └── schema.validator.ts     # Schema validation
│   │   ├── utils/
│   │   │   └── data-storage.util.ts    # Data file operations
│   │   └── index.ts                     # Domain exports
│   ├── schemas/
│   │   └── all-schemas.ts               # Schema registry
│   └── utils/
│       └── schema-registry.ts           # Schema utilities
├── app/
│   ├── api/
│   │   └── data/
│   │       └── [schema-id]/
│   │           ├── route.ts             # List & Create
│   │           └── [id]/
│   │               └── route.ts         # Get, Update, Delete
│   └── page/
│       └── [schema-id]/
│           └── page.tsx                 # Dynamic page renderer
└── data/
    └── all-data.json                    # Data storage
```

## Usage Examples

### 1. Add New Entity Type

**Step 1**: Add schema to `src/shared/schemas/all-schemas.ts`

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
          required: true,
        },
        // ... more fields
      ]
    }
  ]
};

export const ALL_SCHEMAS = {
  vendors: vendorSchema,
  products: productSchema, // Add here
};
```

**Step 2**: Initialize in `data/all-data.json`

```json
{
  "vendors": [],
  "products": []  // Add here
}
```

**That's it!** The following are automatically available:
- Page: `http://localhost:3000/page/products`
- API: `http://localhost:3000/api/data/products`

### 2. Using the API

**Create Entity**:
```bash
POST /api/data/vendors
Content-Type: application/json

{
  "name": "Acme Corp",
  "email": "contact@acme.com",
  "phone": "+1234567890",
  "status": "ACTIVE"
}
```

**Get All Entities**:
```bash
GET /api/data/vendors?search=acme&status=ACTIVE
```

**Get Single Entity**:
```bash
GET /api/data/vendors/{id}
```

**Update Entity**:
```bash
PUT /api/data/vendors/{id}
Content-Type: application/json

{
  "name": "Acme Corporation",
  "status": "PENDING"
}
```

**Delete Entity**:
```bash
DELETE /api/data/vendors/{id}
```

### 3. Response Format

**Success Response**:
```json
{
  "success": true,
  "data": { /* entity data */ },
  "message": "Vendor created successfully"
}
```

**Error Response**:
```json
{
  "success": false,
  "error": "Vendor with ID \"123\" not found"
}
```

## Domain-Driven Design Patterns

### 1. Repository Pattern
Abstracts data access logic from business logic.

```typescript
const repository = new BaseRepository<Vendor>('vendors');
const vendors = await repository.findAll({ status: 'ACTIVE' });
```

### 2. Service Pattern
Encapsulates business logic and validation.

```typescript
const service = new BaseService(repository, 'Vendor');
const result = await service.create(vendorData);
```

### 3. Controller Pattern
Handles HTTP concerns and delegates to services.

```typescript
const controller = new BaseController(service, 'Vendor');
const response = await controller.getAll(request);
```

## Error Handling

### Custom Error Types

1. **EntityNotFoundError** (404)
   - Thrown when entity doesn't exist
   
2. **ValidationError** (400)
   - Thrown when validation fails
   
3. **DuplicateEntityError** (409)
   - Thrown when unique constraint violated
   
4. **DataStorageError** (500)
   - Thrown when file system operations fail

### Error Response Flow

```
Error Thrown → handleDomainError() → Formatted Response → HTTP Status Code
```

## Validation

### Schema-Based Validation

The system automatically validates:
- Required fields
- Field types (email, url, phone, number)
- Min/max length
- Min/max value
- Custom regex patterns

### Custom Validation

Extend `BaseService` to add custom validation:

```typescript
class VendorService extends BaseService<Vendor> {
  protected async validateCreate(data: Omit<Vendor, 'id'>): Promise<void> {
    // Custom validation logic
    if (await this.isDuplicateEmail(data.email)) {
      throw new DuplicateEntityError('Vendor', 'email', data.email);
    }
  }
}
```

## Features

✅ **Automatic CRUD Operations** - No boilerplate code needed
✅ **Type Safety** - Full TypeScript support throughout
✅ **Validation** - Schema-based validation built-in
✅ **Error Handling** - Comprehensive error handling
✅ **Filtering** - Search, status, category filters
✅ **Domain-Driven Design** - Clean architecture patterns
✅ **Single Source of Truth** - Schema drives everything
✅ **File-Based Storage** - Simple JSON file storage
✅ **RESTful API** - Standard REST conventions
✅ **Extensible** - Easy to customize and extend

## Extending the System

### Custom Repository

```typescript
class VendorRepository extends BaseRepository<Vendor> {
  async findByEmail(email: string): Promise<Vendor | null> {
    const vendors = await this.findAll();
    return vendors.find(v => v.email === email) || null;
  }
}
```

### Custom Service

```typescript
class VendorService extends BaseService<Vendor> {
  constructor(repository: VendorRepository) {
    super(repository, 'Vendor');
  }

  async activateVendor(id: string): Promise<ApiResponse<Vendor>> {
    return this.update(id, { status: 'ACTIVE' });
  }
}
```

### Custom Controller

```typescript
class VendorController extends BaseController<Vendor> {
  async activate(id: string): Promise<NextResponse> {
    const service = this.service as VendorService;
    const result = await service.activateVendor(id);
    return NextResponse.json(result);
  }
}
```

## Benefits

1. **Rapid Development** - Add new entities in minutes
2. **Consistency** - All entities follow same patterns
3. **Maintainability** - Single place to update logic
4. **Testability** - Each layer can be tested independently
5. **Scalability** - Easy to add features and entities
6. **Type Safety** - Catch errors at compile time
7. **Clean Code** - Follows SOLID principles

## Migration from Old System

1. Move existing entity schemas to `all-schemas.ts`
2. Update API calls to use `/api/data/{schema-id}`
3. Remove old domain-specific API routes
4. Remove old repository/service implementations
5. Test thoroughly with existing data

## Next Steps

1. ✅ Test the dynamic CRUD API
2. ✅ Create entities using the new system
3. ⏭️ Add database support (replace JSON file)
4. ⏭️ Add authentication/authorization
5. ⏭️ Add pagination support
6. ⏭️ Add bulk operations
7. ⏭️ Add audit logging
8. ⏭️ Add caching layer

## Testing the System

### Test Vendors CRUD

```bash
# Create
curl -X POST http://localhost:3000/api/data/vendors \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Vendor","email":"test@test.com","phone":"1234567890","status":"ACTIVE"}'

# List
curl http://localhost:3000/api/data/vendors

# Get by ID
curl http://localhost:3000/api/data/vendors/{id}

# Update
curl -X PUT http://localhost:3000/api/data/vendors/{id} \
  -H "Content-Type: application/json" \
  -d '{"status":"INACTIVE"}'

# Delete
curl -X DELETE http://localhost:3000/api/data/vendors/{id}
```

## Conclusion

This dynamic CRUD architecture provides a robust, scalable foundation for managing any type of entity in your application. By following domain-driven design principles and leveraging schema-based generation, you can focus on business logic instead of boilerplate code.

