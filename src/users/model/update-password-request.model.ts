import { Validators } from '../../utils/validators';

export class UpdatePasswordRequest {
  password: string;

  constructor(
    password: string,
  ) {
    this.password = password;
  }

  isValid(errors: string[] = []) {
    if (!this.password || this.password.trim() === '') {
      errors.push('Name is required');
    }
    return errors;
  }
}
