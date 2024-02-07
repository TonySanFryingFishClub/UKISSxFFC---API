import 'dotenv/config';

const CONFIG = {
  APP: {
    NAME: 'api',
    VERSION: '1.0.0',
    VER: `v1`,
    HOST: process.env.APP_HOST,
    BASE_URL: process.env.API_BASE_URL,
    PORT: process.env.NODE_ENV === 'test' ? 8888 : process.env.PORT || 8080,
    ENV: process.env.NODE_ENV,
  },
  SERVER: {
    TIMEOUT: 180000, // 1m
  },
  LOG: {
    PATH: process.env.LOGGING_DIR || 'logs',
    LEVEL: process.env.LOGGING_LEVEL || 'info',
    MAX_FILES: process.env.LOGGING_MAX_FILES || 5,
  },
  AUTH: {
    SALT_ROUNDS: process.env.SALT_ROUNDS || '11',
    ACCESS_TOKEN_EXPIRE: process.env.ACCESS_TOKEN_DURATION || '300000',
    REFRESH_TOKEN_EXPIRE: process.env.REFRESH_TOKEN_DURATION || '86400000',
    ACCESS_TOKEN_SALT: process.env.ACCESS_TOKEN_SALT || 'JWTSECRET',
    TOKEN_HEADER_KEY: process.env.TOKEN_HEADER_KEY || 'auth_token',
    SECRET: process.env.SECRET || '',
  },
  OTHERS: {
    PROJECT_ID: process.env.PROJECT_ID || '',
    UKISS_API: process.env.UKISS_API || '',
    UKISS_TOKEN: process.env.UKISS_TOKEN || '',
    CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS || '',
    ALCHEMY_ID: process.env.ALCHEMY_ID || '',
    WALLET_KEY: process.env.WALLET_KEY || '',
  },
  DATABASE: {
    MONGO_URL:
      process.env.NODE_ENV === 'production'
        ? `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@apitestnet.bv2i2at.mongodb.net/?retryWrites=true&w=majority`
        : `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
  },
};

export default CONFIG;
