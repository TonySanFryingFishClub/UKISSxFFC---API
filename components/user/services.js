import { NOT_FOUND, UNAUTHORIZED, FORBIDDEN } from 'http-status-codes';

import User from './model';

export default class UserServices {
  /**
   * @description Get user information.
   * @returns User
   */
  createUser = async (deviceId) => {
    const user = await User.create({ deviceId });

    await user.save();

    return user;
  };
  getUserByDeviceId = async (deviceId) => {
    const user = await User.findOne({ deviceId });

    if (!user) throw new APIError('User not found', NOT_FOUND);

    return user;
  }
};