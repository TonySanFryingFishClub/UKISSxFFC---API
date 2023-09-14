import HttpStatus from 'http-status';
import { OK } from 'http-status-codes';

export const apiResponse = (data) => {
  return {
    status: OK,
    message: HttpStatus[OK],
    data,
  };
};