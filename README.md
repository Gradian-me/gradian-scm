# Gradian Supply Chain Management (SCM)

A modern, dynamic supply chain management system built with Next.js 16, featuring a fully schema-driven architecture.

## 🚀 Key Features

- **100% Dynamic Schema System** - Add new entities by editing JSON, no code changes needed
- **Automatic CRUD Operations** - API routes and pages generated automatically from schemas
- **Type-Safe** - Full TypeScript support with runtime validation
- **Server & Client Compatible** - Seamless data fetching on both sides
- **Domain-Driven Design** - Clean architecture with Repository, Service, and Controller layers
- **Modern UI** - Built with Tailwind CSS and shadcn/ui components

## 📁 Project Structure

```
gradian-scm/
├── data/
│   ├── all-schemas.json          # All entity schemas (single source of truth)
│   ├── all-data.json             # All entity data
│   └── *.json                    # Individual entity data files
├── src/
│   ├── app/
│   │   ├── page/[schema-id]/     # Dynamic entity pages
│   │   ├── api/
│   │   │   ├── schemas/          # Schema API endpoint
│   │   │   └── data/[schema-id]/ # Dynamic CRUD API routes
│   │   └── ...                   # Other pages
│   ├── components/
│   │   └── dynamic/              # Dynamic page renderer
│   ├── shared/
│   │   ├── schemas/              # Schema TypeScript definitions
│   │   ├── utils/                # Utilities (schema-registry, schema-loader)
│   │   └── domain/               # DDD base classes (Repository, Service, Controller)
│   └── gradian-ui/               # Reusable UI component library
└── docs/                         # Documentation
```

## 🎯 Quick Start

### 1. Installation

```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Add a New Entity

Simply edit `data/all-schemas.json`:

```json
{
  "id": "products",
  "name": "products",
  "title": "Create New Product",
  "singular_name": "Product",
  "plural_name": "Products",
  "sections": [
    {
      "id": "basic-info",
      "title": "Basic Information",
      "fields": [
        {
          "id": "product-name",
          "name": "name",
          "label": "Product Name",
          "type": "text",
          "component": "text",
          "required": true
        }
      ]
    }
  ]
}
```

**That's it!** The following are now automatically available:
- Page: `/page/products`
- API: `GET/POST /api/data/products`
- Forms, validation, and CRUD operations

## 📚 Documentation

- [Quick Start Guide](./QUICK_START_GUIDE.md) - Detailed setup and usage
- [Dynamic Schema System](./DYNAMIC_SCHEMA_REFACTOR.md) - How the schema system works
- [CRUD Architecture](./DYNAMIC_CRUD_ARCHITECTURE.md) - Domain-driven design implementation
- [Mock Data Guide](./MOCK_DATA_REFACTOR.md) - Data structure and metrics
- [Database Setup](./DATABASE_SETUP.md) - Prisma configuration

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Data Access**: Prisma (optional, JSON files by default)
- **Validation**: Zod
- **State Management**: Zustand
- **Charts**: Recharts

## 📦 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## 🎨 Key Concepts

### Dynamic Schema System

All entities are defined in `data/all-schemas.json`. The system automatically:
1. Generates API routes
2. Creates UI pages with forms
3. Handles CRUD operations
4. Validates data
5. Manages state

### Server-Side vs Client-Side

**Server-Side Functions** (sync):
```typescript
import { getSchemaById } from '@/shared/utils/schema-registry';
const schema = getSchemaById('vendors');
```

**Client-Side Functions** (async):
```typescript
import { fetchSchemaById } from '@/shared/utils/schema-registry';
const schema = await fetchSchemaById('vendors');
```

## 🤝 Contributing

1. Add schemas to `data/all-schemas.json`
2. Add data to corresponding JSON files in `data/`
3. Use existing components from `gradian-ui/`
4. Follow the domain-driven architecture

## 📄 License

This project is proprietary and confidential.

## 🔗 Related Projects

- Gradian UI - Custom component library
- Schema Manager - Auto-generation utilities

---

Built with ❤️ by the Gradian Team
