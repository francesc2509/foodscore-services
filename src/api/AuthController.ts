import { Request, Response, Express, Router } from 'express';
import { OnMount } from './interfaces';

class AuthController implements OnMount {
  public router: Router;

  constructor() {
    this.router = Router();
    this.fsOnMount();
  }

  fsOnMount() {
    this.router.get('/login', this.jwt);
    this.router.get('/google', this.google);
    this.router.get('/facebook', this.facebook);
  }

  jwt(req: Request, res: Response) {
    res.send('This is jwt route');
  }

  google(req: Request, res: Response) {
    res.send('This is google route');
  }

  facebook(req: Request, res: Response) {
    res.send('This is facebook route');
  }

  validate(req: Request, res: Response) {
    res.send('This is validate route');
  }
}

export default new AuthController().router;
