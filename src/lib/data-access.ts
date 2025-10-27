import { isMockData } from './config';
import {
  jsonVendorDataAccess,
  jsonUserDataAccess,
  jsonTenderDataAccess,
  jsonPurchaseOrderDataAccess,
  jsonShipmentDataAccess,
  jsonInvoiceDataAccess,
  jsonNotificationDataAccess,
  jsonQuotationDataAccess
} from './json-data-access';
import { calculateDashboardMetrics, calculateSpendAnalysis, calculateMonthlyTrends } from './measures';
import { prisma } from './prisma';

// User Data Access
export const userDataAccess = {
  async getAll() {
    if (isMockData()) {
      return await jsonUserDataAccess.getAll();
    }
    return await prisma.user.findMany();
  },

  async getById(id: string) {
    if (isMockData()) {
      return await jsonUserDataAccess.getById(id);
    }
    return await prisma.user.findUnique({ where: { id } });
  },

  async create(data: any) {
    if (isMockData()) {
      return await jsonUserDataAccess.create(data);
    }
    return await prisma.user.create({ data });
  },

  async update(id: string, data: any) {
    if (isMockData()) {
      return await jsonUserDataAccess.update(id, data);
    }
    return await prisma.user.update({ where: { id }, data });
  },

  async delete(id: string) {
    if (isMockData()) {
      return await jsonUserDataAccess.delete(id);
    }
    return await prisma.user.delete({ where: { id } });
  },
};

// Vendor Data Access
export const vendorDataAccess = {
  async getAll(filters?: any) {
    if (isMockData()) {
      let filteredVendors = await jsonVendorDataAccess.getAll();
      
      if (filters?.search) {
        filteredVendors = filteredVendors.filter((vendor: any) =>
          vendor.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          vendor.email.toLowerCase().includes(filters.search.toLowerCase())
        );
      }
      
      if (filters?.status) {
        filteredVendors = filteredVendors.filter((vendor: any) => vendor.status === filters.status);
      }
      
      if (filters?.categories?.length > 0) {
        filteredVendors = filteredVendors.filter((vendor: any) =>
          vendor.categories && filters.categories.some((category: string) => vendor.categories.includes(category))
        );
      }
      
      return filteredVendors;
    }
    
    return await prisma.vendor.findMany({
      where: {
        ...(filters?.search && {
          OR: [
            { name: { contains: filters.search, mode: 'insensitive' } },
            { email: { contains: filters.search, mode: 'insensitive' } },
          ],
        }),
        ...(filters?.status && { status: filters.status }),
        ...(filters?.categories?.length > 0 && {
          categories: { hasSome: filters.categories },
        }),
      },
      include: {
        primaryContact: true,
        contacts: true,
        certifications: true,
        performanceMetrics: true,
      },
    });
  },

  async getById(id: string) {
    if (isMockData()) {
      return await jsonVendorDataAccess.getById(id);
    }
    return await prisma.vendor.findUnique({
      where: { id },
      include: {
        primaryContact: true,
        contacts: true,
        certifications: true,
        performanceMetrics: true,
      },
    });
  },

  async create(data: any) {
    if (isMockData()) {
      return await jsonVendorDataAccess.create(data);
    }
    return await prisma.vendor.create({
      data,
      include: {
        primaryContact: true,
        contacts: true,
        certifications: true,
        performanceMetrics: true,
      },
    });
  },

  async update(id: string, data: any) {
    if (isMockData()) {
      return await jsonVendorDataAccess.update(id, data);
    }
    return await prisma.vendor.update({
      where: { id },
      data,
      include: {
        primaryContact: true,
        contacts: true,
        certifications: true,
        performanceMetrics: true,
      },
    });
  },

  async delete(id: string) {
    if (isMockData()) {
      return await jsonVendorDataAccess.delete(id);
    }
    return await prisma.vendor.delete({ where: { id } });
  },
};

