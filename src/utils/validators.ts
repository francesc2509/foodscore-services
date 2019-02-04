import * as emailValidator from 'email-validator';

export class Validators {
  static isLatitudeValid = (lat: number) => {
    return !isNaN(lat) && (lat >= -90 && lat <= 90);
  }

  static isLongitudeValid = (lng: number) => {
    return !isNaN(lng) && (lng >= -180 && lng <= 180);
  }

  static isEmailValid = (email: string) => {
    return emailValidator.validate(email);
  }
}
