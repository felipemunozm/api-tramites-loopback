import { get, param } from "@loopback/rest";
import { repository } from "@loopback/repository";
import { TipoDocumentoRepository, TipoDocumentoTipoEmpresaRepository } from "../repositories";

// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/context';


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
      // let codigo = ctx.query.codigoTipoEmpresa
      // let tiposDocumentos = await internacionalGateway.obtenerTiposDocumentosByCodigoTipoEmpresa(codigoTipoEmpresa)
      let tiposDocumentos: any = await this.tipoDocumentoTipoEmpresaRepository.obtenerTiposDocumentosByCodigoTipoEmpresa(codigoTipoEmpresa);
      return {
        codigoResultado: 1,
        descripcionResultado: "Exitoso.",
        tiposDocumentos: tiposDocumentos
      }
    } catch (ex) {
      console.log(ex)
      throw ex.toString()
    }
  }
}