// Tender Data Access
export const tenderDataAccess = {
  async getAll(filters?: any) {
    if (isMockData()) {
      let filteredTenders = await jsonTenderDataAccess.getAll();
      
      if (filters?.search) {
        filteredTenders = filteredTenders.filter((tender: any) =>
          tender.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          tender.description.toLowerCase().includes(filters.search.toLowerCase())
        );
      }
      
      if (filters?.status) {
        filteredTenders = filteredTenders.filter((tender: any) => tender.status === filters.status);
      }
      
      if (filters?.category) {
        filteredTenders = filteredTenders.filter((tender: any) => tender.category === filters.category);
      }
      
      return filteredTenders;
    }
    
    return await prisma.tender.findMany({
      where: {
        ...(filters?.search && {
          OR: [
            { title: { contains: filters.search, mode: 'insensitive' } },
            { description: { contains: filters.search, mode: 'insensitive' } },
          ],
        }),
        ...(filters?.status && { status: filters.status }),
        ...(filters?.category && { category: filters.category }),
      },
      include: {
        createdBy: true,
        awardedTo: true,
        items: true,
        quotations: {
          include: {
            vendor: true,
            items: true,
          },
        },
      },
    });
  },

  async getById(id: string) {
    if (isMockData()) {
      return await jsonTenderDataAccess.getById(id);
    }
    return await prisma.tender.findUnique({
      where: { id },
      include: {
        createdBy: true,
        awardedTo: true,
        items: true,
        quotations: {
          include: {
            vendor: true,
            items: true,
          },
        },
      },
    });
  },

  async create(data: any) {
    if (isMockData()) {
      return await jsonTenderDataAccess.create(data);
    }
    return await prisma.tender.create({
      data,
      include: {
        createdBy: true,
        awardedTo: true,
        items: true,
        quotations: {
          include: {
            vendor: true,
            items: true,
          },
        },
      },
    });
  },

  async update(id: string, data: any) {
    if (isMockData()) {
      return await jsonTenderDataAccess.update(id, data);
    }
    return await prisma.tender.update({
      where: { id },
      data,
      include: {
        createdBy: true,
        awardedTo: true,
        items: true,
        quotations: {
          include: {
            vendor: true,
            items: true,
          },
        },
      },
    });
  },

  async delete(id: string) {
    if (isMockData()) {
      return await jsonTenderDataAccess.delete(id);
    }
    return await prisma.tender.delete({ where: { id } });
  },
};

// Purchase Order Data Access
export const purchaseOrderDataAccess = {
  async getAll(filters?: any) {
    if (isMockData()) {
      let filteredPOs = await jsonPurchaseOrderDataAccess.getAll();
      
      if (filters?.search) {
        filteredPOs = filteredPOs.filter((po: any) =>
          po.poNumber.toLowerCase().includes(filters.search.toLowerCase()) ||
          po.vendor.name.toLowerCase().includes(filters.search.toLowerCase())
        );
      }
      
      if (filters?.status) {
        filteredPOs = filteredPOs.filter((po: any) => po.status === filters.status);
      }
      
      return filteredPOs;
    }
    
    return await prisma.purchaseOrder.findMany({
      where: {
        ...(filters?.search && {
          OR: [
            { poNumber: { contains: filters.search, mode: 'insensitive' } },
            { vendor: { name: { contains: filters.search, mode: 'insensitive' } } },
          ],
        }),
        ...(filters?.status && { status: filters.status }),
      },
      include: {
        vendor: true,
        tender: true,
        quotation: true,
        createdBy: true,
        approvedBy: true,
        items: true,
        shipments: true,
        invoices: true,
      },
    });
  },

  async getById(id: string) {
    if (isMockData()) {
      return await jsonPurchaseOrderDataAccess.getById(id);
    }
    return await prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        vendor: true,
        tender: true,
        quotation: true,
        createdBy: true,
        approvedBy: true,
        items: true,
        shipments: true,
        invoices: true,
      },
    });
  },

  async create(data: any) {
    if (isMockData()) {
      return await jsonPurchaseOrderDataAccess.create(data);
    }
    return await prisma.purchaseOrder.create({
      data,
      include: {
        vendor: true,
        tender: true,
        quotation: true,
        createdBy: true,
        approvedBy: true,
        items: true,
        shipments: true,
        invoices: true,
      },
    });
  },

  async update(id: string, data: any) {
    if (isMockData()) {
      return await jsonPurchaseOrderDataAccess.update(id, data);
    }
    return await prisma.purchaseOrder.update({
      where: { id },
      data,
      include: {
        vendor: true,
        tender: true,
        quotation: true,
        createdBy: true,
        approvedBy: true,
        items: true,
        shipments: true,
        invoices: true,
      },
    });
  },

  async delete(id: string) {
    if (isMockData()) {
      return await jsonPurchaseOrderDataAccess.delete(id);
    }
    return await prisma.purchaseOrder.delete({ where: { id } });
  },
};

