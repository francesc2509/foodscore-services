import { Validators } from '../../utils/validators';

export class UpdateAvatarRequest {
  avatar: string;

  constructor(
    avatar: string,
  ) {
    this.avatar = avatar;
  }

  isValid(errors: string[] = []) {
    if (!this.avatar || this.avatar.trim() === '') {
      errors.push('Name is required');
    }
    return errors;
  }
}
