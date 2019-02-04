import { Validators } from '../../utils/validators';

export class RegisterRequest {
  name: string;
  avatar: string;
  email: string;
  password: string;
  lat: number;
  lng: number;

  constructor(
    name: string,
    avatar: string,
    email: string,
    password: string,
    lat: number,
    lng: number,
  ) {
    this.name = name;
    this.avatar = avatar;
    this.email = email;
    this.password = password;
    this.lat = lat;
    this.lng = lng;
  }

  isValid(errors: string[] = []) {
    if (!this.name || this.name.trim() === '') {
      errors.push('Name is required');
    }

    if (!Validators.isEmailValid(this.email)) {
      errors.push('E-mail is not valid');
    }

    if (!this.password || this.password.trim() === '') {
      errors.push('Password is required');
    }

    if (!Validators.isLongitudeValid(this.lat)) {
      errors.push('Latitude is not valid');
    }

    if (!Validators.isLongitudeValid(this.lng)) {
      errors.push('Longitude is not valid');
    }

    return errors;
  }
}