// Dashboard Data Access
export const dashboardDataAccess = {
  async getMetrics() {
    if (isMockData()) {
      return calculateDashboardMetrics({
        purchaseOrders: await jsonPurchaseOrderDataAccess.getAll(),
        vendors: await jsonVendorDataAccess.getAll(),
        tenders: await jsonTenderDataAccess.getAll(),
        shipments: await jsonShipmentDataAccess.getAll(),
        invoices: await jsonInvoiceDataAccess.getAll(),
      });
    }
    
    // Calculate metrics from database
    const [purchaseOrders, vendors, tenders, shipments, invoices] = await Promise.all([
      prisma.purchaseOrder.findMany({
        where: { status: { not: 'CANCELLED' } },
      }),
      prisma.vendor.findMany(),
      prisma.tender.findMany(),
      prisma.shipment.findMany(),
      prisma.invoice.findMany(),
    ]);

    return calculateDashboardMetrics({
      purchaseOrders,
      vendors,
      tenders,
      shipments,
      invoices,
    });
  },

  async getSpendAnalysis() {
    if (isMockData()) {
      return calculateSpendAnalysis({
        purchaseOrders: await jsonPurchaseOrderDataAccess.getAll(),
      });
    }
    
    // Calculate spend analysis from database
    const purchaseOrders = await prisma.purchaseOrder.findMany({
      where: { status: { not: 'CANCELLED' } },
      include: { tender: true },
    });

    return calculateSpendAnalysis({ purchaseOrders });
  },

  async getMonthlyTrends() {
    if (isMockData()) {
      return calculateMonthlyTrends({
        purchaseOrders: await jsonPurchaseOrderDataAccess.getAll(),
      });
    }
    
    // Calculate monthly trends from database
    const purchaseOrders = await prisma.purchaseOrder.findMany({
      where: { status: { not: 'CANCELLED' } },
      select: { createdAt: true, totalAmount: true },
    });

    return calculateMonthlyTrends({ purchaseOrders });
  },
};

// Notification Data Access
export const notificationDataAccess = {
  async getAll(userId?: string) {
    if (isMockData()) {
      const notifications = await jsonNotificationDataAccess.getAll();
      return userId ? notifications.filter((n: any) => n.userId === userId) : notifications;
    }
    
    return await prisma.notification.findMany({
      where: userId ? { userId } : {},
      orderBy: { createdAt: 'desc' },
    });
  },

  async getById(id: string) {
    if (isMockData()) {
      return await jsonNotificationDataAccess.getById(id);
    }
    return await prisma.notification.findUnique({ where: { id } });
  },

  async create(data: any) {
    if (isMockData()) {
      return await jsonNotificationDataAccess.create(data);
    }
    return await prisma.notification.create({ data });
  },

  async markAsRead(id: string) {
    if (isMockData()) {
      return await jsonNotificationDataAccess.update(id, { isRead: true });
    }
    return await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  },

  async delete(id: string) {
    if (isMockData()) {
      return await jsonNotificationDataAccess.delete(id);
    }
    return await prisma.notification.delete({ where: { id } });
  },
};

// Quotation Data Access
export const quotationDataAccess = {
  async getAll(tenderId?: string) {
    if (isMockData()) {
      const quotations = await jsonQuotationDataAccess.getAll();
      return tenderId ? quotations.filter((q: any) => q.tenderId === tenderId) : quotations;
    }
    
    return await prisma.quotation.findMany({
      where: tenderId ? { tenderId } : {},
      include: {
        vendor: true,
        items: true,
      },
      orderBy: { submittedDate: 'desc' },
    });
  },

  async getById(id: string) {
    if (isMockData()) {
      return await jsonQuotationDataAccess.getById(id);
    }
    return await prisma.quotation.findUnique({
      where: { id },
      include: {
        vendor: true,
        items: true,
      },
    });
  },

  async create(data: any) {
    if (isMockData()) {
      return await jsonQuotationDataAccess.create(data);
    }
    return await prisma.quotation.create({
      data,
      include: {
        vendor: true,
        items: true,
      },
    });
  },

  async update(id: string, data: any) {
    if (isMockData()) {
      return await jsonQuotationDataAccess.update(id, data);
    }
    return await prisma.quotation.update({
      where: { id },
      data,
      include: {
        vendor: true,
        items: true,
      },
    });
  },

  async delete(id: string) {
    if (isMockData()) {
      return await jsonQuotationDataAccess.delete(id);
    }
    return await prisma.quotation.delete({ where: { id } });
  },
};
