import * as jwt from 'jsonwebtoken';
import * as request from 'request-promise';

import { OAuth2Client } from 'google-auth-library';

import { Observable, of, from } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';

import { BadRequest, NotFound, Unauthorized } from '../errors';
import { TokenRequest, LoginRequest, RegisterRequest } from './model';
import { imageService } from '../commons';

import { service as userService } from '../users/user.service';
import { repository as userRepository, repository } from '../users/user.repository';
import { User } from '../entities/user.model';

interface JwtPayload {
  id: number;
}

class AuthService {
  constructor() { }

  private createToken(user: any) {
    const data: JwtPayload = {
      id: user.id,
    };
    const expiresIn = '30 minutes';
    const accessToken = jwt.sign(data, 'SECRET_KEY', { expiresIn });

    return {
      expiresIn,
      accessToken,
    };
  }

  register(userDto: RegisterRequest) {
    return imageService.saveImage('users', userDto.avatar).pipe(
      catchError((err) => {
        return of('img/profile.jpg');
      }),
    ).pipe(
      switchMap((filePath) => {
        userDto.avatar = filePath;
        return userRepository.save(userDto);
      }),
    );
  }

  jwt(user: LoginRequest): Observable<any> {
    return userService.findOneOrFail(
      { email: user.email, password: user.password },
    ).pipe(
      map((result) => {
        return this.createToken(result);
      }),
    );
  }

  google(tokenDto: TokenRequest) {
    const client = new OAuth2Client(
      '3493852405-i42aed10i54blfjpt7l42i5rtilkpl0j.apps.googleusercontent.com',
    );
    return from(client.verifyIdToken({
      idToken: tokenDto.token,
      audience: '3493852405-i42aed10i54blfjpt7l42i5rtilkpl0j.apps.googleusercontent.com',
    })).pipe(
      switchMap((ticket) => {
        const payload = ticket.getPayload();
        const email = payload.email;

        return userService.getByEmail(email).pipe(
          switchMap((data) => {
            const lat = tokenDto.lat ? tokenDto.lat : 0;
            const lng = tokenDto.lng ? tokenDto.lng : 0;
            if (!data) {
              return imageService
                .downloadImage('users', payload.picture).pipe(
                  switchMap((avatar) => {
                    const user = <RegisterRequest>{
                      email,
                      avatar,
                      lat,
                      lng,
                      name: payload.name,
                    };

                    return userRepository.save(user).pipe(
                      map((result: User) => {
                        console.log(result);
                        return this.createToken({ id: result.id });
                      }),
                    );
                  }),
                );
            }

            return userService.update({ lat, lng }, data.id).pipe(
              map((affectedRows) => {
                return this.createToken({ id: data.id });
              }),
            );
          }),
        );
      }),
    );
  }

  facebook(tokenDto: TokenRequest): Observable<{expiresIn: string, accessToken: string}> {
    const options = {
      method: 'GET',
      uri: 'https://graph.facebook.com/me',
      qs: {
        access_token: tokenDto.token,
        fields: 'id,name,email',
      },
      json: true,
    };

    return from(request(options)).pipe(
      switchMap((respUser) => {
        return userService.getByEmail(respUser.email).pipe(
          switchMap((user) => {
            const lat = tokenDto.lat || 0;
            const lng = tokenDto.lng || 0;

            if (!user) {
              const optionsImg = {
                method: 'GET',
                uri: 'https://graph.facebook.com/me/picture',
                qs: {
                  access_token: tokenDto.token,
                  type: 'large',
                },
              };

              return of(<any>request(optionsImg)).pipe(
                switchMap((respImg) => {
                  console.log(respImg.url.href);
                  return imageService.downloadImage('users', respImg.url.href);
                }),
              ).pipe(
                switchMap((avatar) => {
                  const newUser = <RegisterRequest> {
                    avatar,
                    lat,
                    lng,
                    email: respUser.email,
                    name: respUser.name,
                  };
                  return repository.save(newUser);
                }),
              ).pipe(
                map((data) => {
                  return this.createToken(data);
                }),
              );
            }

            return userService.update({ lat, lng }, user.id).pipe(
              map((affectedRows) => {
                return this.createToken({ id: user.id });
              }),
            );
          }),
        );
      }),
    );
  }

  validate(token: string) {
    try {
      return jwt.verify(token, 'SECRET_KEY');
    } catch {
      throw new Unauthorized();
    }
  }
}

const service = new AuthService();

export { service };
