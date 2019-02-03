import { Request } from 'express';

import { repository } from './user.repository';
import { map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { User } from '../entities/user.model';
import { NotFound } from '../errors';
import { imageService } from '../commons';

class UserService {
  constructor() {}

  findOneOrFail(user: User, me: User = undefined): Observable<User> {
    return repository.findOne(user).pipe(
      map((data) => {
        if (data) {
          const result = data;
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

  updateUserInfo(id: number, user: any): Observable<void> {
    // await this.userRepo.update(id, user);
    return of();
  }

  updatePassword(id: number, pass: any): Observable<void> {
    // await this.userRepo.update(id, pass);
    return of();
  }

  updateAvatar(id: number, avatar: any): Promise<string> {
    avatar.avatar = imageService.saveImage('users', avatar.avatar);
    // await this.userRepo.update(id, avatar);
    return avatar.avatar;
  }
}

const service = new UserService();

export { service };
