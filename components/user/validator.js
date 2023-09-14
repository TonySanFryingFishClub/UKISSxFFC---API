import { body } from 'express-validator';
import { Tier } from './model';

export const validateDeviceId = [
  body('deviceId')
    .isString()
    .withMessage('deviceId must be a string'),
];

export const mintRequest = [
  body('deviceId').isString().withMessage('deviceId must be a string'),
  body('tier')
    .isString()
    .withMessage('tier must be a string')
    .custom((value) => {
      if (!Object.values(Tier).includes(value)) {
        throw new Error('Invalid tier value');
      }
      return true;
    }),
  body('amount').isNumeric().withMessage('amount must be a number'),
];