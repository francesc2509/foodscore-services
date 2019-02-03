
import * as express from 'express';
import { NextFunction } from 'connect';

declare global {
  namespace Express {
    export interface Response {
      ok(): (data: any) => void;
      badRequest(): (err: any) => void;
      unauthorized(): (err: any) => void;
      internalServerError(): (err: any) => void;
    }
  }
}
