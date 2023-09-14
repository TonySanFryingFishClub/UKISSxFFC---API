import { OK } from 'http-status-codes';
import { Router } from 'express';

import { validateJWTToken } from '../middlewares/validator.js';
import { decryptResponse } from '../middlewares/decryptor.js';
import { handleMintRequest } from '../helpers/encryption.js';
import User from '../components/user/model.js';
import Request from '../components/request/model.js';

import { handleMint } from '../helpers/handleMint.js';

const router = Router();

router.get('/', (_req, res) => {
  res.status(OK).json({ message: 'Hello from API' });
});
router.get('/ping', (_req, res) => {
  res.status(OK).json({ message: 'pong' });
});
router.post(
  '/requestMintAddress',
  validateJWTToken,
  async (req, res) => {
    const { deviceId, tier, amount } = req.body;
    const exist = await User.exist({ deviceId });
    if (exist) {
      const user = await User.findOne({ deviceId });
      if (user?.address) {
        handleMint({
          id: user._id,
          address: user.address,
          tier,
          amount,
        });
      } else {
        const request = await Request.create({ deviceId, tier, amount, user: user._id });
        await request.save();
        req.body['serial'] = request.serial;
        req.body['requestId'] = request._id;
        next();
      }
    } else {
      const user = await User.create({ deviceId });
      await user.save();
      const request = await Request.create({ deviceId, tier, amount, user: user._id });
      await request.save();
      req.body['serial'] = request.serial;
      req.body['requestId'] = request._id;
      next();
    }
  },
  handleMintRequest
);
router.post('/ukissResponse', validateJWTToken, decryptResponse, async (req, res) => {
  const {data} = req.body;
  console.log("🚀 ~ file: index.js:56 ~ router.post ~ data:", data);
  const { WALLET_ADDRESS, RET_MESSAGE } = data?.PAYLOAD;
  const request = await Request.findById(RET_MESSAGE);
  if (request) {
    const user = await User.findByIdAndUpdate(request.user, {address: WALLET_ADDRESS}, {new: true});
    handleMint({
      id: user._id,
      address: user.address,
      tier: request.tier,
      amount: request.amount,
    });
    await Request.findByIdAndUpdate(request.id, { isCompleted: true });
    res.status(OK).json(apiResponse({}));
  }
});

export default router;
