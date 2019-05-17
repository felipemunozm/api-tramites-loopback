import { get } from "@loopback/rest";
import { repository } from "@loopback/repository";
import { RegionRepository } from "../repositories";

// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/context';


export class RegionesControllerController {
  constructor(
    @repository(RegionRepository) public regionRepository: RegionRepository,
  ) { }
  @get('/tramites/regiones')
  async getRegiones(): Promise<any> {
    try {
      let resp: any = {
        codigoResultado: 2,
        descripcionResultado: 'No hay regiones disponibles.',
        regiones: []
      }
      // let regiones = await internacionalGateway.obtenerRegiones()
      let regiones: any = await this.regionRepository.obtenerRegiones();
      if (!regiones || regiones.length === 0) {
        return resp
        return
      }
      resp.codigoResultado = 1
      resp.descripcionResultado = 'Regiones disponibles.'
      regiones.forEach((r: any, index: any) => {
        let region = {
          id: r.id,
          codigo: r.codigo,
          nombre: r.nombre
        }
        resp.regiones.push(region)
      })
      return resp
    } catch (ex) {
      console.log(ex)
      throw ex.toString()
    }
  }
}
