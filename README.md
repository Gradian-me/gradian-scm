# Gradian Supply Chain Management System

A comprehensive supply chain management system built with Next.js 14, TypeScript, and modern web technologies. This system is designed specifically for pharmaceutical companies to manage their procurement, vendor relationships, and supply chain operations.

## Features

### 🏠 Dashboard
- Real-time KPI metrics and analytics
- Interactive charts and data visualizations
- Recent activity feed
- Quick action buttons
- Responsive design with smooth animations

### 👥 Vendor Management
- Complete vendor profiles with contact information
- Performance tracking and metrics
- Certification management
- Rating and review system
- Advanced search and filtering

### 📋 Tender Management
- Create and manage procurement tenders
- Quotation submission and evaluation
- Automated evaluation criteria
- Timeline tracking
- Status management

### 🛒 Purchase Orders
- Generate purchase orders from tenders
- Multi-level approval workflow
- Vendor integration
- Status tracking
- PDF generation

### 📊 Analytics & Reporting
- Comprehensive spend analysis
- Monthly trend tracking
- Vendor performance metrics
- Cost savings calculations
- Export capabilities

### 🚚 Shipment Tracking
- Real-time shipment status
- Carrier integration
- Delivery tracking
- Exception management

### 💰 Invoice Management
- Automated invoice processing
- Approval workflows
- Payment tracking
- Financial reporting

## Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, ShadCN/UI
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Icons**: Lucide React
- **Forms**: React Hook Form, Zod validation
- **State Management**: React Query (TanStack Query)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd gradian-scm
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── vendors/           # Vendor management pages
│   ├── tenders/           # Tender management pages
│   ├── purchase-orders/   # Purchase order pages
│   ├── analytics/         # Analytics pages
│   └── page.tsx           # Dashboard page
├── components/            # Reusable components
│   ├── ui/               # ShadCN/UI components
│   ├── layout/           # Layout components
│   └── dashboard/        # Dashboard-specific components
├── lib/                  # Utility functions
│   ├── utils.ts          # Common utilities
│   ├── validations.ts    # Zod schemas
│   └── mock-data.ts      # Sample data
└── types/                # TypeScript type definitions
    └── index.ts          # Main type definitions
```

## Key Features Implemented

### ✅ Completed
- [x] Next.js 14 project setup with TypeScript
- [x] ShadCN/UI component library integration
- [x] Responsive sidebar navigation with animations
- [x] Dashboard with KPI cards and analytics charts
- [x] Vendor management with performance tracking
- [x] Tender management system
- [x] Purchase order management
- [x] Analytics and reporting
- [x] API routes with validation
- [x] Mock data and seed data
- [x] Framer Motion animations

### 🚧 In Progress
- [ ] Dark mode support
- [ ] Notifications system
- [ ] RBAC (Role-Based Access Control)
- [ ] Shipment tracking
- [ ] Invoice management
- [ ] Calendar integration
- [ ] Advanced filtering and search

## API Endpoints

### Dashboard
- `GET /api/dashboard` - Get dashboard metrics and analytics

### Vendors
- `GET /api/vendors` - List all vendors
- `POST /api/vendors` - Create new vendor
- `GET /api/vendors/[id]` - Get vendor details
- `PUT /api/vendors/[id]` - Update vendor
- `DELETE /api/vendors/[id]` - Delete vendor

### Tenders
- `GET /api/tenders` - List all tenders
- `POST /api/tenders` - Create new tender
- `GET /api/tenders/[id]` - Get tender details
- `PUT /api/tenders/[id]` - Update tender
- `DELETE /api/tenders/[id]` - Cancel tender
- `GET /api/tenders/[id]/quotations` - Get tender quotations
- `POST /api/tenders/[id]/quotations` - Submit quotation

### Purchase Orders
- `GET /api/purchase-orders` - List all purchase orders
- `POST /api/purchase-orders` - Create new purchase order
- `GET /api/purchase-orders/[id]` - Get purchase order details
- `PUT /api/purchase-orders/[id]` - Update purchase order
- `DELETE /api/purchase-orders/[id]` - Cancel purchase order

### Notifications
- `GET /api/notifications` - Get user notifications
- `POST /api/notifications` - Create notification
- `PUT /api/notifications/[id]/read` - Mark notification as read

## Design System

The application follows a consistent design system with:

- **Color Palette**: Blue primary, with semantic colors for success, warning, error, and info
- **Typography**: Clean, readable fonts with proper hierarchy
- **Spacing**: Consistent spacing scale using Tailwind CSS
- **Components**: Reusable, accessible components built with ShadCN/UI
- **Animations**: Smooth, purposeful animations using Framer Motion

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.