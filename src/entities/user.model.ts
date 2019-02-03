import { Restaurant } from './restaurant.model';

export interface User {
  id?: number;
  name?: string;
  email?: string;
  password?: string;
  avatar?: string;
  lat?: number;
  lng?: number;
  restCreated?: Restaurant[];
  comments?: Comment[];
}
