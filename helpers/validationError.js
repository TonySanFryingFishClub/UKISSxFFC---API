import httpStatus from 'http-status';
import { StatusCodes } from 'http-status-codes';

class ValidationError extends Error {
  status;
  message;
  details;

  constructor(validationErrors) {
    super();
    Object.setPrototypeOf(this, new.target.prototype);

    this.status = StatusCodes.BAD_REQUEST;
    this.message = httpStatus[StatusCodes.BAD_REQUEST];
    this.details = validationErrors;

    Error.captureStackTrace(this);
  }
}

export default ValidationError;
