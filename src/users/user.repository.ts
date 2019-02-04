import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { DB } from '../core/db/db';
import { User } from '../entities/user.model';

class UserRepository extends DB {
  findOne(params: User) {
    return super.select('SELECT * FROM `user`', params).pipe(
      map((result) => {
        return result && result.length > 0 ? result[0] : undefined;
      }),
    );
  }

  save(user: User): Observable<any> {
    user.id = undefined;
    return super.insert('user', user).pipe(
      switchMap((result) => {
        return this.findOne({ id: result.insertId });
      }),
    );
  }

  modify(params: any, filters: any) {
    return super.update('user', params, filters);
  }
}

const repository = new UserRepository();

export { repository };
