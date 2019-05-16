import * as fs from 'fs';
import * as http from 'http';
import * as dateFormat from 'dateformat';

export class ObtenerPDFs {
  constructor() { }
  public async obtenerVehiculo(url: any, respCreacionPermisoid: any) {
    const file = fs.createWriteStream('C:/Users/fvenegas/Documents/GitHub/api-tramites/PDF/' + dateFormat("ddmmyyyy") + '-' + respCreacionPermisoid + '.pdf');
    const request = http.get("" + url + "", function (response: any) {
      response.pipe(file);
    });
  }
}

