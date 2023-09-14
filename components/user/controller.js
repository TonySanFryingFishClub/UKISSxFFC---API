import { OK } from 'http-status-codes';

import UserServices from './services';
import { apiResponse } from '@/helpers/apiResponse';

export class UserController {
  /**
   * @description Gets the API information.
   * @param {Req} req
   * @param {Res} res
   */
  createUser = async (req, res) => {
    try {
      const { deviceId } = req.body;
      const user = await UserServices.createUser(deviceId);
      res.status(OK).json(apiResponse(user));
    } catch (error) {
      next(error);
    }
  };
  getUserByDeviceId = async (req, res) => {
    try {
      const { deviceId } = req.body;
      const user = await UserServices.getUserByDeviceId(deviceId);
      res.status(OK).json(apiResponse(user));
    } catch (error) {
      next(error);
    }
  };
}