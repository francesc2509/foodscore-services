import * as fs from 'fs';
import * as https from 'https';
import * as path from 'path';
import { Observable } from 'rxjs';
// import * as download from 'image-downloader';

class ImageService {
  saveImage(dir: string, photo: string): Promise<string> {
    const data = photo.split(',')[1] || photo;
    return new Promise((resolve, reject) => {
      const filePath = path.join('img', dir, `${Date.now()}.jpg`);
      fs.writeFile(filePath, data, { encoding: 'base64' }, (err) => {
        if (err) reject(err);
        resolve(filePath);
      });
    });
  }

  downloadImage(dir: string, url: string): Observable<string> {
    const filePath = path.join('img', dir, `${Date.now()}.jpg`);
    // await download.image({
    //   url,
    //   dest: filePath,
    // });
    if (!fs.existsSync('img')) {
      fs.mkdirSync('img');
    }

    return Observable.create((observer: any) => {
      if (!fs.existsSync('img/users')) {
        fs.mkdirSync('img/users');
      }

      https.get(url, (response) => {
        const file = fs.createWriteStream(filePath);

        response.pipe(file);
        file.on('finish', () => {
          file.end();  // close() is async, call cb after close completes.
          observer.next(filePath);
        });
      }).on('error', (err) => { // Handle errors
        fs.unlinkSync(filePath); // Delete the file async. (But we don't check the result)
        observer.error(err);
      });
    });
  }
}

const imageService = new ImageService();

export { imageService };
