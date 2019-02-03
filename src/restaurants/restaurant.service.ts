import { map, switchMap } from 'rxjs/operators';

import { repository } from './restaurant.repository';
import { service as userService } from '../users/user.service';
import { Restaurant, User, Comment } from '../entities';
import { NotFound } from '../errors';
import { Observable } from 'rxjs';

class RestaurantService {
  constructor() { }

  get(me: User, params: any = undefined) {
    return repository.get(me, params).pipe(
      map((data) => {
        return data.map((row) => {

          return <Restaurant>{
            id: row.id,
            address: row.address,
            daysOpen: row.daysOpen.split(','),
            cuisine: row.cuisine,
            description: row.description,
            stars: row.stars,
            image: row.image,
            lat: row.lat,
            lng: row.lng,
            distance: row.distance,
            name: row.name,
            phone: row.phone,
            mine: me.id === row.creatorId,
          };
        });
      }),
    );
  }

  getById(id: number, me: User) {
    return repository.findOneOrFail({ 'res.id': id }, me).pipe(
      switchMap((row) => {
        if (row) {
          console.log(row);
          return userService.findOneOrFail({ id: row.creatorId }).pipe(
            switchMap((result) => {
              return this.getComments({ restaurantId: id, userId: me.id }).pipe(
                map((comments) => {
                  console.log(comments);
                  return <Restaurant>{
                    id: row.id,
                    address: row.address,
                    daysOpen: row.daysOpen.split(','),
                    cuisine: row.cuisine,
                    description: row.description,
                    stars: row.stars,
                    image: row.image,
                    lat: row.lat,
                    lng: row.lng,
                    distance: row.distance,
                    name: row.name,
                    phone: row.phone,
                    mine: me.id === row.creatorId,
                    commented: (comments && comments.length > 0),
                    creator: result,
                  };
                }),
              );
            }),
          );
        }
        throw new NotFound();
      }),
    );
  }

  getComments(params: any = undefined): Observable<Comment[]> {
    return repository.getComments(params).pipe(
      map((data) => {
        return data.map((row) => {
          return <Comment> {
            id: row.id,
            user: <User>{
              avatar: row.avatar,
              name: row.name,
              email: row.email,
              lat: row.lat,
              lng: row.lng,
            },
            date: row.date,
            stars: row.stars,
            text: row.text,
          };
        });
      }),
    );
  }
}

const service = new RestaurantService();

export {
  service,
};
