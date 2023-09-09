import mongoose from 'mongoose';

import { createApp } from './app.js';
import { startServer } from './server.js';
import Logging from './library/logging.js';
import CONFIG from './config/index.js';

if (process.env.NODE_ENV !== 'test') {
  const app = createApp();
  mongoose.set('strictQuery', false);
  mongoose
    .connect(CONFIG.DATABASE.MONGO_URL, {
      retryWrites: true,
      w: 'majority',
    })
    .then(() => {
      Logging.info('Connected to the Mongo database!');
      startServer(app);
    })
    .catch((err) => {
      Logging.error('Unable to connect: ');
      Logging.error(err);
    });
}