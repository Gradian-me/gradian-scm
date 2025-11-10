// Domain Errors
// Custom error classes for domain operations

export class DomainError extends Error {
  constructor(
    message: string,
    public code: string = 'DOMAIN_ERROR',
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'DomainError';
    Object.setPrototypeOf(this, DomainError.prototype);
  }
}

export class EntityNotFoundError extends DomainError {
  constructor(entityName: string, id: string) {
    super(
      `${entityName} with ID "${id}" not found`,
      'ENTITY_NOT_FOUND',
      404
    );
    this.name = 'EntityNotFoundError';
  }
}

export class ValidationError extends DomainError {
  constructor(
    message: string,
    public errors: Array<{ field: string; message: string }> = []
  ) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

export class DuplicateEntityError extends DomainError {
  constructor(entityName: string, field: string, value: string) {
    super(
      `${entityName} with ${field} "${value}" already exists`,
      'DUPLICATE_ENTITY',
      409
    );
    this.name = 'DuplicateEntityError';
  }
}

export class UnauthorizedError extends DomainError {
  constructor(message: string = 'Unauthorized access') {
    super(message, 'UNAUTHORIZED', 401);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends DomainError {
  constructor(message: string = 'Forbidden access') {
    super(message, 'FORBIDDEN', 403);
    this.name = 'ForbiddenError';
  }
}

export class DataStorageError extends DomainError {
  constructor(operation: string, details?: string) {
    super(
      `Data storage error during ${operation}${details ? `: ${details}` : ''}`,
      'DATA_STORAGE_ERROR',
      500
    );
    this.name = 'DataStorageError';
  }
}

/**
 * Handle domain errors and convert to API response format
 */
export function handleDomainError(error: unknown): {
  success: false;
  error: string;
  statusCode: number;
  code?: string;
} {
  if (error instanceof DomainError) {
    return {
      success: false,
      error: error.message,
      statusCode: error.statusCode,
      code: error.code,
    };
  }

  if (error instanceof Error) {
    return {
      success: false,
      error: error.message,
      statusCode: 500,
      code: 'INTERNAL_ERROR',
    };
  }

  return {
    success: false,
    error: 'An unexpected error occurred',
    statusCode: 500,
    code: 'UNKNOWN_ERROR',
  };
}

