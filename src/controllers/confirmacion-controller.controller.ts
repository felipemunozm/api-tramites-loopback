//import { post, requestBody } from "@loopback/rest";
import { controllerLogger } from "../logger/logger-config";
import { post, requestBody, HttpErrors, put, param, get, patch } from "@loopback/rest";
import { repository } from "@loopback/repository";
import * as request from 'request';
import * as moment from 'moment';
import { HttpError } from "http-errors";
import { response_simpleRepository, PermisoRepository, EstadoPermisoRepository } from "../repositories";
//

export class ConfirmacionControllerController {
  constructor(
    @repository(response_simpleRepository) public response_simpleRepository: response_simpleRepository,
    @repository(PermisoRepository) public permisoRepository: PermisoRepository,
    @repository(EstadoPermisoRepository) public estadoPermisoRepository: EstadoPermisoRepository
  ) { }

  //@patch('/tramites/internacional/chile-chile/envio/confirmacion')
  @put('/tramites/internacional/chile-chile/envio/confirmacion')
  async enviarConfirmacionFirma(@requestBody() params: any): Promise<any> {

    try {

      if (!params.documentoId || !params.fechaHoraEnvio || !params.estadoDocumento.codigoEstado
        || !params.estadoDocumento.descripcionEstado || !params.estadoDocumento.fechaHora
      ) {
        //console.log("inicia tramite");
        throw new HttpErrors.NotFound('Parámteros incorrectos');
      }

      // if (!params || !params.identificadorIntermediario || !params.documentoId || !params.fechaHoraEnvio
      //   || !params.estadoDocumento
      //   || !params.estadoDocumento.codigoEstado || !params.estadoDocumento.descripcionEstado || !params.estadoDocumento.fechaHora
      //   || !params.estadoDocumento.datosFirma
      //   || !params.estadoDocumento.datosFirma.folioDocumento || !params.estadoDocumento.datosFirma.urlDocumento
      // )



      if (params.estadoDocumento.codigoEstado == 'FIR' && (!params.estadoDocumento.datosFirma.urlDocumento
        || !params.estadoDocumento.datosFirma.urlDocumento.trim()
        || !params.estadoDocumento.datosFirma.folioDocumento)

      ) {
        // throw new HttpErrors.NotFound('Motivo de Rechazo No existe');
        return { resultado: false, motivo: "Folio o Url Documento No Existe" }
      }

      if (params.estadoDocumento.codigoEstado == 'REC' && (!params.estadoDocumento.rechazo.motivo
        || !params.estadoDocumento.rechazo.motivo.trim())) {
        // throw new HttpErrors.NotFound('Motivo de Rechazo No existe');
        return { resultado: false, motivo: "Motivo de Rechazo no Existe" }
      }


      else {

        // update a registros en simple
        let strdocumentoId = params.documentoId.toString();
        // buscar en tabla permiso segun ID documento la URL CALL BACK para realizar el put de cada documento
        let permiso: any = (await this.permisoRepository.obtenerPermisoByCertificado(strdocumentoId))[0];

        if (permiso != undefined) {
          // tipo_estado_permiso_id = 1 En espera de firma
          let tipo_estado_permiso_id;

          if (params.estadoDocumento.codigoEstado == 'FIR') { tipo_estado_permiso_id = 3 } else if (params.estadoDocumento.codigoEstado == 'REC') { tipo_estado_permiso_id = 2 }

          let respPermisoId: any = await this.permisoRepository.actualizarEstadoPermisoEnPermisoById(permiso.id, tipo_estado_permiso_id)
          if (respPermisoId != undefined) {
            let permisoId = respPermisoId.rows[0].id;
            let respObtenerEstadoPermiso: any = (await this.estadoPermisoRepository.ObtenerEstadoPermisoByPermisoId(permisoId, tipo_estado_permiso_id))[0]
            let folioDocumento = undefined;
            if (params.estadoDocumento.datosFirma.folioDocumento != 0 && params.estadoDocumento.datosFirma.folioDocumento != "") {
              folioDocumento = params.estadoDocumento.datosFirma.folioDocumento
            }
            if (respObtenerEstadoPermiso != undefined) {
              let estadoPermiso = {
                id: respObtenerEstadoPermiso.id,
                fecha_hora_cambio: moment(params.fechaHoraEnvio, "DD/MM/YYYY kk:mm:ss").toDate(),
                tipo_estado_permiso_id: tipo_estado_permiso_id,
                folio_documento: folioDocumento,
                fecha_estado_doc: moment(params.estadoDocumento.fechaHora, "DD/MM/YYYY kk:mm:ss").toDate()
              }
              //Actualiza el detalle de cada estado del permiso
              let resEstadoPermiso: any = await this.estadoPermisoRepository.ActualizarEstadoPermiso(estadoPermiso)
              if (resEstadoPermiso != undefined) { console.log("Estado Permiso actualizado OK") }
            } else {
              let estadoPermiso = {
                fecha_hora_cambio: moment(params.fechaHoraEnvio, "DD/MM/YYYY kk:mm:ss").toDate(),
                permiso_id: permisoId,
                tipo_estado_permiso_id: tipo_estado_permiso_id,
                folio_documento: params.estadoDocumento.datosFirma.folioDocumento,
                fecha_estado_doc: moment(params.estadoDocumento.fechaHora, "DD/MM/YYYY kk:mm:ss").toDate(),
              }
              //Guardar el detalle de cada estado del permiso
              let resEstadoPermiso = (await this.estadoPermisoRepository.crearEstadoPermiso(estadoPermiso))[0]
              if (resEstadoPermiso != undefined) { console.log("Estado Permiso creado OK:" + resEstadoPermiso.id) }
            }
          }
          if (permiso.url_callback !== undefined && permiso.url_callback !== "") {
            let strbody = JSON.stringify({
              identificadorIntermediario: params.identificadorIntermediario,
              documentoId: params.documentoId,
              fechaHoraEnvio: params.fechaHoraEnvio,
              estadoDocumento: params.estadoDocumento
            });

            try {
              let options = {
                method: 'PUT',
                url: permiso.url_callback,
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                },
                body: strbody
              };
              //llama a simple /wso2 prueba
              let retorno = await new Promise((resolve, reject) => {
                request(options, function (error, response, body) {
                  if (error) {
                    return reject({ resultado: false, motivo: "UrlCallBack: " + error.code });
                  }
                  console.log(body);
                  return resolve(body);

                });
              });
              // si es Ok, graba en tabla response_simple
              if (retorno !== undefined) {
                let d = new Date();
                let response_sim = {
                  id: 0,
                  request_json: JSON.stringify({
                    identificadorIntermediario: params.identificadorIntermediario,
                    documentoId: params.documentoId,
                    fechaHoraEnvio: params.fechaHoraEnvio,
                    estadoDocumento: params.estadoDocumento
                  }),
                  response_json: retorno,
                  modified: d,
                  user_modified: 'user_ws_mtt'
                }
                let resultadoCreacionresponse_simple: any = await this.response_simpleRepository.crearResponse(response_sim);
                if (resultadoCreacionresponse_simple[0].id.toString() !== "") {
                  return { resultado: true, motivo: "OK" }
                  // return { response.status}
                }
              }
              else { return { resultado: false, motivo: "respuesta de ws simple vacía" } }
            }
            catch (ex) {
              console.log(ex)
              // ctx.status = 502
              // ctx.body = ex.toString()
              let error: HttpError;
              if (ex.status == 502) {
                error = new HttpErrors.BadGateway(ex.toString());
                error.status = 502;
                throw error;
              }
              if (ex.status == 404) {
                error = new HttpErrors.NotFound(ex.toString());
                error.status = 404
                throw error;
              }
              if (ex.resultado == false) {
                error = new HttpErrors.BadRequest(ex.motivo);
                error.status = 400
                throw error;
                // throw { resultado: false, motivo: ex.motivo.toString() };
              }
              error = new HttpErrors.InternalServerError(ex.toString());
              error.status = 500;
              throw error;
            }
          }
          else {
            return { resultado: false, motivo: "urlCallback No existe" }
          }
        }
      }
    } catch (ex) {
      console.log(ex);
      controllerLogger.error(ex, ex);
      throw new HttpErrors.InternalServerError(ex.toString());
      // return { resultado: false, motivo: ex.toString() }
    }
  }
}

