export class BaseException extends Error {
    constructor(
      public readonly message: string,
      public readonly code: string,
      public readonly statusCode: number,
      public readonly details?: any
    ) {
      super(message);
      this.name = this.constructor.name;
      Error.captureStackTrace(this, this.constructor);
    }
  }