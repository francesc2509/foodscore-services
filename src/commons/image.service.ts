import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';
import * as path from 'path';
import { Observable, from } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
// import * as download from 'image-downloader';

class ImageService {
  saveImage(dir: string, photo: any, encoding = 'base64'): Observable<string> {
    // const data = photo.split(',')[1] || photo;
    // return new Promise((resolve, reject) => {
    //   const filePath = path.join('img', dir, `${Date.now()}.jpg`);
    //   fs.writeFile(filePath, data, { encoding }, (err) => {
    //     if (err) reject(err);
    //     resolve(filePath);
    //   });
    // });

    if (!photo) {
      throw new Error();
    }

    if (!fs.existsSync('img')) {
      fs.mkdirSync('img');
    }
    if (!fs.existsSync(`img/${dir}`)) {
      fs.mkdirSync(`img/${dir}`);
    }

    let data = photo;
    if (encoding === 'base64' && photo.split) {
      data = photo.split(',')[1] || photo;
    }

    return from(new Promise<string>((resolve, reject) => {
      const filePath = path.join('img', dir, `${Date.now()}.jpg`);
      fs.writeFile(filePath, data, { encoding }, (err) => {
        if (err) {
          return reject(err);
        }
        console.log(filePath);
        resolve(filePath);
      });
      // const file = fs.createWriteStream(filePath);
      // data.pipe(file);
      // file.on('finish', () => {
      //   file.end();  // close() is async, call cb after close completes.
      //   resolve(filePath);
      // });
    }));
  }

  downloadImage(dir: string, url: string): Observable<string> {
    // const filePath = path.join('img', dir, `${Date.now()}.jpg`);
    // await download.image({
    //   url,
    //   dest: filePath,
    // });

    return Observable.create((observer: any) => {
      this.request(url, observer);
    }).pipe(
      switchMap((response: http.IncomingMessage) => {
        // const file = fs.createWriteStream(filePath);
        // response.pipe(file);
        // file.on('finish', () => {
        //   file.end();  // close() is async, call cb after close completes.
        //   return filePath;
        // });
        // console.log(response);
        return Observable.create((observer: any) => {
          const data = <any[]>[];
          response.on('data', (chunk) => {
            data.push(chunk);
          }).on('end', () => {
            const buffer = Buffer.concat(data);
            observer.next(buffer.toString('base64'));
          }).on('error', () => observer.error());
        }).pipe(
          switchMap((data) => {
            return this.saveImage(dir, data);
          }),
        );
      }),
    );
  }

  private request(url: string, observer: any) {
    const redirectCodes = [301, 302];
    https.get(url, (response) => {
      if (redirectCodes.find(code => code === response.statusCode)) {
        return this.request(response.headers['location'], observer);
      }
      observer.next(response);
    }).on('error', (err) => { // Handle errors
      // if (fs.existsSync(filePath)) {
      //   fs.unlinkSync(filePath); // Delete the file async. (But we don't check the result)
      // }
      observer.error(err);
    });
  }
}

const imageService = new ImageService();

export { imageService };
