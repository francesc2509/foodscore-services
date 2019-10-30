import { Validators } from '../../utils/validators';

export class UpsertRestaurantRequest {
  name: string;
  description: string;
  cuisine: string;
  phone: string;
  daysOpen: string;
  creatorId: number;
  lat: number;
  lng: number;
  address: string;
  image: string;
  stars: number;

  constructor(
    name: string,
    description: string,
    cuisine: string[],
    phone: string,
    daysOpen: string[],
    creatorId: number,
    lat: number,
    lng: number,
    address: string,
    image: string,
  ) {
    this.name = name || '';
    this.description = description || '';
    this.cuisine = cuisine ? cuisine.map(c => c.trim()).join(',') : '';
    this.phone = phone || '';
    this.daysOpen = daysOpen ? daysOpen.map(day => day.trim()).join(',') : '';
    this.creatorId = Number(creatorId);
    this.lat = Number(lat);
    this.lng = Number(lng);
    this.address = address || '';
    this.image = image || '';
    this.stars = 0;
  }

  isValid(errors: string[] = [], newRest: boolean = true) {
    if (!Validators.hasValue(this.description) || this.name.length < 5) {
      errors.push('Name must have 5 characters at least');
    }

    if (!Validators.hasValue(this.description)) {
      errors.push('Description is required');
    }

    if (!Validators.hasValue(this.cuisine)) {
      errors.push('Cuisine is required');
    }

    if (!Validators.hasValue(this.daysOpen)) {
      errors.push('A day must be selected at least');
    }

    if (!Validators.isLatitudeValid(this.lat)) {
      errors.push('Latitude is not valid');
    }

    if (!Validators.isLongitudeValid(this.lng)) {
      errors.push('Longitude is not valid');
    }

    if (!Validators.hasValue(this.address)) {
      errors.push('Address is required');
    }

    if (newRest && !Validators.hasValue(this.image)) {
      errors.push('Image is required');
    }

    if (!Validators.hasValue(this.phone)) {
      errors.push('Phone is required');
    } else if (!Validators.isPhoneValid(this.phone)) {
      errors.push('Phone is not valid');
    }

    return errors;
  }
}
