import * as jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { service as userService } from '../users/user.service';
import { repository as userRepository } from '../users/user.repository';
import { User } from '../entities/user.model';
import { map, catchError, switchMap } from 'rxjs/operators';
import { Observable, of, from } from 'rxjs';
import { BadRequest, NotFound, Unauthorized } from '../errors';
import { TokenRequest, LoginRequest } from './model';
import { imageService } from '../commons';

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

  // facebook(tokenDto: LoginTokenDto) {
  //   const options = {
  //     method: 'GET',
  //     uri: 'https://graph.facebook.com/me',
  //     qs: {
  //       access_token: tokenDto.token,
  //       fields: 'id,name,email',
  //     },
  //     json: true,
  //   };
  //   const respUser = await request(options);

  //   let user: DeepPartial<User> = await this.userService.getUserbyEmail(respUser.email);

  //   if (!user) {
  //     const optionsImg = {
  //       method: 'GET',
  //       uri: 'https://graph.facebook.com/me/picture',
  //       qs: {
  //         access_token: tokenDto.token,
  //         type: 'large',
  //       },
  //     };
  //     const respImg = request(optionsImg);
  //     const avatar = await this.imageService.downloadImage('users', respImg.url);
  //     user = {
  //       email: respUser.email,
  //       name: respUser.name,
  //       avatar,
  //       lat: tokenDto.lat ? tokenDto.lat : 0,
  //       lng: tokenDto.lng ? tokenDto.lng : 0,
  //     };
  //     user = await this.userRepo.save(user);
  //   } else if (tokenDto.lat && tokenDto.lng) {
  //     user.lat = tokenDto.lat;
  //     user.lng = tokenDto.lng;
  //     await this.userRepo.save(user);
  //   }

  //   return this.createToken(user as User);
  // }

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
