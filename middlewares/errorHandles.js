import HttpStatus from 'http-status';
import { NOT_FOUND, INTERNAL_SERVER_ERROR, REQUEST_TIMEOUT } from 'http-status-codes';
import TimeOutError from '../helpers/error.js';

/**
 * @description Error response middleware for 404 not found. This middleware function should be at the very bottom of the stack.
 * @param req Express.Request
 * @param res Express.Response
 * @param _next Express.NextFunction
 */
export const notFoundError = (req, res, _next) => {
  res.status(NOT_FOUND).json({
    error: {
      code: NOT_FOUND,
      message: HttpStatus[NOT_FOUND],
      path: req.originalUrl,
    },
  });
};

/**
 * @description Generic error response middleware for validation and internal server errors.
 * @param {*} err
 * @param {object}   req Express.Request
 * @param {object}   res Express.Response
 * @param {function} next Express.NextFunction
 */
export const genericErrorHandler = (err, req, res, _next) => {
  let resCode = err.status || INTERNAL_SERVER_ERROR;
  let resBody = err;

  if (err.code === 'ETIMEDOUT') {
    resCode = REQUEST_TIMEOUT;
    resBody = new TimeOutError(req.originalUrl);
  }

  res.status(resCode).json(resBody);
};