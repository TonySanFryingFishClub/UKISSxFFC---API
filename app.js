import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import timeout from 'connect-timeout';
import Logging from './library/logging.js';
import routes from './routes/index.js';
import { notFoundError, genericErrorHandler } from './middlewares/errorHandles.js';
import CONFIG from './config/index.js'

export const createApp = () => {
  const app = express();

  app.use(cors());
  app.use(helmet());

  app.use((req, res, next) => {
    Logging.info(
      `Incoming - Method: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}]`
    );
    res.on('finish', () => {
      Logging.info(
        `Incoming - Method: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}] - Status: [${res.statusCode}]`
      );
    });
    next();
  });

  app.use(express.json());
  app.use(
    express.urlencoded({
      extended: true,
    })
  );

  if (CONFIG.APP.ENV !== 'test') {
    app.use(morgan('dev'));
  }

  app.use(timeout(CONFIG.SERVER.TIMEOUT));

  // API Routes
  app.use(`/api/v1`, routes);

  // Error Middleware
  app.use(genericErrorHandler);
  app.use(notFoundError);

  return app;
};
