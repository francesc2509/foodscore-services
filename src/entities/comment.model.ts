import { Restaurant } from './restaurant.model';
import { User } from './user.model';

export class Comment {
  id: number;
  stars: number;
  text: string;
  date: Date;
  restaurant: Restaurant;
  user: User;
}
