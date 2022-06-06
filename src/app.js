import 'dotenv/config';
import express from 'express';
import * as Sentry from '@sentry/node';
import path from 'path';
import cors from 'cors';
import Youch from 'youch';
import sentryConfig from './config/sentry';
import 'express-async-errors';
/* o express nao captura todos os erros do async e essa importacao precisa
automaticamente ficar antes das rotas, senao nao funciona */
import routes from './routes';

import './database';

class App {
  constructor() {
    this.server = express();

    Sentry.init(sentryConfig);

    this.middlewares();
    this.routes();
    this.exceptionHandler();
  }

  middlewares() {
    this.server.use(Sentry.Handlers.requestHandler());
    this.server.use(cors());
    this.server.use(express.json()); // pra ele poder lidar com json
    this.server.use(
      '/files',
      express.static(path.resolve(__dirname, '..', 'uploads'))
    );
  }

  routes() {
    this.server.use(routes);
    this.server.use(Sentry.Handlers.errorHandler());
  }

  exceptionHandler() {
    this.server.use(async (error, req, res, next) => {
      if (process.env.NODE_ENV === 'development') {
        const errors = await new Youch(error, req).toJSON();
        return res.status(500).json(errors);
      }
      return res
        .status(500)
        .json({ message: 'Aconteceu um erro interno inesperado ' });
    });
  }
}

export default new App().server;
