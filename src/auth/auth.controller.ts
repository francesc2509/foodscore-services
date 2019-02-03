import { Request, Response, Router } from 'express';
import * as crypto from 'crypto';

import { service as authService } from './auth.service';
import { OnMount } from '../interfaces';
import { BadRequest, Unauthorized } from '../errors';
import { NextFunction } from 'connect';
import { jwtMiddleware } from '../api/middlewares';

class AuthController implements OnMount {
  public router: Router;

  constructor() {
    this.router = Router();
    this.fsOnMount();
  }

  fsOnMount() {
    this.router.post('/login', this.jwt);
    this.router.post('/google', this.google);
    this.router.post('/facebook', this.facebook);
    this.router.get('/validate', [jwtMiddleware, this.validate]);
  }

  // register(req: Request, res: Response) {
  //   try {
  //     const user = authService.registerUser();
  //     // res.status(HttpStatus.CREATED).send(user);
  //   } catch (error) {
  //     // throw new BadRequestException(error.message);
  //     throw new Error();
  //   }
  // }

  jwt(req: Request, res: Response, next: NextFunction) {
    const body = req.body;

    const email = body.email || '';
    let password = body.password || '';

    if (email.trim() === '' || password.trim() === '') {
      throw new BadRequest('Email and password are mandatory');
    }

    password = crypto.createHash('sha256').update(body.password).digest('base64');
    authService.jwt({ email, password }).subscribe(
      data => res.send(data),
      (err) => {
        next(err);
      },
    );
  }

  google(req: Request, res: Response, next: NextFunction) {
    const token = req.body.token || '';
    const lat = req.body.lat;
    const lng = req.body.lng;

    if (!token) {
      throw new BadRequest();
    }

    authService.google({ token, lat, lng }).subscribe(
      data => res.send(data),
      (err) => {
        next(err);
      },
    );
  }

  facebook(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.body.token || '';
      const lat = req.body.lat || 0;
      const lng = req.body.lng || 0;

      if (!token) {
        throw new BadRequest();
      }

      return authService.facebook({ token, lat, lng }).subscribe(
        (data) => {
          res.json(data);
        },
        (err) => {
          next(err);
        },
      );
    } catch (e) {
      throw new Unauthorized('Login failed');
    }
  }

  validate(req: Request, res: Response, next: NextFunction) {
    res.send({ ok: true });
  }
}

const router = new AuthController().router;

export { router as auth };
