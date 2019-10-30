import { map, switchMap } from 'rxjs/operators';

import { repository } from './restaurant.repository';
import { service as userService } from '../users/user.service';
import { Restaurant, User, Comment } from '../entities';
import { NotFound, Forbidden } from '../errors';
import { Observable } from 'rxjs';
import { UpsertRestaurantRequest } from './model';
import { imageService } from '../commons';

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
          return userService.findOneOrFail({ id: row.creatorId }, me).pipe(
            map((result) => {
              return <Restaurant>{
                id: row.id,
                address: row.address,
                daysOpen: row.daysOpen.split(',').map((day: string) => Number(day)),
                cuisine: row.cuisine.split(','),
                description: row.description,
                stars: row.stars,
                image: row.image,
                lat: row.lat,
                lng: row.lng,
                distance: row.distance,
                name: row.name,
                phone: row.phone,
                mine: !me || me.id === row.creatorId,
                commented: !!row.commentId,
                creator: result,
              };
            }),
          );
        }
        throw new NotFound();
      }),
    );
  }

  createRestaurant(restaurant: UpsertRestaurantRequest, me: User) {
    console.log('asdas');
    return imageService.saveImage('restaurants', restaurant.image).pipe(
      switchMap((filePath) => {
        restaurant.image = filePath;
        return repository.createRestaurant(restaurant).pipe(
          switchMap((result) => {
            console.log(result);
            return this.getById(result.insertId, me);
          }),
        );
      }),
    );
  }

  editRestaurant(restaurant: UpsertRestaurantRequest, id: number, me: User) {
    return this.getById(id, me).pipe(
      switchMap((r) => {
        if (!r.mine) {
          throw new Forbidden();
        }

        if (restaurant.image.indexOf('img/') > -1) {
          restaurant.image = undefined;
        }

        if (restaurant.image) {
          return imageService.saveImage('restaurants', restaurant.image).pipe(
            switchMap((filePath) => {
              restaurant.image = filePath;

              return repository.editRestaurant(restaurant, id).pipe(
                switchMap((result) => {
                  return this.getById(id, me);
                }),
              );
            }),
          );
        }
        return repository.editRestaurant(restaurant, id).pipe(
          switchMap((result) => {
            return this.getById(id, me);
          }),
        );
      }),
    );
  }

  deleteRestaurant(id: number, me: User) {
    return this.getById(id, me).pipe(
      switchMap((r: Restaurant) => {
        if (!r.mine) {
          throw new Forbidden();
        }

        return repository.deleteRestaurant(id).pipe(map(() => { return undefined; }));
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
              id: row.userId,
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

  createComment(comment: any): Observable<Comment> {
    return repository.createComment(comment).pipe(
      switchMap((result: any) => {
        return service.getComments({ 'com.id': result.insertId });
      }),
    ).pipe(
      map((result: Comment[]) => {
        if (!result || result.length < 1) {
          throw new Error();
        }
        return result[0];
      }),
    );
  }
}

const service = new RestaurantService();

export {
  service,
};
