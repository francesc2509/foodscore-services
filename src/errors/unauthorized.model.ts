export class Unauthorized extends Error {
  constructor(message?: string) {
    super(message);
    if (!super.message) {
      super.message = 'You are not authorized to request this ressource';
    }
  }
}
