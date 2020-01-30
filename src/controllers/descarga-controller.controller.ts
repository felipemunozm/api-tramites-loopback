import { ObtenerPDFs } from "../utils/obtener-pdf";
import { post, requestBody, HttpErrors, put, param, get } from "@loopback/rest";
import { controllerLogger } from "../logger/logger-config";
import * as dateFormat from 'dateformat';
import * as fs from 'fs';

export class DescargaControllerController {
  constructor() {

  }

  @get('/tramites/documentos')
  public async  getdocumentos(@param.query.string('idTramite') idTramite: number, @param.query.string('token') token: string, @param.query.string('url') url: string, @param.query.string('idProceso') idProceso: number, @param.query.string('rutSol') rutSol: string): Promise<any> {
    try {
      if (!url || !idTramite) {
        throw {
          error: {
            statusCode: 502,
            message: 'Parámetros incorrectos'
          }
        }
      }
      else {
        let opdf: ObtenerPDFs = new ObtenerPDFs();
        url = url + "&token=" + token;

        const request = require('request');

        /* Create an empty file where we can save data */
        let file = fs.createWriteStream((process.platform == 'win32' ? 'C:\\APIDOCS\\' : '/root/APIDOCS/') + idProceso + '_' + idTramite + '_' + dateFormat("ddmmyyyy") + '_' + rutSol + '.pdf')

        /* Using Promises so that we can use the ASYNC AWAIT syntax */
        await new Promise((resolve, reject) => {
          let stream = request({
            /* Here you should specify the exact link to the file you are trying to download */
            uri: url
          })
            .pipe(file)
            .on('finish', () => {
              console.log('the file is finished downloading.');
              resolve();
            })
            .on('error', (error: any) => {
              reject(error);
            })
        })
          .catch(error => {
            console.log('Something happened: ${error}');
          });



        //***************************************************** FTP *************************************/


        let remoteFile = idProceso + '_' + idTramite + '_' + dateFormat("ddmmyyyy") + '_' + rutSol + '.pdf'
        let path = file.path;
        //file.close();
        //host: "172.25.1.169 ",
        const ftp = require("basic-ftp");
        const client = new ftp.Client()
        client.ftp.verbose = true
        try {
          await client.access({
            host: "172.25.12.169",
            user: "exedoc",
            password: "1wO14AKN",
            port: "21",
            secure: false
          })
          await client.uploadFrom(path, remoteFile)
        } catch (err) {
          console.log(err)
        }
        client.close()


        //***************************************************************************************/

      }
      return {
        codigoResultado: 1,
        descripcionResultado: "Exitoso"

      }

    } catch (ex) {
      controllerLogger.info(ex)
      throw ex.toString()
    }
  }

}


