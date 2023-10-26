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
  const keystore = jose.JWK.createKeyStore();
  const keyJson = JSON.parse(
    fs.readFileSync(`${modulePath.replace('/helpers', '')}/id_ukiss_4096.pub.pem`)
  );
  const key = await keystore.add(keyJson, 'json');

  const payload = {
    ...data,
  };

  const jwe = await jose.JWE.createEncrypt(
    {
      format: FORMAT,
      contentAlg: CONTENT_ALG,
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

    const projectId = CONFIG.OTHERS.PROJECT_ID;

    const requestPayload = {
      PROJECT_ID: projectId,
      TOKEN: jwe,
    };

    const response = await axios.post(CONFIG.OTHERS.UKISS_API, requestPayload, {
      headers: {
        'Content-Type': 'application/json',
        ExternalAPIBearerToken: CONFIG.OTHERS.UKISS_TOKEN,
      },
    });
    console.log("🚀 ~ file: encryption.js:61 ~ handleMintRequest ~ response:", response)

    res.status(StatusCodes.OK).json(apiResponse(requestPayload));
  } catch (error) {
    console.log("🚀 ~ file: encryption.js:79 ~ handleMintRequest ~ error:", error)
    next(error);
  }
}
