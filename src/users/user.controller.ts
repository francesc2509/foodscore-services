import * as crypto from 'crypto';

import { Request, Response, Router } from 'express';

import { OnMount } from '../interfaces';
import { service } from './user.service';
import { jwtMiddleware } from '../api/middlewares';
import { NextFunction } from 'connect';
import { BadRequest } from '../errors';
import { UpdateInfoRequest, UpdatePasswordRequest, UpdateAvatarRequest } from './model';

class UserController implements OnMount {
  public router: Router;

  constructor() {
    this.router = Router();

    this.fsOnMount();
  }

  fsOnMount() {
    this.router.use(jwtMiddleware);
    this.router.put('/me', this.updateInfo);
    this.router.put('/me/password', this.updatePassword);
    this.router.put('/me/avatar', this.updateAvatar);
    this.router.get('/me', this.getMe);
    this.router.get('/:id', this.getUser);
  }

  getMe(req: Request, res: Response, next: NextFunction) {
    res.json({ user: req.user });
  }

  getUser(req: Request, res: Response, next: NextFunction) {
    const id = Number(req.params.id);
    if (!id || isNaN(id) || !Number.isInteger(id) || id < 1) {
      throw new BadRequest();
    }

    return service.findOneOrFail({ id }, req.user).subscribe(
      user => res.json({ user }),
      err => next(err),
    );
  }

  updateInfo(req: Request, res: Response, next: NextFunction) {
    const name = req.body.name || '';
    const email = req.body.email || '';

    const info = new UpdateInfoRequest(name, email);

    const errors = info.isValid();
    if (errors && errors.length > 0) {
      throw new BadRequest(errors.join(', '));
    }

    service.update(info, req.user.id).subscribe(
      () => res.json({ ok: true }),
      err => next(err),
    );
  }

  updatePassword(req: Request, res: Response, next: NextFunction) {
    const password = req.body.password || '';

    const info = new UpdatePasswordRequest(password);
    const errors = info.isValid();
    if (errors && errors.length > 0) {
      throw new BadRequest(errors.join(', '));
    }

    info.password = crypto.createHash('sha256').update(password).digest('base64');
    service.update(info, req.user.id).subscribe(
      () => res.json({ ok: true }),
      err => next(err),
    );
  }

  updateAvatar(req: Request, res: Response, next: NextFunction) {
    const avatar = req.body.avatar || '';

    const info = new UpdateAvatarRequest(avatar);
    const errors = info.isValid();
    if (errors && errors.length > 0) {
      throw new BadRequest(errors.join(', '));
    }

    service.updateAvatar(info, req.user.id).subscribe(
      (avatar: string) => res.json({ avatar }),
      (err: Error) => next(err),
    );
  }
}

const user = new UserController().router;

export { user };
