import { Request, Response, Router } from 'express';
import { OnMount } from '../interfaces';
import { service } from './user.service';
import { jwtMiddleware } from '../api/middlewares';
import { NextFunction } from 'connect';
import { BadRequest } from '../errors';

class UserController implements OnMount {
  public router: Router;

  constructor() {
    this.router = Router();

    this.fsOnMount();
  }

  fsOnMount() {
    this.router.use(jwtMiddleware);
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
}

const user = new UserController().router;

export { user };
