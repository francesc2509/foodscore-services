import { Request, Response, Router } from 'express';
import { OnMount } from '../interfaces';
import { service }  from './restaurant.service';
import { jwtMiddleware } from '../api/middlewares';
import { NextFunction } from 'connect';
import { BadRequest } from '../errors';

class RestaurantController implements OnMount {
  public router: Router;

  constructor() {
    this.router = Router();
    this.fsOnMount();
  }

  fsOnMount() {
    this.router.use(jwtMiddleware);
    this.router.get('/', this.getAll);
    this.router.get('/mine', this.getMine);
    this.router.get('/user/:id', this.getByUser);
    this.router.get('/:id', this.getById);
    this.router.get('/:id/comments', this.getComments);
  }

  getAll(req: Request, res: Response, next: NextFunction) {
    return service.get(req.user).subscribe(
      (restaurants) => {
        const r = { restaurants };
        res.json(r);
      },
      err => next(err),
    );
  }

  getMine(req: Request, res: Response, next: NextFunction) {
    return service.get(req.user, { creatorId: req.user.id }).subscribe(
      restaurants => res.json({ restaurants }),
      err => next(err),
    );
  }

  getByUser(req: Request, res: Response, next: NextFunction) {
    const id = Number(req.params.id);
    if (!id || isNaN(id) || !Number.isInteger(id) || id < 1) {
      throw new BadRequest();
    }

    return service.get(req.user, { creatorId: id }).subscribe(
      restaurants => res.json({ restaurants }),
      err => next(err),
    );
  }

  getById(req: Request, res: Response, next: NextFunction) {
    const id = Number(req.params.id);

    if (!id || isNaN(id) || !Number.isInteger(id) || id < 1) {
      throw new BadRequest();
    }

    return service.getById(id, req.user).subscribe(
      (restaurant) => {
        res.json({ restaurant });
      },
      (err) => {
        console.log(err);
        res.send(err);
      },
    );
  }

  getComments(req: Request, res: Response, next: NextFunction) {
    const id = Number(req.params.id);

    if (!id || isNaN(id) || !Number.isInteger(id) || id < 1) {
      throw new BadRequest();
    }

    return service.getComments({ restaurantId: id }).subscribe(
      comments => res.json({ comments }),
      err => next(err),
    );
  }
}

const router = new RestaurantController().router;
export { router as restaurant };
