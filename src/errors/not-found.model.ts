export class NotFound extends Error {
  constructor() {
    super();
    if (!super.message) {
      super.message = 'Requested ressource was not found';
    }
  }
}
