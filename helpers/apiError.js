import httpStatus from 'http-status';
import { INTERNAL_SERVER_ERROR } from 'http-status-codes';

class APIError extends Error {
  status;
  message;
  error;

  constructor(message, status, error) {
    super();
    Object.setPrototypeOf(this, new.target.prototype);
    this.status = status || INTERNAL_SERVER_ERROR;
    this.message = message || (HttpStatus[INTERNAL_SERVER_ERROR]);
    if (error && error instanceof Error) {
      this.error = {
        type: error?.name,
        message: error?.message,
        stack: error?.stack,
      };
    }

    Error.captureStackTrace(this);
  }
}

export default APIError;