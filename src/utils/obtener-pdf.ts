import * as fs from 'fs';
import * as http from 'http';
import * as dateFormat from 'dateformat';

export class ObtenerPDFs {
  constructor() { }
  public async obtenerVehiculo(url: any, respCreacionPermisoid: any, docId: any) {
    const file = fs.createWriteStream((process.platform == 'win32' ? 'C:\\APIDOCS\\' : '/root/APIDOCS/') + dateFormat("ddmmyyyy") + '-PERMISO_ID-' + respCreacionPermisoid + '-DOCUMENTO_ID-' + docId + '.pdf')
    const request = http.get(url, function (response: any) {
      response.pipe(file);
    });
  }
}

