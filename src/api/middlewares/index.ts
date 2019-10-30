import { Response, Request, NextFunction } from 'express';

import { service as userService } from '../../users/user.service';
import { service as authService } from '../../auth/auth.service';
import { NotFound, Unauthorized } from '../../errors';

export const jwtMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Valida el token
  const token = `${req.headers['authorization'] || ''}`.replace(/^Bearer\s/i, '');
  if (!token) {
    throw new Unauthorized();
  }

  const result = <any>authService.validate(token);
  userService.findOneOrFail({ id: result.id }).subscribe(
    (user) => {
      req.user = user;
      next();
    },
    (err) => { next(err); },
  );
};

export const notFoundMiddleware = (req: Request, res: Response, next: NextFunction) => {
  next(new NotFound());
};
