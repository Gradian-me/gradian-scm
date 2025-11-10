export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public readonly field?: string) {
    super(message, 400);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super(`${resource}${id ? ` with id ${id}` : ''} not found`, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = 'Internal server error') {
    super(message, 500);
  }
}

export const isAppError = (error: any): error is AppError => {
  return error instanceof AppError;
};

export const handleError = (error: any): AppError => {
  if (isAppError(error)) {
    return error;
  }

  if (error.name === 'ValidationError') {
    return new ValidationError(error.message);
  }

  if (error.name === 'CastError') {
    return new BadRequestError('Invalid ID format');
  }

  if (error.code === 11000) {
    return new ConflictError('Duplicate field value');
  }

  return new InternalServerError(error.message || 'Something went wrong');
};
