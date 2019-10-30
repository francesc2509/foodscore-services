import { Request } from 'express';

import { repository } from './user.repository';
import { map, switchMap } from 'rxjs/operators';
import { Observable, of, ObservableInput } from 'rxjs';
import { User } from '../entities/user.model';
import { NotFound } from '../errors';
import { imageService } from '../commons';
import { UpdateAvatarRequest } from './model';

class UserService {
  constructor() {}

  findOneOrFail(user: User, me: User = undefined): Observable<User> {
    return repository.findOne(user).pipe(
      map((data) => {
        if (data) {
          const result = data;
          console.log(me);
          return <User>{
            avatar: result.avatar,
            email: result.email,
            id: result.id,
            lat: result.lat,
            lng: result.lng,
            name: result.name,
            me: !me || result.id === me.id,
          };
        }
        throw new NotFound();
      }),
    );
  }

  getByEmail(email: string): Observable<User> {
    return repository.findOne({ email }).pipe(
      map((data) => {
        if (data) {
          return <User>{
            avatar: data.avatar,
            email: data.email,
            id: data.id,
            lat: data.lat,
            lng: data.lng,
            name: data.name,
          };
        }
        return data;
      }),
    );
  }

  emailExists(email: string): Observable<boolean> {
    // return (await this.userRepo.findOne({ email })) ? true : false;
    return of(false);
  }

  update(user: User, id: number): Observable<number> {
    return repository.modify(user, { id }).pipe(
      map((result) => {
        return result.affectedRows;
      }),
    );
  }

  updateAvatar(user: UpdateAvatarRequest, id: number): Observable<string> {
    return imageService.saveImage('users', user.avatar).pipe(
      switchMap((avatar) => {
        return this.update({ avatar }, id).pipe(
          map(() => {
            return avatar;
          }),
        );
      }),
    );
  }
}

const service = new UserService();

export { service };
