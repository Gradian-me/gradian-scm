import { AppError, ConflictError, NotFoundError, ValidationError } from '../../../shared/errors';

export class PurchaseOrderNotFoundError extends NotFoundError {
  constructor(id: string) {
    super('Purchase Order', id);
  }
}

export class PurchaseOrderNumberAlreadyExistsError extends ConflictError {
  constructor(poNumber: string) {
    super(`Purchase Order with number ${poNumber} already exists`);
  }
}

export class InvalidPurchaseOrderStatusError extends ValidationError {
  constructor(status: string) {
    super(`Invalid purchase order status: ${status}`);
  }
}

export class PurchaseOrderAlreadyApprovedError extends ValidationError {
  constructor() {
    super('Cannot modify an approved purchase order');
  }
}

export class PurchaseOrderAlreadyCompletedError extends ValidationError {
  constructor() {
    super('Cannot modify a completed purchase order');
  }
}

export class InsufficientPermissionsError extends ValidationError {
  constructor(action: string) {
    super(`Insufficient permissions to ${action} purchase order`);
  }
}

export class VendorNotFoundError extends NotFoundError {
  constructor(id: string) {
    super('Vendor', id);
  }
}

export class TenderNotFoundError extends NotFoundError {
  constructor(id: string) {
    super('Tender', id);
  }
}

export class QuotationNotFoundError extends NotFoundError {
  constructor(id: string) {
    super('Quotation', id);
  }
}
