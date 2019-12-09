import { get, param } from "@loopback/rest";
import { repository } from "@loopback/repository";
import { RegionRepository } from "../repositories";
import { controllerLogger } from "../logger/logger-config";

// Uncomment these imports to begin using these cool features!
// import {inject} from '@loopback/context';
export class RegionesControllerController {
  constructor(
    @repository(RegionRepository) public regionRepository: RegionRepository,
  ) { }
  @get('/tramites/regiones')
  async getRegiones(@param.query.string('type') type: string): Promise<any> {
    try {
      let resp: any = {
        codigoResultado: 2,
        descripcionResultado: 'No hay regiones disponibles',
        regiones: []
      }
      let resp2: any[] = new Array();
      let regiones: any = await this.regionRepository.obtenerRegiones();
      if (!regiones || regiones.length === 0) {
        return resp
      }
      resp.codigoResultado = 1
      resp.descripcionResultado = 'Regiones disponibles.'
      regiones.forEach((r: any, index: any) => {
        if (type == 'select') {
          resp2.push({ etiqueta: r.nombre, valor: r.id })
        }
        else {
          let region = {
            id: r.id,
            codigo: r.codigo,
            nombre: r.nombre
          }
          resp.regiones.push(region)
        }
      })
      if (type == 'select')
        return resp2;
      return resp
    } catch (ex) {
      controllerLogger.info(ex)
      throw ex.toString()
    }
  }
}
