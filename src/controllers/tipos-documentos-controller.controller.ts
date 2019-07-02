import { get, param, HttpErrors } from "@loopback/rest";
import { repository } from "@loopback/repository";
import { TipoDocumentoRepository, TipoDocumentoTipoEmpresaRepository } from "../repositories";
import { controllerLogger } from "../logger/logger-config";
import { HttpError } from "http-errors";

export class TiposDocumentosControllerController {
  constructor(
    @repository(TipoDocumentoTipoEmpresaRepository) public tipoDocumentoTipoEmpresaRepository: TipoDocumentoTipoEmpresaRepository,
  ) { }
  @get('/tramites/internacional/chile-chile/tiposDocumentos')
  async getEmpresa(@param.query.string('codigoTipoEmpresa') codigoTipoEmpresa: any): Promise<any> {
    try {
      if (!codigoTipoEmpresa) {
        return {
          codigoResultado: 2,
          descripcionResultado: "Debe especificar el tipo de empresa."
        }
      }
      let tiposDocumentos: any = await this.tipoDocumentoTipoEmpresaRepository.obtenerTiposDocumentosByCodigoTipoEmpresa(codigoTipoEmpresa)
      if (!tiposDocumentos || tiposDocumentos.length === 0) {
        return {
          codigoResultado: 2,
          descripcionResultado: "No existen tipos de documentos para el tipo de empresa",
        }
      }
      return {
        codigoResultado: 1,
        descripcionResultado: "Exitoso",
        tiposDocumentos: tiposDocumentos
      }
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
