import httpStatus from 'http-status';
import { StatusCodes } from 'http-status-codes';
import CONFIG from '../config/index.js';

class TimeOutError {
  status;
  message;
  timeout;
  path;

  constructor(path) {
    Object.setPrototypeOf(this, new.target.prototype);

    this.status = StatusCodes.REQUEST_TIMEOUT;
    this.message = httpStatus[StatusCodes.REQUEST_TIMEOUT];
    this.timeout = CONFIG.SERVER.TIMEOUT;
    this.path = path;
  }
}

export default TimeOutError;
