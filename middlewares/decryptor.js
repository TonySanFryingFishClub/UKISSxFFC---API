import crypto from 'crypto';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import { METHOD_FAILURE } from 'http-status-codes';

import APIError from "../helpers/apiError.js";

const moduleUrl = import.meta.url;
const modulePath = dirname(fileURLToPath(moduleUrl));

// Function to decrypt data using private key
function decryptData(data, privateKeyPath) {
  try {
    const keyPath = path.join(modulePath, '..', privateKeyPath);
    const privateKey = fs.readFileSync(keyPath, 'utf8');
    const decryptedData = crypto.publicDecrypt(
      {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_PADDING,
      },
      Buffer.from(data, 'base64')
    );
    return decryptedData.toString('utf8');
  } catch (error) {
    throw new APIError(error.reason || 'Error decrypting data', METHOD_FAILURE);
  }
}

export const decryptResponse = (req, _res, next) => {
  try {
    const { ENCRYPTED_KEY, TOKEN } = req.body;
    const decryptedAesKey = decryptData(ENCRYPTED_KEY?.CIPHERTEXT, 'id_ukiss_4096.pub.pem');
    console.log("🚀 ~ file: decryptor.js:21 ~ decryptResponse ~ decryptedAesKey:", decryptedAesKey)
    const iv = Buffer.from(ENCRYPTED_KEY?.IV, 'base64');
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      Buffer.from(decryptedAesKey, 'base64'),
      iv
    );
    const decryptedTokenPayload = decipher.update(TOKEN, 'base64', 'utf8') + decipher.final('utf8');
    console.log("🚀 ~ file: decryptor.js:29 ~ decryptResponse ~ decryptedTokenPayload:", decryptedTokenPayload)
    req.body.data = JSON.parse(decryptedTokenPayload);
    next();
  } catch (error) {
    next(error);
  }
};
