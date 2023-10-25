import { validationResult } from 'express-validator';
import ValidationError from './validationError.js';

const catchValidatorError = (req, _res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const validationErrors = errors
      .array()
      .reduce((obj, error) => {
        obj[error.path] = error.msg;
        return obj;
      }, {});
    throw new ValidationError(validationErrors);
  }
  next();
};

export const sanitizer = (validator) => [
  ...validator,
  catchValidatorError,
];