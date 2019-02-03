import { Response, Request, NextFunction } from 'express';

import { service as userService } from '../../users/user.service';
import { service as authService } from '../../auth/auth.service';
import { NotFound } from '../../errors';

export const jwtMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Valida el token
  const token = `${req.headers['authorization'] || ''}`.replace(/^Bearer\s/i, '');
  console.log(token);
  if (!token) {
    throw new NotFound();
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
