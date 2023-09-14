import { UNAUTHORIZED } from 'http-status-codes';
import jwt from 'jsonwebtoken';
import Config from '../config/index.js';

const { ACCESS_TOKEN_SALT, TOKEN_HEADER_KEY } = Config.AUTH;

export const validateJWTToken = async (req, _res, next) => {
  try {
    const token = req.header(TOKEN_HEADER_KEY) || "";
    const verified = jwt.verify(token, ACCESS_TOKEN_SALT);
    if (verified['Issuer'] === 'FryingFishClub' && verified['Username'] === 'UKiss') {
      req.body.isAuthorized = true;
      next();
    } else {
      throw new APIError('Unauthorized access', UNAUTHORIZED);
    }
  } catch (error) {
    next(error);
  }
};