# Database Setup and Configuration Guide

This guide explains how to set up and configure the Gradian App to use either mock data or PostgreSQL database.

## Overview

The system now supports two data sources:
- **Mock Data**: Uses in-memory mock data (default)
- **Database**: Uses PostgreSQL with Prisma ORM

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/gradian_scm?schema=public"

# Data Source Configuration
DATA_SOURCE="mock" # Options: "mock" | "database"

# Next.js
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### Switching Data Sources

To switch between mock data and database:

1. **Use Mock Data (Default)**:
   ```env
   DATA_SOURCE="mock"
   ```

2. **Use Database**:
   ```env
   DATA_SOURCE="database"
   DATABASE_URL="postgresql://username:password@localhost:5432/gradian_scm?schema=public"
   ```

## Database Setup

### Prerequisites

- PostgreSQL installed and running
- Node.js 18+ installed

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Generate Prisma client:
   ```bash
   npm run db:generate
   ```

3. Set up the database:
   ```bash
   # Push schema to database
   npm run db:push
   
   # Or create and run migrations
   npm run db:migrate
   ```

4. Seed the database with mock data:
   ```bash
   npm run db:seed
   ```

### Database Schema

The Prisma schema includes the following main entities:

- **Users**: System users and authentication
- **Vendors**: Vendor information, contacts, certifications, performance metrics
- **Tenders**: Procurement tenders with items and evaluation criteria
- **Quotations**: Vendor responses to tenders
- **Purchase Orders**: Generated from awarded quotations
- **Shipments**: Tracking of deliveries
- **Invoices**: Payment processing
- **Notifications**: System notifications

### Key Relationships

```
User ──┬─> Tender ──┬─> Quotation ──┬─> PurchaseOrder ──┬─> Shipment ──┬─> Invoice
       │            │               │                   │              │
       └─> Vendor ──┴───────────────┴───────────────────┴──────────────┴─> Invoice
```

## Development Commands

### Database Operations

```bash
# Generate Prisma client
npm run db:generate

# Push schema changes to database
npm run db:push

# Create and run migrations
npm run db:migrate

# Open Prisma Studio (database GUI)
npm run db:studio

# Seed database with mock data
npm run db:seed
```

### Development Server

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Data Access Layer

The system uses a unified data access layer that automatically switches between mock data and database based on the `DATA_SOURCE` configuration.

### Key Files

- `src/lib/config.ts` - Configuration management
- `src/lib/data-access.ts` - Unified data access layer
- `src/lib/prisma.ts` - Prisma client setup
- `prisma/schema.prisma` - Database schema
- `prisma/seed.ts` - Database seeding script

### API Routes

All API routes have been updated to use the data access layer:

- `/api/dashboard` - Dashboard metrics and analytics
- `/api/vendors` - Vendor management
- `/api/tenders` - Tender management
- `/api/purchase-orders` - Purchase order management
- `/api/notifications` - Notification system

## Migration from Mock Data

To migrate from mock data to database:

1. Set up PostgreSQL database
2. Configure environment variables
3. Run database setup commands
4. Change `DATA_SOURCE` to `"database"`
5. Restart the application

The system will automatically use the database instead of mock data.

## Troubleshooting

### Common Issues

1. **Database Connection Error**:
   - Check PostgreSQL is running
   - Verify DATABASE_URL is correct
   - Ensure database exists

2. **Prisma Client Error**:
   - Run `npm run db:generate`
   - Check schema syntax

3. **Migration Issues**:
   - Reset database: `npx prisma migrate reset`
   - Push schema: `npm run db:push`

### Logs

Check console logs for detailed error messages. The system logs all database operations and errors.

## Production Deployment

For production deployment:

1. Set up production PostgreSQL database
2. Configure production environment variables
3. Run migrations: `npm run db:migrate`
4. Set `DATA_SOURCE="database"`
5. Deploy application

## Performance Considerations

- Database queries are optimized with proper indexing
- Use connection pooling for high-traffic applications
- Monitor database performance with Prisma Studio
- Consider caching for frequently accessed data

## Security

- Use environment variables for sensitive data
- Implement proper database access controls
- Use connection strings with limited permissions
- Regular security updates for dependencies
