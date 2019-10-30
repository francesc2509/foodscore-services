import { DB } from '../core/db/db';
import { Observable } from 'rxjs';
import { User } from '../entities/user.model';
import { map } from 'rxjs/operators';
import { UpsertRestaurantRequest } from './model';

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
      LEFT JOIN comment com ON res.id = COM.restaurantId AND com.userId = ${me.id}`;

    return super.select(query, params).pipe(
      map((result) => {
        return !result || result.length !== 1 ? undefined : result[0];
      }),
    );
  }

  createRestaurant(restaurant: UpsertRestaurantRequest): Observable<any> {
    return super.insert('restaurant', restaurant);
  }

  editRestaurant(restaurant: UpsertRestaurantRequest, id: number): Observable<any> {
    return super.update('restaurant', restaurant, { id });
  }

  deleteRestaurant(id: number): Observable<any> {
    return super.delete('restaurant', { id });
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
