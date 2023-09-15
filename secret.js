import jwt from 'jsonwebtoken';
import CONFIG from './config/index.js';

function main() {
  const token = jwt.sign({
    issuer: 'FryingFishClub',
    username: 'UKiss',
    issuedAt: Date.now(),
  }, CONFIG.AUTH.ACCESS_TOKEN_SALT);
  console.log("🚀 ~ file: secret.js:10 ~ main ~ token:", token)
}

main();