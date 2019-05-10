import { repository, Filter } from "@loopback/repository";
import { PermisoRepository, TipoPermisoRepository, SujetoRepository, DireccionPersonaNaturalRepository, VehiculoRepository, PermisoVigenteResponse, EmpresaRepository, SolicitanteAutorizadoRepository } from "../repositories";
import { get, param, HttpErrors, LogErrorProvider } from "@loopback/rest";
import { controllerLogger } from "../logger/logger-config";
import * as moment from 'moment';

// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/context';


export class PersonasControllerController {
  constructor(@repository(PermisoRepository) public permisoRepository: PermisoRepository,
    @repository(TipoPermisoRepository) public tipoPermisoRepository: TipoPermisoRepository,
    @repository(SujetoRepository) public sujetoRepository: SujetoRepository,
    @repository(DireccionPersonaNaturalRepository) public direccionPersonaNaturalRepository: DireccionPersonaNaturalRepository,
    @repository(VehiculoRepository) public vehiculoRepository: VehiculoRepository,
    @repository(EmpresaRepository) public emrpesaRepository: EmpresaRepository,
    @repository(SolicitanteAutorizadoRepository) public solicitanteAutorizadoRepository: SolicitanteAutorizadoRepository,
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
      let permiso: any = (await this.permisoRepository.obtenerPermisoVigenteByRut(rut))[0];
      controllerLogger.info("permiso: " + permiso.id);

      let resp: { [k: string]: any } = {};
      resp = {
        rutSolicitante: rut,
        codigoResultado: 1,
        descripcionResultado: 'No tiene permiso vigente'
      }
      if (permiso.id == undefined) {
        return resp;
      }
      resp.codigoResultado = 2
      resp.descripcionResultado = 'Tiene permiso vigente'
      // let tipoPermiso = await internacionalGateway.obtenerTipoPermisoById(permiso.tipo_id)
      let tipoPermiso = await this.tipoPermisoRepository.findById(new Number(permiso.tipo_id));
      // let sujeto      = await internacionalGateway.obtenerSujetoById(permiso.sujeto_id)
      let sujeto = (await this.sujetoRepository.obtenerSujetoById(permiso.sujeto_id))[0];
      // let direccionSujeto = await internacionalGateway.obtenerDireccionByPersonaId(sujeto.persona_natural_id)
      let direccionSujeto = (await this.direccionPersonaNaturalRepository.obtenerDireccionByPersonaId(sujeto.persona_natural_id))[0];
      // let vehiculos = await internacionalGateway.obtenerVehiculosByPermisoId(permiso.id)
      let vehiculos = await this.vehiculoRepository.obtenerVehiculosByPermisoId(permiso.id.toString());
      let flota: any[] = [], contabilizacion: { [k: string]: any } = {}
      let tonelada: any[] = []
      let resumen = {
        cantidadVehiculos: vehiculos.length,
        capacidadCargaToneladas: 0
      }
      vehiculos.forEach((v: any) => {
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
        // let contabilizacion: { [k: string]: any } = {};
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

  @get('/tramites/internacional/chile-chile/personas/empresas')
  async valdiarPersonaEmpresa(@param.query.string('q') q: string): Promise<any> {
    try {
      let params = q.replace(/\{/g, '').replace(/\}/g, '').replace(/\s/g, '').split(',')
      let pRutSolicitante = params[0].split('='), pRutEmpresa = params[1].split('=')
      if (pRutSolicitante[0] !== "'rutSolicitante'" || pRutEmpresa[0] !== "'rutEmpresa'") throw 'Parámetros incorrectos'
      let rutSolicitante = pRutSolicitante[1].replace(/\'/g, '')
      let rutEmpresa = pRutEmpresa[1].replace(/\'/g, '')
      let tonelada: any[] = []
      let resp: { [k: string]: any } = {};
      resp = {
        rutSolicitante: rutSolicitante,
        codigoResultado: 1,
        descripcionResultado: 'Empresa no registrada'
      }
      // let empresa = await internacionalGateway.obtenerEmpresaByRut(rutEmpresa)
      let empresa: any = (await this.emrpesaRepository.obtenerEmpresaByRut(rutEmpresa))[0];
      if (empresa.id == undefined) {
        return resp;
      }
      resp.codigoResultado = 3
      resp.descripcionResultado = 'Empresa Registrada, Usuario No Autorizado'
      if (empresa.identificador_representante_legal !== rutSolicitante) {
        // let autorizados = await internacionalGateway.obtenerSolicitantesAutorizadosByEmpresaId(empresa.id)
        let autorizados: any[] = await this.solicitanteAutorizadoRepository.obtenerSolicitantesAutorizadosByEmpresaId(empresa.id);
        if (!autorizados.find((auth: any) => auth.identificador === rutSolicitante)) {
          return resp;
        }
      }
      resp.empresa = {}
      resp.empresa.rut = empresa.identificador
      resp.empresa.razonSocial = empresa.razon_social
      resp.empresa.tipo = empresa.tipo_empresa
      resp.empresa.direccion = {
        codigo_comuna: empresa.codigo_comuna,
        codigo_region: empresa.codigo_region,
        //comuna, tipo empresa y region agregados FV
        nombre_comuna: empresa.nombre_comuna,
        nombre_region: empresa.nombre_region,
        tipo_empresa: empresa.tipo_empresa,
        //fin cambio
        texto: empresa.texto,
        telefono_fijo: empresa.telefono_fijo,
        telefono_movil: empresa.telefono_movil,
        email: empresa.email
      }
      resp.codigoResultado = 2
      resp.descripcionResultado = 'Empresa Registrada, Usuario Autorizado Sin Permiso Vigente'
      // let permiso = await internacionalGateway.obtenerPermisoVigenteByRut(rutEmpresa)
      let permiso: any = (await this.permisoRepository.obtenerPermisoVigenteByRut(rutEmpresa))[0];
      if (permiso.id == undefined) {
        return resp;
      }
      resp.codigoResultado = 4
      resp.descripcionResultado = 'Empresa Registrada, Usuario Autorizado y Tiene Permiso Vigente'
      // let tipoPermiso = await internacionalGateway.obtenerTipoPermisoById(permiso.tipo_id)
      let tipoPermiso = await this.tipoPermisoRepository.findById(new Number(permiso.tipo_id));
      let sujeto = await internacionalGateway.obtenerSujetoById(permiso.sujeto_id)
      let vehiculos = await internacionalGateway.obtenerVehiculosByPermisoId(permiso.id)
      let flota: any[] = [], contabilizacion: { [k: string]: any } = {}
      let resumen = {
        cantidadVehiculos: vehiculos.length,
        capacidadCargaToneladas: 0
      }
      vehiculos.forEach((v: any) => {
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
        contabilizacion[v.tipo] = (contabilizacion[v.tipo] ? contabilizacion[v.tipo] : 0.0) + 1
        //resumen.capacidadCargaToneladas += v.cantidad_toneladas_carga
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
      let contabilizacionFlota: any[] = []
      Object.keys(contabilizacion).forEach((tipoVehiculo, index) => contabilizacionFlota.push({ tipo: tipoVehiculo, cantidad: contabilizacion[tipoVehiculo] }))
      resp.permiso = {
        tipoPermiso: tipoPermiso.nombre,
        id: permiso.id,
        encabezado: "",
        fechaCreacion: moment(permiso.fecha_creacion).format('DD/MM/YYYY'),
        fechaFinVigencia: moment(permiso.fecha_fin_vigencia).format('DD/MM/YYYY'),
        sujeto: {
          nombre: sujeto.tipo_persona === 'PN' ? sujeto.nombre_completo : sujeto.razon_social,
          rut: sujeto.tipo_persona === 'PN' ? sujeto.identificador_pn : sujeto.identificador_pj
        },
        flota: flota,
        contabilizacionFlota: contabilizacionFlota,
        resumen: resumen
      }
      return resp
    } catch (ex) {
      console.log(ex)
      ctx.status = 404
      ctx.body = ex.toString()
    }
  }
}
