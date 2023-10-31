import crypto from 'crypto';
import axios from 'axios';
import CONFIG from '../config/index.js';
import fs from 'fs';
import { StatusCodes } from 'http-status-codes';
import jose from 'node-jose';
import { apiResponse } from './response.js';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';

const moduleUrl = import.meta.url;
const modulePath = dirname(fileURLToPath(moduleUrl));

const FORMAT = 'compact';
const CONTENT_ALG = 'A256CBC-HS512';

async function generateJWE(data) {
  const pemData = fs.readFileSync(`${modulePath.replace('/helpers', '')}/id_ukiss_4096.pub.spki.pem`);
  const key = await jose.JWK.asKey(pemData, 'spki');
  console.log('🚀 ~ file: encryption.js:21 ~ generateJWE ~ key:', key, { alg: 'RSA-OAEP-256' });

  const payload = {
    ...data,
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

  return jwe;
}

export async function handleMintRequest(req, res, next) {
  try {
    const { serial, requestId } = req.body;
    const jwe = await generateJWE({
      SERIAL_NO: serial,
      RET_MESSAGE: requestId,
    });
    console.log("🚀 ~ file: encryption.js:46 ~ handleMintRequest ~ jwe:", jwe)

    const projectId = CONFIG.OTHERS.PROJECT_ID;

    const requestPayload = {
      PROJECT_ID: projectId,
      TOKEN: jwe,
    };

    const response = await axios.post(CONFIG.OTHERS.UKISS_API, requestPayload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${CONFIG.OTHERS.UKISS_TOKEN}`,
      },
    });
    console.log("🚀 ~ file: encryption.js:61 ~ handleMintRequest ~ response:", response.data)

    res.status(StatusCodes.OK).json(apiResponse({
      message: 'success',
    }));
  } catch (error) {
    console.log("🚀 ~ file: encryption.js:79 ~ handleMintRequest ~ error:", error.message)
    next(error);
  }
}
