import { PrismaClient } from '@prisma/client';
import { mockUsers, mockVendors, mockTenders, mockPurchaseOrders, mockNotifications } from '../src/lib/mock-data';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.notification.deleteMany();
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.shipmentItem.deleteMany();
  await prisma.shipment.deleteMany();
  await prisma.purchaseOrderItem.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.quotationItem.deleteMany();
  await prisma.quotation.deleteMany();
  await prisma.tenderItem.deleteMany();
  await prisma.tender.deleteMany();
  await prisma.vendorCertification.deleteMany();
  await prisma.vendorPerformanceMetrics.deleteMany();
  await prisma.vendorContact.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.user.deleteMany();

  // Seed Users
  console.log('👥 Seeding users...');
  for (const user of mockUsers) {
    await prisma.user.create({
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
        avatar: user.avatar,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  }

  // Seed Vendors
  console.log('🏢 Seeding vendors...');
  for (const vendor of mockVendors) {
    // Create primary contact first
    const primaryContact = await prisma.vendorContact.create({
      data: {
        id: vendor.primaryContact.id,
        name: vendor.primaryContact.name,
        email: vendor.primaryContact.email,
        phone: vendor.primaryContact.phone,
        position: vendor.primaryContact.position,
        isPrimary: vendor.primaryContact.isPrimary,
        vendorId: vendor.id,
      },
    });

    // Create vendor
    const createdVendor = await prisma.vendor.create({
      data: {
        id: vendor.id,
        name: vendor.name,
        email: vendor.email,
        phone: vendor.phone,
        address: vendor.address,
        city: vendor.city,
        state: vendor.state,
        zipCode: vendor.zipCode,
        country: vendor.country,
        registrationNumber: vendor.registrationNumber,
        taxId: vendor.taxId,
        status: vendor.status.toUpperCase() as any,
        rating: vendor.rating,
        joinedDate: vendor.joinedDate,
        primaryContactId: primaryContact.id,
        createdAt: vendor.createdAt,
        updatedAt: vendor.updatedAt,
      },
    });

    // Create performance metrics
    if (vendor.performanceMetrics) {
      await prisma.vendorPerformanceMetrics.create({
        data: {
          onTimeDelivery: vendor.performanceMetrics.onTimeDelivery,
          qualityScore: vendor.performanceMetrics.qualityScore,
          priceCompetitiveness: vendor.performanceMetrics.priceCompetitiveness,
          responsiveness: vendor.performanceMetrics.responsiveness,
          complianceScore: vendor.performanceMetrics.complianceScore,
          totalOrders: vendor.performanceMetrics.totalOrders,
          totalValue: vendor.performanceMetrics.totalValue,
          averageOrderValue: vendor.performanceMetrics.averageOrderValue,
          vendorId: vendor.id,
        },
      });
    }

    // Create certifications
    for (const cert of vendor.certifications) {
      await prisma.vendorCertification.create({
        data: {
          id: cert.id,
          name: cert.name,
          issuer: cert.issuer,
          issueDate: cert.issueDate,
          expiryDate: cert.expiryDate,
          status: cert.status,
          documentUrl: cert.documentUrl,
          vendorId: vendor.id,
        },
      });
    }
  }

  // Seed Tenders
  console.log('📋 Seeding tenders...');
  for (const tender of mockTenders) {
    const createdTender = await prisma.tender.create({
      data: {
        id: tender.id,
        title: tender.title,
        description: tender.description,
        category: tender.category,
        estimatedValue: tender.estimatedValue,
        currency: tender.currency,
        status: tender.status.toUpperCase() as any,
        publishedDate: tender.publishedDate,
        closingDate: tender.closingDate,
        awardDate: tender.awardDate,
        createdById: tender.createdBy,
        awardedToId: tender.awardedTo,
        evaluationCriteria: tender.evaluationCriteria,
        createdAt: tender.createdAt,
        updatedAt: tender.updatedAt,
      },
    });

    // Create tender items
    for (const item of tender.items) {
      await prisma.tenderItem.create({
        data: {
          id: item.id,
          productName: item.productName,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          specifications: item.specifications,
          estimatedUnitPrice: item.estimatedUnitPrice,
          totalEstimatedPrice: item.totalEstimatedPrice,
          tenderId: tender.id,
        },
      });
    }
  }

  // Seed Purchase Orders
  console.log('🛒 Seeding purchase orders...');
  for (const po of mockPurchaseOrders) {
    const createdPO = await prisma.purchaseOrder.create({
      data: {
        id: po.id,
        poNumber: po.poNumber,
        vendorId: po.vendorId,
        tenderId: po.tenderId,
        quotationId: po.quotationId,
        status: po.status.toUpperCase().replace('_', '_') as any,
        subtotal: po.subtotal,
        tax: po.tax,
        totalAmount: po.totalAmount,
        currency: po.currency,
        taxRate: po.taxRate,
        paymentTerms: po.paymentTerms,
        deliveryTerms: po.deliveryTerms,
        expectedDeliveryDate: po.expectedDeliveryDate,
        notes: po.notes,
        createdById: po.createdBy,
        approvedById: po.approvedBy,
        approvedAt: po.approvedAt,
        acknowledgedAt: po.acknowledgedAt,
        createdAt: po.createdAt,
        updatedAt: po.updatedAt,
      },
    });

    // Create purchase order items
    for (const item of po.items) {
      await prisma.purchaseOrderItem.create({
        data: {
          id: item.id,
          productName: item.productName,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          specifications: item.specifications,
          purchaseOrderId: po.id,
        },
      });
    }
  }

  // Seed Notifications
  console.log('🔔 Seeding notifications...');
  for (const notification of mockNotifications) {
    await prisma.notification.create({
      data: {
        id: notification.id,
        userId: notification.userId,
        title: notification.title,
        message: notification.message,
        type: notification.type.toUpperCase() as any,
        isRead: notification.isRead,
        actionUrl: notification.actionUrl,
        createdAt: notification.createdAt,
      },
    });
  }

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
