export class Forbidden extends Error {
  constructor(message?: string) {
    super(message);
    if (!super.message) {
      super.message = "You don't have write permissions over this ressource";
    }
  }
}
