import { AppError, ConflictError, NotFoundError, ValidationError } from '../../../shared/errors';

export class TenderNotFoundError extends NotFoundError {
  constructor(id: string) {
    super('Tender', id);
  }
}

export class TenderTitleAlreadyExistsError extends ConflictError {
  constructor(title: string) {
    super(`Tender with title "${title}" already exists`);
  }
}

export class InvalidTenderStatusError extends ValidationError {
  constructor(status: string) {
    super(`Invalid tender status: ${status}`);
  }
}

export class TenderAlreadyClosedError extends ValidationError {
  constructor() {
    super('Cannot modify a closed tender');
  }
}

export class TenderAlreadyAwardedError extends ValidationError {
  constructor() {
    super('Cannot modify an awarded tender');
  }
}

export class InvalidEvaluationCriteriaError extends ValidationError {
  constructor() {
    super('Evaluation criteria must total 100%');
  }
}

export class TenderCategoryValidationError extends ValidationError {
  constructor(category: string) {
    super(`Invalid tender category: ${category}`);
  }
}

export class QuotationNotFoundError extends NotFoundError {
  constructor(id: string) {
    super('Quotation', id);
  }
}

export class QuotationAlreadySubmittedError extends ConflictError {
  constructor() {
    super('Quotation has already been submitted for this tender');
  }
}

export class QuotationExpiredError extends ValidationError {
  constructor() {
    super('Quotation has expired');
  }
}
