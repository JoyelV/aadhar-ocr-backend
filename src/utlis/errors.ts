export class CustomError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

// Error for rate limit exceedances
export class RateLimitError extends CustomError {
  constructor(message: string = 'Too many requests, please try again later.') {
    super(message);
    this.name = 'RateLimitError';
  }
}

// Error for Aadhaar-specific validation failures
export class AadhaarValidationError extends CustomError {
  constructor(message: string) {
    super(message);
    this.name = 'AadhaarValidationError';
  }
}