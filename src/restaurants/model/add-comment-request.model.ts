import { Validators } from '../../utils/validators';

export class AddCommentRequest {
  text: string;
  stars: number;
  restaurantId: number;
  userId: number;

  constructor(
    text: string,
    stars: number,
    restaurantId: number,
    userId: number,
  ) {
    this.text = text;
    this.stars = stars;
    this.restaurantId = restaurantId;
    this.userId = userId;
  }

  isValid(errors: string[] = []) {
    if (!this.text || this.text.trim() === '') {
      errors.push('Text is required');
    }

    if (this.stars === undefined) {
      errors.push('Rating is required');
    } else if (this.stars < 0 || this.stars > 5) {
      errors.push('Rating must be in the interval [0, 5]');
    }

    if (
      !this.restaurantId
      || isNaN(this.restaurantId)
      || !Number.isInteger(this.restaurantId)
      || this.restaurantId < 1
    ) {
      errors.push('Restaurant Id is not valid');
    }

    return errors;
  }
}
