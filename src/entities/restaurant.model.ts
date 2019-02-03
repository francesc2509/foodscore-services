import { User } from './user.model';

export interface Restaurant {
  id: number;
  name: string;
  description: string;
  daysOpen: string[];
  phone: string;
  image: string;
  address: string;
  cuisine: string[];
  stars: number;
  lat: number;
  lng: number;
  distance: number;
  mine: boolean;
  commented?: boolean;
  creator: User;
  // comments: Comment[];
}
