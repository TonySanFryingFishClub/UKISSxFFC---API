import { createServer } from 'http';
import moment from 'moment';

import { exitLog } from './helpers/index.js';
import CONFIG from './config/index.js';

export const startServer = (app) => {
  const httpServer = createServer(app);

  process
    .on('SIGINT', () => exitLog(null, 'SIGINT'))
    .on('SIGQUIT', () => exitLog(null, 'SIGQUIT'))
    .on('SIGTERM', () => exitLog(null, 'SIGTERM'))
    .on('uncaughtException', (err) => exitLog(err, 'uncaughtException'))
    .on('beforeExit', () => exitLog(null, 'beforeExit'))
    .on('exit', () => exitLog(null, 'exit'));

  return httpServer.listen({ port: CONFIG.APP.PORT }, () => {
    process.stdout.write(`⚙️  Application Environment: ${CONFIG.APP.ENV}\n`);
    process.stdout.write(`⏱  Started on: ${moment().format('DD-MM-YYYY hh:mm')}\n`);
    process.stdout.write(`🚀 FFCxUKISS Server started at Port:${CONFIG.APP.PORT}\n`);
  });
};