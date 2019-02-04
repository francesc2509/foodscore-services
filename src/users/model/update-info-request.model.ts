import { Validators } from '../../utils/validators';

export class UpdateInfoRequest {
  name: string;
  email: string;

  constructor(
    name: string,
    email: string,
  ) {
    this.name = name;
    this.email = email;
  }

  isValid(errors: string[] = []) {
    if (!this.name || this.name.trim() === '') {
      errors.push('Name is required');
    }

    if (!Validators.isEmailValid(this.email)) {
      errors.push('E-mail is not valid');
    }
    return errors;
  }
}
