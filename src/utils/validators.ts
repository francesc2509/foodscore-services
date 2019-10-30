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

  static hasValue(value: any) {

    if (!value) {
      return false;
    }

    switch (true) {
      case typeof value === 'string':
        return value.trim() !== '';
      case value instanceof Array:
        return value.length > 0;
    }
    return true;
  }

  static isPhoneValid(phone: string) {
    return /^((0|\+)?[0-9]{2})?[0-9]{9}$/.test(phone);
  }
}
