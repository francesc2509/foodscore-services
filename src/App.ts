import * as express from 'express';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';

import { auth } from './auth/auth.controller';
import { restaurant } from './restaurants/restaurant.controller';
import { user } from './users/user.controller';

import { BadRequest, NotFound, Unauthorized } from './errors';

class App {
  private express: express.Express;

  constructor() {
    this.express = express();
    console.log(`${__dirname}`);
    this.express.set('host', 'localhost');
    this.express.set('port', 3000);
    this.express.use(cors({ credentials: true, origin: true }));
    this.express.use(express.static(`${__dirname}/..`));
    this.express.use(bodyParser.json());
    this.mountRoutes();
    this.express.use(this.errorHandler);
  }

  mountRoutes() {
    this.app.get('/', (req, res) => res.send('Hello World!'));
    this.app.use('/auth', auth);
    this.app.use('/restaurants', restaurant);
    this.app.use('/users', user);
  }

  get app() {
    return this.express;
  }

  private errorHandler(
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) {

    if (res.headersSent) {
      return next(err);
    }

    let statusCode = 500;
    switch (true) {
      case err instanceof BadRequest:
        statusCode = 400;
        break;
      case err instanceof NotFound:
        statusCode = 404;

      case err instanceof Unauthorized:
        statusCode = 404;
        break;
    }

    res.status(statusCode);
    res.send({ error: err.message });
  }
}

export default new App().app;
