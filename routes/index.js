import { OK, NOT_FOUND } from 'http-status-codes';
import { Router } from 'express';
import { body } from 'express-validator';
import path, { dirname } from 'path';
import jose from 'node-jose';
import forge from 'node-forge';
import fs from 'fs';
import { ethers } from 'ethers';

import { validateJWTToken } from '../middlewares/validator.js';
import { decryptResponse } from '../middlewares/decryptor.js';
import { handleMintRequest } from '../helpers/encryption.js';
import { sanitizer } from '../helpers/dataSanitizers.js';
import User from '../components/user/model.js';
import Request from '../components/request/model.js';

import { handleMint } from '../helpers/handleMint.js';
import { apiResponse } from '../helpers/response.js';
import { fileURLToPath } from 'url';
import APIError from '../helpers/apiError.js';

const moduleUrl = import.meta.url;
const modulePath = dirname(fileURLToPath(moduleUrl));

const FORMAT = 'compact';
const CONTENT_ALG = 'A256CBC-HS512';
const ALG = 'RSA-OAEP';
const PADDING = 'RSA_PKCS1_OAEP_PADDING';
const HASH = 'sha512';

const apiValidation = [
  body('PROJECT_ID')
    .isString()
    .withMessage('`PROJECT_ID` must be a string')
    .custom((value) => {
      return value === process.env.PROJECT_ID;
    })
    .withMessage('Invalid `PROJECT_ID`'),
  body('TOKEN')
    .isString()
    .withMessage('`TOKEN` must be a string')
    .custom((value) => {
      return !!value;
    })
    .withMessage('Missing `TOKEN`'),
];

const router = Router();

router.get('/', (_req, res) => {
  res.status(OK).json({ message: 'Hello from API' });
});
router.get('/ping', (_req, res) => {
  res.status(OK).json({ message: 'pong' });
});
router.post('/generateKey', async (_req, res) => {
  try {
    // Create a key store and generate an RSA key
    const pemData = fs.readFileSync(`${modulePath.replace('/routes', '')}/id_ukiss_4096.pub.pem`);
    const key = await jose.JWK.asKey(pemData, 'pem');
    // Save the key to a file
    const payload = {
      SERIAL_NO: '0000',
      RET_MESSAGE: '1234',
    };

    const jwe = await jose.JWE.createEncrypt(
      {
        format: FORMAT,
        contentAlg: CONTENT_ALG,
        fields: { alg: 'RSA-OAEP' },
      },
      key
    )
      .update(JSON.stringify(payload))
      .final();

    res.status(OK).json({ message: 'success', jwe });
  } catch (error) {
    console.error('Error:', error);
  }
});
router.post('/decrypt', decryptResponse, async (req, res) => {
  const { data } = req.body;
  res.status(OK).json({ message: 'success', data });
});
router.post('/mintNFT', async (req, res, next) => {
  try {
    const { address, tier, amount } = req.body;
    await handleMint({ address, tier, amount });
    res.status(OK).json({ message: 'success' });
  } catch (error) {
    console.log('🚀 ~ file: index.js:82 ~ router.post ~ error:', error);
    next(error);
  }
});
router.post(
  '/requestMintAddress',
  validateJWTToken,
  async (req, _res, next) => {
    const { deviceId, tier, amount } = req.body;
    const user = await User.findOne({ deviceId });
    if (user) {
      if (user?.address) {
        await handleMint({
          address: user.address,
          tier,
          amount,
        });
      } else {
        const request = await Request.create({ deviceId, tier, amount, user: user._id });
        await request.save();
        req.body['serial'] = request.deviceId;
        req.body['requestId'] = request._id;
        next();
      }
    } else {
      const newUser = await User.create({ deviceId });
      await newUser.save();
      const request = await Request.create({ deviceId, tier, amount, user: newUser._id });
      await request.save();
      req.body['serial'] = deviceId;
      req.body['requestId'] = request._id;
      next();
    }
  },
  handleMintRequest
);
router.post(
  '/ukissResponse',
  validateJWTToken,
  sanitizer(apiValidation),
  decryptResponse,
  async (req, res, next) => {
    try {
      const { data } = req.body;
      const { WALLET_ADDRESS, RET_MESSAGE } = data;
      const request = await Request.findById(RET_MESSAGE);
      if (request) {
        const user = await User.findByIdAndUpdate(
          request.user,
          { address: WALLET_ADDRESS },
          { new: true }
        );

        await handleMint({
          address: user.address,
          tier: request.tier[0],
          amount: request.amount,
        });
        await Request.findByIdAndUpdate(request.id, { isCompleted: true });

        res.status(OK).json(
          apiResponse({
            message: 'Success',
          })
        );
      } else {
        res.status(NOT_FOUND).json(
          apiResponse({
            message: `Request with id ${RET_MESSAGE} not found`,
          })
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

export default router;
