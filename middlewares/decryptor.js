import crypto from 'crypto';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import { StatusCodes } from 'http-status-codes';
import jose from 'node-jose';

import APIError from "../helpers/apiError.js";

const moduleUrl = import.meta.url;
const modulePath = dirname(fileURLToPath(moduleUrl));

async function decryptJWE(encryptedPayload) {
  try {
    // Create a key store and load your private key
    const keystore = jose.JWK.createKeyStore();
    const pemData = fs.readFileSync(`${modulePath.replace('/middlewares', '')}/id_ukiss_4096.pem`);
    const privateKey = await keystore.add(pemData, 'pem');

    const parsed = await jose.JWE.createDecrypt(privateKey).decrypt(encryptedPayload);

    const decryptedPayload = JSON.parse(parsed.plaintext.toString());

    return decryptedPayload;
  } catch (error) {
    throw new APIError(error.message, StatusCodes.BAD_REQUEST);
  }
}

export const decryptResponse = async (req, _res, next) => {
  try {
    const { TOKEN } = req.body;
    const decryptedPayload = await decryptJWE(TOKEN);
    console.log("🚀 ~ file: decryptor.js:43 ~ decryptResponse ~ decryptedPayload:", decryptedPayload)
    req.body.data = decryptedPayload;
    next();
  } catch (error) {
    console.log("🚀 ~ file: decryptor.js:46 ~ decryptResponse ~ error:", error)
    next(error)
  }
};
