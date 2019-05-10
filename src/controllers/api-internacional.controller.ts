import { get, param } from "@loopback/rest";
import { ConsultaPersonaResponse } from "../models/responses/consulta-persona-response";
import { controllerLogger } from "../logger/logger-config";
import { repository, Filter, FilterBuilder, WhereBuilder, Where } from "@loopback/repository";
import { TramiteRepository } from "../repositories";
import { Tramite } from "../models";

// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/context';


export class ApiInternacionalController {
  constructor(
    @repository(TramiteRepository) public tramiteRepository: TramiteRepository,
  ) { }
  @get(
    '/tramites/internacional/chile-chile/personas',
    {
      responses: {
        '200': {
          description: 'Validar Personas',
          content: { 'application/json': { schema: { 'x-ts-type': ConsultaPersonaResponse } } },
        },
      },
    }
  )
  async findPermisoVigente(@param.query.object("q") q: string): Promise<ConsultaPersonaResponse> {
    let params: string[] = q.replace(/\{/g, '').replace(/\}/g, '').split('=');
    controllerLogger.debug(params.toString());
    if (params[0] !== "'rut'") throw 'Parámetros incorrectos';
    let rut = params[1].replace(/\'/g, '');
    controllerLogger.debug(rut);
    let filter: Filter = { where: { codigo: "permiso-chile-chile" } };
    let promiseTramites: Tramite[] = await this.tramiteRepository.find(filter);
    let response: ConsultaPersonaResponse;
    response = new ConsultaPersonaResponse();
    response.rutSolicitante = "16213608-9";
    response.codigoResultado = 1;
    response.descripcionResultado = "Aprobado"
    return await response;
  }
}
