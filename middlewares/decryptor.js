import crypto from 'crypto';
import fs from 'fs';

// Function to decrypt data using private key
function decryptData(data, privateKeyPath) {
  const privateKey = fs.readFileSync(privateKeyPath, 'utf8'); // Replace with the actual path to your private key file
  const decryptedData = crypto.privateDecrypt(
    {
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_PADDING,
    },
    Buffer.from(data, 'base64')
  );
  return decryptedData.toString('utf8');
}

export const decryptResponse = (req, _res, _next) => {
  try {
    const { ENCRYPTED_KEY, TOKEN } = req.body;
    const decryptedAesKey = decryptData(ENCRYPTED_KEY?.CIPHERTEXT, 'id_ukiss_4096.pub.pem');
    const iv = Buffer.from(ENCRYPTED_KEY?.IV, 'base64');
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      Buffer.from(decryptedAesKey, 'base64'),
      iv
    );
    const decryptedTokenPayload = decipher.update(TOKEN, 'base64', 'utf8') + decipher.final('utf8');

    console.log('Decrypted Token Payload:', decryptedTokenPayload);
    req.body.data = JSON.parse(decryptedTokenPayload);
    next();
  } catch (error) {
    console.log("🚀 ~ file: decryptor.js:33 ~ decryptResponse ~ error:", error)
    next(error);
  }
};
