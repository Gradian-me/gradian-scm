import { AppError, ConflictError, NotFoundError, ValidationError } from '../../../shared/errors';

export class VendorNotFoundError extends NotFoundError {
  constructor(id: string) {
    super('Vendor', id);
  }
}

export class VendorEmailAlreadyExistsError extends ConflictError {
  constructor(email: string) {
    super(`Vendor with email ${email} already exists`);
  }
}

export class VendorRegistrationNumberAlreadyExistsError extends ConflictError {
  constructor(registrationNumber: string) {
    super(`Vendor with registration number ${registrationNumber} already exists`);
  }
}

export class InvalidVendorStatusError extends ValidationError {
  constructor(status: string) {
    super(`Invalid vendor status: ${status}`);
  }
}

export class VendorCategoryValidationError extends ValidationError {
  constructor(category: string) {
    super(`Invalid vendor category: ${category}`);
  }
}

export class VendorRatingValidationError extends ValidationError {
  constructor(rating: number) {
    super(`Invalid vendor rating: ${rating}. Rating must be between 0 and 5`);
  }
}
