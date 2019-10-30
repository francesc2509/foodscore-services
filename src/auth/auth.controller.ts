import { Request, Response, Router } from 'express';
import * as crypto from 'crypto';

import { service as authService } from './auth.service';
import { OnMount } from '../interfaces';
import { BadRequest, Unauthorized } from '../errors';
import { NextFunction } from 'connect';
import { jwtMiddleware } from '../api/middlewares';
import { RegisterRequest } from './model';
import { Validators } from '../utils/validators';

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
    this.router.post('/register', this.register);
    this.router.get('/validate', [jwtMiddleware, this.validate]);
  }

  register(req: Request, res: Response, next: NextFunction) {
    const name = req.body.name || '';
    const avatar = req.body.avatar;
    const email = req.body.email || '';
    const password = req.body.password || '';
    const lat = Number(req.body.lat);
    const lng = Number(req.body.lng);

    const newUser = new RegisterRequest(name, avatar, email, password, lat, lng);

    const errors = newUser.isValid();
    if (errors && errors.length > 0) {
      throw new BadRequest(errors.join(', '));
    }
    newUser.password = crypto.createHash('sha256').update(password).digest('base64');

    authService.register(newUser).subscribe(
      (user) => {
        res.json({ user });
      },
      err => next(err),
    );
  }

  jwt(req: Request, res: Response, next: NextFunction) {
    const body = req.body;

    const email = body.email || '';
    let password = body.password || '';
    const lat = Number(body.lat);
    const lng = Number(body.lng);

    const errors = [];

    if (email.trim() === '' || password.trim() === '') {
      errors.push('Email and password are mandatory');
    }

    if (!Validators.isLatitudeValid(lat)) {
      errors.push('Latitude is not valid');
    }

    if (!Validators.isLongitudeValid(lng)) {
      errors.push('Longitude is not valid');
    }

    if (errors.length > 0) {
      throw new BadRequest(errors.join(','));
    }

    password = crypto.createHash('sha256').update(body.password).digest('base64');
    authService.jwt({ email, password, lat, lng }).subscribe(
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
        console.log(err);
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
