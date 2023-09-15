import crypto from 'crypto';
import axios from 'axios';
import CONFIG from '../config/index.js';
import fs from 'fs';
import { OK } from 'http-status-codes';

function generateRandomKeyAndIV() {
  const aesKey = crypto.randomBytes(32); // 256 bits (32 bytes) for AES-256
  const iv = crypto.randomBytes(16); // 128 bits (16 bytes) for IV

  return { aesKey, iv };
}

// Function to encrypt data using AES-256-CBC and base64 encoding
function encryptData(data, aesKey, iv) {
  const cipher = crypto.createCipheriv('aes-256-cbc', aesKey, iv);
  let encryptedData = cipher.update(data, 'utf8', 'base64');
  encryptedData += cipher.final('base64');
  return encryptedData;
}

export async function handleMintRequest(req, res, next) {
  try {
    const { serial, requestId } = req.body;
    console.log("🚀 ~ file: encryption.js:23 ~ handleMintRequest ~ serial, requestId:", serial, requestId)
    // Step 1: Generate random AES key and IV
    const { aesKey, iv } = generateRandomKeyAndIV();
    console.log("🚀 ~ file: encryption.js:26 ~ handleMintRequest ~ aesKey, iv:", aesKey, iv)

    // Step 2: Load UKISS's public key
    const publicKey = fs.readFileSync('public-from-ukiss.pem', 'utf8');
    console.log("🚀 ~ file: encryption.js:30 ~ handleMintRequest ~ publicKey:", publicKey)

    // Step 3: Encrypt the AES key using UKISS's public key
    const encryptedAesKey = crypto.publicEncrypt(
      {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_PADDING,
      },
      aesKey
    );

    const tokenPayload = {
      PAYLOAD: {
        SERIAL_NO: serial,
        RET_MESSAGE: requestId, // Optional
      },
    };

    const tokenPayloadJson = JSON.stringify(tokenPayload);

    const encryptedTokenPayload = encryptData(tokenPayloadJson, aesKey, iv);

    const projectId = CONFIG.OTHERS.PROJECT_ID;

    const requestPayload = {
      PROJECT_ID: projectId,
      ENCRYPTED_KEY: {
        CIPHERTEXT: encryptedAesKey.toString('base64'),
        IV: iv.toString('base64'),
      },
      TOKEN: encryptedTokenPayload,
    };

    const response = await axios.post(CONFIG.OTHERS.UKISS_API, requestPayload, {
      headers: {
        'Content-Type': 'application/json',
        ExternalAPIBearerToken: CONFIG.OTHERS.UKISS_TOKEN,
      },
    });
    console.log('🚀 ~ file: index.js:114 ~ handleMintRequest ~ response:', response.data);

    res.status(OK).json(apiResponse({
      message: 'Success',
    }));
  } catch (error) {
    console.log("🚀 ~ file: encryption.js:79 ~ handleMintRequest ~ error:", error)
    next(error);
  }
}
