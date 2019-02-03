import * as jwt from 'jsonwebtoken';
import * as request from 'request-promise';

import { OAuth2Client } from 'google-auth-library';

import { Observable, of, from } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';

import { BadRequest, NotFound, Unauthorized } from '../errors';
import { TokenRequest, LoginRequest } from './model';
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

  // register(userDto: RegisterUserDto) {
  //   userDto.avatar = await this.imageService.saveImage('users', userDto.avatar);
  //   await this.userRepo.insert(userDto);
  //   return userDto;
  // }

  jwt(user: LoginRequest): Observable<any> {
    return userService.findOneOrFail(
      { email: user.email, password: user.password },
    ).pipe(
      map((result) => {
        console.log('fsdf');
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
            if (!data) {
              return imageService
                .downloadImage('users', payload.picture).pipe(
                  switchMap((avatar) => {
                    const user = {
                      email,
                      avatar,
                      name: payload.name,
                      lat: tokenDto.lat ? tokenDto.lat : 0,
                      lng: tokenDto.lng ? tokenDto.lng : 0,
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
            return of(this.createToken({ id: data.id }));
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
                  const newUser = <User> {
                    avatar,
                    email: respUser.email,
                    name: respUser.name,
                    lat: tokenDto.lat || 0,
                    lng: tokenDto.lng || 0,
                  };
                  return repository.save(newUser);
                }),
              ).pipe(
                map((data) => {
                  return this.createToken(data);
                }),
              );
            }

            // user.lat = tokenDto.lat;
            // user.lng = tokenDto.lng;
            // this.userRepo.save(user);

            // return this.createToken(newUser as User);
            return of(this.createToken(user));
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
