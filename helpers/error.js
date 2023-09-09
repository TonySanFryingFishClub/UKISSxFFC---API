import httpStatus from 'http-status';
import { REQUEST_TIMEOUT } from 'http-status-codes';
import CONFIG from '../config/index.js';

class TimeOutError {
  status;
  message;
  timeout;
  path;

  constructor(path) {
    Object.setPrototypeOf(this, new.target.prototype);

    this.status = REQUEST_TIMEOUT;
    this.message = httpStatus[REQUEST_TIMEOUT];
    this.timeout = CONFIG.SERVER.TIMEOUT;
    this.path = path;
  }
}

export default TimeOutError;
