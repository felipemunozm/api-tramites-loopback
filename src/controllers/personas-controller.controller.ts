import { repository } from "@loopback/repository";
import { PermisoRepository, TipoPermisoRepository, SujetoRepository, DireccionPersonaNaturalRepository, VehiculoRepository, PermisoVigenteResponse } from "../repositories";
import { get, param, HttpErrors, LogErrorProvider } from "@loopback/rest";
import { controllerLogger } from "../logger/logger-config";
import { Permiso } from "../models";

// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/context';


export class PersonasControllerController {
  constructor(@repository(PermisoRepository) public permisoRepository: PermisoRepository,
    @repository(TipoPermisoRepository) public tipoPermisoRepository: TipoPermisoRepository,
    @repository(SujetoRepository) public sujetoRepository: SujetoRepository,
    @repository(DireccionPersonaNaturalRepository) public direccionPersonaNaturalRepository: DireccionPersonaNaturalRepository,
    @repository(VehiculoRepository) public vehiculoRepository: VehiculoRepository,
  ) {

  }
  @get('/tramites/internacional/chile-chile/personas')
  async validarPersona(@param.query.string('q') q: string): Promise<any> {
    try {
      // controllerLogger.info(q);
      let params: any[] = q.replace(/\{/g, '').replace(/\}/g, '').split('=')
      if (params[0] !== "'rut'") throw 'Parámetros incorrectos'
      let rut = params[1].replace(/\'/g, '')
      console.log("rut:" + rut)
      // let permiso = await internacionalGateway.obtenerPermisoVigenteByRut(rut);
      let permiso: PermisoVigenteResponse = await this.permisoRepository.obtenerPermisoVigenteByRut(rut);
      controllerLogger.info("permiso: " + permiso);
      let resp: { [k: string]: any } = {};
      resp = {
        rutSolicitante: rut,
        codigoResultado: 1,
        descripcionResultado: 'No tiene permiso vigente'
      }
      if (permiso == null) {
        return resp;
      }
      resp.codigoResultado = 2
      resp.descripcionResultado = 'Tiene permiso vigente'
      // let tipoPermiso = await internacionalGateway.obtenerTipoPermisoById(permiso.tipo_id)
      let tipoPermiso = await this.tipoPermisoRepository.findById(new Number(permiso.tipo_id));
      // let sujeto      = await internacionalGateway.obtenerSujetoById(permiso.sujeto_id)
      let sujeto = await this.sujetoRepository.obtenerSujetoById(permiso.sujeto_id);
      // let direccionSujeto = await internacionalGateway.obtenerDireccionByPersonaId(sujeto.persona_natural_id)
      let direccionSujeto = await this.direccionPersonaNaturalRepository.obtenerDireccionByPersonaId(sujeto.persona_natural_id);
      // let vehiculos = await internacionalGateway.obtenerVehiculosByPermisoId(permiso.id)
      let vehiculos = await this.vehiculoRepository.obtenerVehiculosByPermisoId(permiso.id.toString());
      let flota: any[] = [], contabilizacion: { [k: string]: any } = {}
      let tonelada: any[] = []
      let resumen = {
        cantidadVehiculos: vehiculos.length,
        capacidadCargaToneladas: 0
      }
      vehiculos.array.forEach((v: any) => {
        let vehiculo = {
          ppu: v.ppu,
          tipo: v.tipo,
          marca: v.marca,
          modelo: v.modelo,
          anno: v.anno_fabricacion,
          carroceria: v.carroceria,
          ejes: v.cantidad_ejes,
          capacidadCargaToneladas: v.cantidad_toneladas_carga,
          fechaVencimiento: '',
          nombrePropietario: v.nombre_propietario,
          //Campos Agregados FV
          chasis: v.chasis,
          NumeroMotor: v.num_motor
        }
        flota.push(vehiculo)
        let contabilizacion: { [k: string]: any } = {};
        contabilizacion[v.tipo] = (contabilizacion[v.tipo] ? contabilizacion[v.tipo] : 0.0) + 1
      })
      //Logica de calculo toneladas
      console.log("Contabilizacion toneladas")
      vehiculos.forEach((t: any) => {
        let toneladas = {
          ton: JSON.parse(t.cantidad_toneladas_carga)
        }
        tonelada.push(toneladas.ton)
      })
      let toneladasFinal = tonelada.reduce((a, B) => a + B, 0)
      console.log(tonelada)
      let toneladasFinal1 = JSON.parse(toneladasFinal)
      resumen.capacidadCargaToneladas = toneladasFinal1
      console.log(toneladasFinal1)
      //Fin Logica
      let contabilizacionFlota: any[] = [];
      Object.keys(contabilizacion).forEach((tipoVehiculo: any) => contabilizacionFlota.push({ tipo: tipoVehiculo, cantidad: contabilizacion[tipoVehiculo] }))
      resp.permiso = {
        tipoPermiso: tipoPermiso.nombre,
        id: permiso.id,
        encabezado: "",
        sujeto: {
          nombre: sujeto.nombre_completo,
          rut: sujeto.identificador_pn,
          email: sujeto.email,
          direccion: direccionSujeto
        },
        flota: flota,
        contabilizacionFlota: contabilizacionFlota,
        resumen: resumen
      }
      return resp;
    } catch (ex) {
      controllerLogger.error(ex, ex);
      throw new HttpErrors.InternalServerError(ex.toString());
    }
  }
}
