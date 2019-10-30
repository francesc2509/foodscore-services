import { connection } from './db.config';

import { Observable, of } from 'rxjs';

class DB {
  protected exec(query: any, params: any[] | any = []): Observable<any> {
    return Observable.create((observer: any) => {
      connection.query(query, params, (err, result) => {
        if (err) {
          observer.error(err);
          return;
        }

        observer.next(result);
        return;
      });
    });
  }

  protected select(query: string, filters: any = undefined) {
    let where = '';
    const values = <any[]>[];
    if (filters) {
      Object.keys(filters).forEach((key, i) => {
        const prop = filters[key];

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

  protected insert(tableName: string, params: any) {
    const query = `INSERT INTO \`${tableName}\` SET ?`;
    return this.exec(`${query}`, this.getParams(params));
  }

  protected update(tableName: string, params: any, filters: any) {
    const query = `UPDATE ${tableName} SET ?`;

    let where = '';
    const values = <any[]>[];
    if (filters) {
      Object.keys(filters).forEach((key, i) => {
        const prop = filters[key];

        if (i === 0) {
          where += ' WHERE ';
        } else {
          where += ' AND ';
        }

        where += `${key} = ?`;
        values.push(prop);
      });
    }

    return this.exec(`${query}${where}`, [this.getParams(params), ...values]);
  }

  protected delete(tableName: string, filters: any) {
    const query = `DELETE FROM ${tableName}`;

    let where = '';
    const values = <any[]>[];
    if (filters) {
      Object.keys(filters).forEach((key, i) => {
        const prop = filters[key];

        if (i === 0) {
          where += ' WHERE ';
        } else {
          where += ' AND ';
        }

        where += `${key} = ?`;
        values.push(prop);
      });

      return this.exec(`${query}${where}`, values);
    }
  }

  private getParams(params: any) {
    const o: any = {};
    console.log(params);
    if (params) {
      Object.keys(params).forEach((key: string) => {
        if (params[key] !== undefined) {
          console.log(params[key]);
          o[key] = params[key];
        }
      });
    }
    console.log(o);
    return o;
  }
}

export { DB };
