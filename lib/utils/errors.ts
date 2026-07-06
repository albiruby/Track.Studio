export class ApplicationError extends Error {
  public code: string;
  public status?: number;

  constructor(message: string, code: string, status?: number) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.status = status;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class DatabaseError extends ApplicationError {
  constructor(message: string, code = 'DATABASE_ERROR') {
    super(message, code, 500);
  }
}

export class AuthenticationError extends ApplicationError {
  constructor(message: string, code = 'AUTH_ERROR') {
    super(message, code, 401);
  }
}

export class IntegrationError extends ApplicationError {
  constructor(message: string, code = 'INTEGRATION_ERROR', status = 400) {
    super(message, code, status);
  }
}

export class ConnectionNotFoundError extends DatabaseError {
  constructor(message = 'Target connection record was not found.') {
    super(message, 'CONNECTION_NOT_FOUND');
  }
}
