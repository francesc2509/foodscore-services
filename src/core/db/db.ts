import { connection } from './db.config';

import { Observable, of } from 'rxjs';

class DB {
  exec(query: any, params: any[]|any = []): Observable<any> {
    return Observable.create((observer: any) => {
      connection.query(query, params, (err, result) => {
        if (err) {
          console.log(err);
          observer.error(err);
          return;
        }

        observer.next(result);
        return;
      });
    });
  }

  select(query: string, params: any = undefined) {
    let where = '';
    const values = <any[]>[];
    if (params) {
      Object.keys(params).forEach((key, i) => {
        const prop = params[key];

        if (i === 0) {
          where += ' WHERE ';
        } else {
          where += ' AND ';
        }

        where += `${key} = ?`;
        values.push(prop);
      });
    }

    return this.exec(`${query}${where}`, values);
  }

  insert(tableName: string, params: any) {
    const query = `INSERT INTO \`${tableName}\` SET ?`;
    return this.exec(`${query}`, params);
  }
}

export { DB };
