import { get } from "@loopback/rest";
import { repository } from "@loopback/repository";
import { AnalistaRepository } from "../repositories";

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
      // let analistas = await gestionTramitesGateway.obtenerAnalistas()
      let analistas: any = await this.analistaRepository.obtenerAnalistas();
      if (!analistas || analistas.length === 0) {
        return resp
        return
      }
      resp.codigoResultado = 1
      resp.descripcionResultado = 'Analistas disponibles.'
      analistas.forEach((a: any, index: any) => {
        console.log(a)
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
      console.log(ex)
      throw ex.toString()
    }
  }
}
