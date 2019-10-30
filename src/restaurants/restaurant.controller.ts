import { Request, Response, Router } from 'express';
import { OnMount } from '../interfaces';
import { service }  from './restaurant.service';
import { jwtMiddleware } from '../api/middlewares';
import { NextFunction } from 'connect';
import { BadRequest, NotFound } from '../errors';
import { Comment } from '../entities';
import { AddCommentRequest, UpsertRestaurantRequest } from './model';

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

    this.router.post('/', this.createRestaurant);
    this.router.post('/:id/comments', this.createComment);

    this.router.put('/:id', this.editRestaurant);
    this.router.delete('/:id', this.deleteRestaurant);
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
        next(err);
      },
    );
  }

  createRestaurant(req: Request, res: Response, next: NextFunction) {
    const rest = new UpsertRestaurantRequest(
      req.body.name,
      req.body.description,
      req.body.cuisine,
      req.body.phone,
      req.body.daysOpen,
      req.user.id,
      req.body.lat,
      req.body.lng,
      req.body.address,
      req.body.image,
    );

    const errors = rest.isValid();
    if (errors && errors.length > 0) {
      throw new BadRequest(errors.join(', '));
    }

    return service.createRestaurant(rest, req.user).subscribe(
      restaurant => res.json({ restaurant }),
      err => next(err),
    );
  }

  editRestaurant(req: Request, res: Response, next: NextFunction) {
    console.log('dgkfkgkfdkñgkfdñgñkfk');
    const id = Number(req.params.id);
    if (!id || isNaN(id) || !Number.isInteger(id) || id < 1) {
      throw new BadRequest();
    }

    const rest = new UpsertRestaurantRequest(
      req.body.name,
      req.body.description,
      req.body.cuisine,
      req.body.phone,
      req.body.daysOpen,
      req.user.id,
      req.body.lat,
      req.body.lng,
      req.body.address,
      req.body.image,
    );

    const errors = rest.isValid([], false);
    if (errors && errors.length > 0) {
      throw new BadRequest(errors.join(', '));
    }

    return service.editRestaurant(rest, id, req.user).subscribe(
      restaurant => res.json(restaurant),
      err => next(err),
    );
  }

  deleteRestaurant(req: Request, res: Response, next: NextFunction) {
    const id = Number(req.params.id);

    if (!id || isNaN(id) || !Number.isInteger(id) || id < 1) {
      throw new BadRequest();
    }

    return service.deleteRestaurant(id, req.user).subscribe(
      () => res.json({ id }),
      err => next(err),
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

  createComment(req: Request, res: Response, next: NextFunction) {
    const text = <string>req.body.text || '';
    const stars = Number(req.body.stars);
    const restaurantId = Number(req.params.id);

    const comment = new AddCommentRequest(text, stars, restaurantId, req.user.id);
    const errors = comment.isValid();
    if (errors.length > 0) {
      throw new BadRequest(errors.join(', '));
    }

    service.createComment(
      comment,
    ).subscribe(
      comment => res.json({ comment }),
      (err) => {
        next(err);
      },
    );
  }
}

const router = new RestaurantController().router;
export { router as restaurant };
