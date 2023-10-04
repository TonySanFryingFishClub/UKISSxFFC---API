import { OK } from 'http-status-codes';
import { Router } from 'express';
import { body } from 'express-validator';

import { validateJWTToken } from '../middlewares/validator.js';
import { decryptResponse } from '../middlewares/decryptor.js';
import { handleMintRequest } from '../helpers/encryption.js';
import { sanitizer } from '../helpers/dataSanitizers.js';
import User from '../components/user/model.js';
import Request from '../components/request/model.js';

import { handleMint } from '../helpers/handleMint.js';

const apiResponse = [
  body('PROJECT_ID')
    .isString()
    .withMessage('`PROJECT_ID` must be a string')
    .custom((value) => {
      return value === process.env.PROJECT_ID;
    })
    .withMessage('Invalid `PROJECT_ID`'),
  body('ENCRYPTED_KEY').isObject().withMessage('`ENCRYPTED_KEY` must be an object'),
  body('ENCRYPTED_KEY.CIPHERTEXT').isString().withMessage('`CIPHERTEXT` must be a string').custom(value => {
    return !!value.trim()
  }).withMessage('Invalid `CIPHERTEXT`'),
  body('ENCRYPTED_KEY.IV').isString().withMessage('`IV` must be a string').custom(value => {
    return !!value.trim()
  }).withMessage("Invalid `IV`"),
  body('TOKEN').isString().withMessage('`TOKEN` must be a string').custom((value) => {
    return !!value.trim();
  }).withMessage('Invalid `TOKEN`'),
];

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
  async (req, _res, next) => {
    const { deviceId, tier, amount } = req.body;
    console.log("🚀 ~ file: index.js:25 ~ deviceId, tier, amount:", deviceId, tier, amount)
    const user = await User.findOne({ deviceId });
    console.log('🚀 ~ file: index.js:27 ~ exist:', !!user);
    if (user) {
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
      const newUser = await User.create({ deviceId });
      await newUser.save();
      const request = await Request.create({ deviceId, tier, amount, user: newUser._id });
      await request.save();
      req.body['serial'] = request.serial;
      req.body['requestId'] = request._id;
      next();
    }
  },
  handleMintRequest
);
router.post('/ukissResponse', validateJWTToken, sanitizer(apiResponse), decryptResponse, async (req, res) => {
  const { data } = req.body;
  console.log("🚀 ~ file: index.js:57 ~ router.post ~ data:", data)
  const { WALLET_ADDRESS, RET_MESSAGE } = data?.PAYLOAD;
  console.log("🚀 ~ file: index.js:60 ~ router.post ~ WALLET_ADDRESS, RET_MESSAGE:", WALLET_ADDRESS, RET_MESSAGE)
  const request = await Request.findById(RET_MESSAGE);
  console.log("🚀 ~ file: index.js:62 ~ router.post ~ request:", request)
  if (request) {
    const user = await User.findByIdAndUpdate(request.user, {address: WALLET_ADDRESS}, {new: true});
    handleMint({
      id: user._id,
      address: user.address,
      tier: request.tier,
      amount: request.amount,
    });
    await Request.findByIdAndUpdate(request.id, { isCompleted: true });
    res.status(OK).json(apiResponse({
      message: 'Success',
    }));
  }
});

export default router;
