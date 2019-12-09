import { get, requestBody, post, HttpErrors } from "@loopback/rest";
import { repository } from "@loopback/repository";
import { AnalistaRepository } from "../repositories";
import { controllerLogger } from "../logger/logger-config";
import { HttpError } from "http-errors";

// Uncomment these imports to begin using these cool features!
// import {inject} from '@loopback/context';
export class AnalistasControllerController {
  constructor(
    @repository(AnalistaRepository) public analistaRepository: AnalistaRepository,
  ) { }

  @get('/tramites/internacional/analistas')
  async getAnalistasDisponibles(): Promise<any> {
    try {
      let resp: any = {
        codigoResultado: 2,
        descripcionResultado: 'No hay analistas disponibles.',
        analistas: []
      }
      let analistas: any = await this.analistaRepository.obtenerAnalistas();
      if (!analistas || analistas.length === 0) {
        throw new HttpErrors.NotFound('Parámetros Incorrectos')
      }
      resp.codigoResultado = 1
      resp.descripcionResultado = 'Analistas disponibles.'
      analistas.forEach((a: any, index: any) => {
        controllerLogger.info(a)
        let analista = {
          id: a.id,
          rut: a.rut,
          nombreCompleto: a.nombre_completo,
          regionId: a.region_id,
          codigo: a.codigo
        }
        resp.analistas.push(analista)
      })
      return resp;
    } catch (ex) {
      controllerLogger.info(ex)
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
      error = new HttpErrors.InternalServerError(ex.toString());
      error.status = 500;
      throw error;
    }
  }
  @post('/tramites/internacional/analista')
  async crearAnalista(@requestBody() params: any): Promise<any> {
    if (!params || !params.nombreCompleto || !params.codigo || !params.regionId) {
      throw new HttpErrors.NotFound('Parámetros Incorrectos')
    }
    let analista: any = {
      codigo: params.codigo,
      nombre_completo: params.nombreCompleto,
      region_id: params.regionId
    }
    try {
      let resp: any = {
        codigoResultado: 1,
        descripcionResultado: 'Analista creado.'
      }
      let respCreacionAnalista = (await this.analistaRepository.crearAnalista(analista))[0];
      resp.analistaId = respCreacionAnalista.id
      return resp
    } catch (ex) {
      controllerLogger.info(ex)
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
      error = new HttpErrors.InternalServerError(ex.toString());
      error.status = 500;
      throw error;
    }
  }
}
