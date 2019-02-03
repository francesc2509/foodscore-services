import { DB } from '../core/db/db';
import { Observable } from 'rxjs';
import { User } from '../entities/user.model';
import { map } from 'rxjs/operators';

class RestaurantRepository extends DB {
  get(me: User, params = {}): Observable<any[]> {
    const query = `SELECT res.*,
      haversine(res.lat, res.lng, ${me.lat}, ${me.lng}) as distance
      FROM \`restaurant\` res`;

    return super.select(query, params);
  }

  findOneOrFail(params: any, me: User): Observable<any> {
    const query = `SELECT res.*, com.id as commentId,
      haversine(res.lat, res.lng, ${me.lat}, ${me.lng}) as distance
      FROM \`restaurant\` res
      LEFT JOIN comment com ON com.userId = ${me.id}`;

    return super.select(query, params).pipe(
      map((result) => {
        return !result || result.length !== 1 ? undefined : result[0];
      }),
    );
  }

  getComments(params: any = {}): Observable<any[]> {
    const query = `SELECT com.*,
        usr.id as userId,
        usr.name,
        usr.avatar,
        usr.email,
        usr.lat,
        usr.lng
      FROM \`comment\` com
      LEFT JOIN user usr ON com.userId = usr.id`;

    return super.select(query, params);
  }

  createComment(comment: any): Observable<any> {
    return super.insert('comment', comment);
  }
}

const repository = new RestaurantRepository();
export { repository };
