import * as express from 'express';

import { auth } from './api';

class App {
  private express: express.Express;

  constructor() {
    this.express = express();
    this.mountRoutes();
  }

  mountRoutes() {
    this.app.get('/', (req, res) => res.send('tsLint configured!'));
    this.app.use('/auth', auth);
  }

  get app() {
    return this.express;
  }
}

export default new App().app;
