
import { HttpErrors, post, requestBody, param } from "@loopback/rest";
import * as moment from 'moment';
import { controllerLogger } from "../logger/logger-config";
import { repository, DATE } from "@loopback/repository";
import { TraduccionTipoVehiculoEjesCargaRepository, VehiculoRepository } from "../repositories";
import { serviciosGateway } from "../utils/servicios-gateway";
import { HttpError } from "http-errors";
import { Rechazo } from "../models/estructuras-validacion/rechazo";

// Uncomment these imports to begin using these cool features!
// import {inject} from '@loopback/context';
export class FlotaControllerController {
  constructor(
    @repository(TraduccionTipoVehiculoEjesCargaRepository) public traduccionTipoVehiculosEjesCargaRepository: TraduccionTipoVehiculoEjesCargaRepository,
    @repository(VehiculoRepository) public vehiculoRepository: VehiculoRepository,
  ) { }

  @post("/tramites/internacional/chile-chile/flota/validacion", {
    parameters: [{ name: 'q', schema: { type: 'string' }, in: 'query' }],
    responses: {
      '200': {
        description: 'datos ok',
        content: {
          'application/json': {
            schema: {
              type: 'string',
            }
          }
        }
      },
      '404': {
        description: 'Error de datos de entrada',
        content: {
          'application/json': {
            schema: { type: 'string' }
          }
        }
      }
    }
  })
  async validarFlota(@requestBody() params: any): Promise<any> {
    let matrizConversionCapacidadesCargas = await this.traduccionTipoVehiculosEjesCargaRepository.obtenerCapacidadesCargas();
    let tiposVehiculosAceptados = ['camioneta', 'furgon', 'tractocamion', 'camion', 'semiremolque', 'remolque', 'chasis cabinado', 'CAMION']
    controllerLogger.info("Validar flota INPUT" + JSON.stringify(params));

    try {

      if (!params || !params.rutSujeto || !params.ppus || params.ppus.length === 0) {
        throw new HttpErrors.NotFound('Parámetros Incorrectos')
      }
      let ppusProcesadas: any[] = []
      let resultado: any = {};
      resultado.codigoResultado = 1;
      resultado.descripcionResultado = 'Todas las PPUs validadas correctamente';
      resultado.flotaValidada = new Array();
      resultado.resumenFlotaValidada = {}
      resultado.resumenFlotaValidadaPorTipo = new Array();
      resultado.flotaRechazada = new Array();
      resultado.cantidadVehiculosRechazados
      resultado.tiposDocumentosPosiblesAdjuntar = {};
      resultado.tiposDocumentosPosiblesAdjuntar.caso = 0
      resultado.tiposDocumentosPosiblesAdjuntar.data = new Array();
      resultado.empresa


      let ppuRequest: any;
      // controllerLogger.info('Respuesta de Civil para vehiculo nuevo: ' + JSON.stringify(v))
      // let ppuAux = new Array();
      // ppuAux = params.ppus;
      // let miarrayaux: any[] = [params];

      // miarrayaux = params;
      //let ppuAux = params.ppus.split(",");
      //let aux1 = JSON.parse(params.ppus);
      //controllerLogger.info("parse : " + ppuAux);
      for (let _ppu of params.ppus) {
        if (_ppu != undefined)
          ppuRequest = _ppu[0];

        let rechazoTipoVehiculo: Rechazo = new Rechazo(), rechazoAntiguedad: Rechazo = new Rechazo(), rechazoCivil: Rechazo = new Rechazo(), rechazoDuplicado: Rechazo = new Rechazo();
        let vehiculoBD: any = await this.vehiculoRepository.ObtenerVehiculoPorPPU(_ppu.ppu)
        if (vehiculoBD.length == 0)
          vehiculoBD = undefined;
        let v: any = {
          return: {}
        }
        let fechaRegistro: Date
        if (vehiculoBD != undefined) {
          controllerLogger.info("fecha_vigencia: " + vehiculoBD[0].vigencia_registro)
          fechaRegistro = vehiculoBD[0].vigencia_registro
        }
        else {
          controllerLogger.info('Sin fecha_vigencia, no exite PPU: ' + _ppu.ppu + ' en al BD')
          fechaRegistro = new Date('')
        }
        let hoy: Date = new Date();
        controllerLogger.info('fecha: ' + (vehiculoBD ? vehiculoBD[0].vigencia_registro : undefined))
        if (vehiculoBD == undefined) {
          v = await serviciosGateway.obtenerVehiculo(_ppu.ppu)
          // controllerLogger.info('Respuesta de Civil para vehiculo nuevo: ' + JSON.stringify(v))
        }
        else {
          if (fechaRegistro.getFullYear() != hoy.getFullYear() || fechaRegistro.getMonth() != hoy.getMonth() || fechaRegistro.getDay() != hoy.getDay()) {
            v = await serviciosGateway.obtenerVehiculo(_ppu.ppu)
            // controllerLogger.info('Respuesta de Civil para vehiculo existente: ' + JSON.stringify(v))
          }
          else {
            v.return = {
              fromDB: true,
              aaFabric: vehiculoBD[0].anno_fabricacion,
              chasis: vehiculoBD[0].chasis,
              marca: vehiculoBD[0].marca,
              modelo: vehiculoBD[0].modelo,
              motor: vehiculoBD[0].num_motor,
              patente: vehiculoBD[0].ppu + '-',
              propieActual: {
                propact: {
                  itemPropact: [
                    {
                      nombres: vehiculoBD[0].nombre_propietario,
                      rut: vehiculoBD[0].rut_propietario
                    }
                  ]
                }
              },
              tipoVehi: vehiculoBD[0].tipo,
              limita: {
                itemLimita: [
                  { empty: true }
                ]
              }
            }
            // controllerLogger.info('vehiculo de civil simulado v: ' + JSON.stringify(v))
          }
        }
        let infoPrt: any = await serviciosGateway.obtenerRevisionTecnica(_ppu.ppu);
        let ppu: any;
        try {
          ppu = v.return.patente.split('-')[0]
        } catch (Ex) {
          controllerLogger.info("Saltando PPU: " + _ppu.ppu + " no se encontro en SRCeI");
          if (resultado.flotaRechazada.find((value: any) => {
            if (value.ppu == _ppu.ppu) return value
          }) == undefined) {
            resultado.flotaRechazada.push({ ppu: _ppu.ppu, motivoRechazo: 'Vehículo no encontrado en Registro civil' });
          }
          rechazoCivil.estado = true
          rechazoCivil.motivo = 'Vehículo no encontrado en Registro civil'
        }
        let ppuDuplicada = ppusProcesadas.find(p => p.ppu == ppu)
        ppusProcesadas.push({ ppu: ppu })
        //Condicion de rechazo, propiedad sea diferente o meratenencia, tipo de vehiculo se valida contra una lista, antiguedad del vehiculo
        if (ppuDuplicada != undefined) {
          resultado.flotaRechazada.push({ ppu: _ppu.ppu, motivoRechazo: 'Vehículo duplicado' });
          rechazoDuplicado.estado = true
          rechazoDuplicado.motivo = 'Vehículo duplicado'
        } else {
          if (v.return.marca) {
            let merotenedor: any = {}, limitacionesConcatendas: any = ''
            if (vehiculoBD == undefined || (fechaRegistro.getFullYear() != hoy.getFullYear() || fechaRegistro.getMonth() != hoy.getMonth() || fechaRegistro.getDay() != hoy.getDay())) {
              let tenedores = v.return.limita.itemLimita[v.return.limita.itemLimita.length - 1].tenedores
              if (tenedores && tenedores.itemTenedores[0].nombres) {
                merotenedor = tenedores.itemTenedores[0]
              }
              let limitaciones = v.return.limita.itemLimita
              let primeraLimitacion: boolean = true
              for (let limitacion of limitaciones) {
                if (limitacion.ACausa) {
                  let textoLimitacion = 'ACausa:' + limitacion.ACausa + ', acreedor:' + limitacion.acreedor + ', autorizante:' + limitacion.autorizante + ', causa:' + limitacion.causa + ', comuna:' + limitacion.comuna +
                    ', documento:' + limitacion.documento + ', fecReper:' + limitacion.fecReper + ', fechaDoc:' + limitacion.fechaDoc + ', naturaleza:' + limitacion.naturaleza + ', numReper:' + limitacion.numReper +
                    ', repertorio:' + limitacion.repertorio + ', titulo:' + limitacion.titulo
                  if (primeraLimitacion) {
                    limitacionesConcatendas = textoLimitacion
                    primeraLimitacion = false
                  } else {
                    limitacionesConcatendas = limitacionesConcatendas + ' @ ' + textoLimitacion
                  }
                }

              }
            } else {
              merotenedor.nombres = vehiculoBD[0].merotenedor
              merotenedor.rut = vehiculoBD[0].rut_merotenedor
              limitacionesConcatendas = vehiculoBD[0].limitaciones
              //asignar merotenedor a v
              if (merotenedor.nombres != '') {
                v.return.limita.itemLimita[v.return.limita.itemLimita.length - 1].tenedores = {}
                v.return.limita.itemLimita[v.return.limita.itemLimita.length - 1].tenedores.itemTenedores = new Array()
                v.return.limita.itemLimita[v.return.limita.itemLimita.length - 1].tenedores.itemTenedores.push({
                  nombres: vehiculoBD[0].merotenedor,
                  rut: vehiculoBD[0].rut_merotenedor
                })
              }
              //asignar limitaciones a v
            }
            let vehiculo: any = {
              ppu: ppu,
              tipo: v.return.tipoVehi,
              marca: v.return.marca,
              modelo: v.return.modelo,
              anno: v.return.aaFabric,
              carroceria: 'Sin dato',
              chasis: v.return.chasis ? v.return.chasis : v.return.vin ? v.return.vin : v.return.serie ? v.return.serie : 'S/N',
              //FV se agrega motor
              numeroMotor: v.return.numeroMotor,
              ejes: '0',
              fechaVencimientoRT: '',
              estadoRT: '',
              nombrePropietario: v.return.propieActual.propact.itemPropact.find((prop: any) => prop.rut == params.rutSujeto) ? v.return.propieActual.propact.itemPropact.find((prop: any) => prop.rut == params.rutSujeto).nombres : v.return.propieActual.propact.itemPropact[0].nombres,
              rutPropietario: v.return.propieActual.propact.itemPropact.find((prop: any) => prop.rut == params.rutSujeto) ? v.return.propieActual.propact.itemPropact.find((prop: any) => prop.rut == params.rutSujeto).rut : v.return.propieActual.propact.itemPropact[0].rut,
              fechaVencimientoLS: '',
              limitacion: limitacionesConcatendas,
              merotenedor: merotenedor ? merotenedor.nombres : '',
              rutMerotenedor: merotenedor ? merotenedor.rut : ''
            }
            // validacion tipo vehiculo
            if (!tiposVehiculosAceptados.includes(vehiculo.tipo.toLowerCase())) {
              //buscar si el vehiculo ya existe en la flota rechazada para no duplicarlo
              if (resultado.flotaRechazada.find((value: any) => {
                if (value.ppu == _ppu.ppu) return value
              }) == undefined) {
                resultado.flotaRechazada.push({ ppu: _ppu.ppu, motivoRechazo: 'Tipo de vehículo no corresponde a solicitud' });
                rechazoTipoVehiculo.estado = true
                rechazoTipoVehiculo.motivo = 'Tipo de vehículo no corresponde a solicitud'
                // continue
              }
            }
            // validacion año antiguedad
            if (vehiculo.tipo != 'REMOLQUE' && vehiculo.tipo != 'SEMIREMOLQUE') {
              if ((new Date().getFullYear() - vehiculo.anno) > 28) {
                if (resultado.flotaRechazada.find((value: any) => {
                  if (value.ppu == _ppu.ppu) return value
                }) == undefined) {
                  resultado.flotaRechazada.push({ ppu: _ppu.ppu, motivoRechazo: 'Antigüedad del vehiculo supera la permitida (28 años)' });
                  rechazoAntiguedad.estado = true
                  rechazoAntiguedad.motivo = 'Antigüedad del vehiculo supera la permitida (28 años)'
                  // continue
                }
              }
            }
            //validacion de Propietario
            if (params.rutSujeto != vehiculo.rutPropietario && params.rutSujeto != vehiculo.rutMerotenedor) {
              if (resultado.flotaRechazada.find((value: any) => {
                if (value.ppu == _ppu.ppu) return value
              }) == undefined) {
                rechazoCivil.estado = true
                rechazoCivil.motivo = 'Propietario del vehículo no corresponde al solicitante'
                resultado.flotaRechazada.push({ ppu: _ppu.ppu, motivoRechazo: 'Propietario del vehículo no corresponde al solicitante' })
              }
            }
            if (infoPrt && infoPrt.return.revisionTecnica) {
              let revisionTecnica: any = {}
              if (infoPrt && infoPrt.return && infoPrt.return.revisionTecnica && infoPrt.return.revisionTecnica.fechaVencimiento) {
                revisionTecnica.fechaVencimiento = moment(infoPrt.return.revisionTecnica.fechaVencimiento)
                revisionTecnica.estado = infoPrt.return.revisionTecnica.resultado
              }
              let cap = matrizConversionCapacidadesCargas.find((matriz: any) => matriz.tipo_vehiculo.toLowerCase() === v.return.tipoVehi.toLowerCase().replace(' ', '') && matriz.cantidad_ejes === infoPrt.return.cantEjes)
              vehiculo.carroceria = infoPrt.return.tipoCarroceria ? infoPrt.return.tipoCarroceria : 'Sin dato'
              vehiculo.numeroMotor = infoPrt.return.numeroMotor ? infoPrt.return.numeroMotor : 'Sin dato'
              vehiculo.ejes = infoPrt && infoPrt.return && infoPrt.return.cantEjes ? infoPrt.return.cantEjes : '0'
              vehiculo.capacidadCargaToneladas = cap ? cap.capacidad_carga : 0
              vehiculo.fechaVencimientoRT = revisionTecnica.fechaVencimiento ? revisionTecnica.fechaVencimiento.format("DD/MM/YYYY") : ''
              vehiculo.estadoRT = revisionTecnica.estado ? revisionTecnica.estado : ''
              vehiculo.identificador = 'Sin Dato'
              vehiculo.tipoid = '1'
              vehiculo.modelo = v.return.modelo ? v.return.modelo : 'Sin Dato'
              vehiculo.marca = v.return.marca ? v.return.marca : 'Sin Dato'
              vehiculo.tipo = v.return.tipoVehi ? v.return.tipoVehi : 'Sin Dato'
              vehiculo.ppu = infoPrt.return.ppu ? infoPrt.return.ppu : 'Sin Dato'
              vehiculo.anno = infoPrt.return.anoFabricacion ? infoPrt.return.anoFabricacion : 'Sin Dato'
              vehiculo.carroceria = _ppu.CARROCERIA // params. carroceria
              //vehiculo.carroceria = infoPrt.return.marcaCarroceria ? infoPrt.return.marcaCarroceria : 'Sin Dato'
              vehiculo.chasis = infoPrt.return.numeroChasis ? infoPrt.return.numeroChasis : 'Sin dato'
              vehiculo.numeroMotor = infoPrt.return.numeroMotor ? infoPrt.return.numeroMotor : 'Sin dato'
              try {
                if (!rechazoAntiguedad.estado && !rechazoCivil.estado && !rechazoDuplicado.estado && !rechazoTipoVehiculo.estado) {
                  if (vehiculoBD != undefined) {
                    if (fechaRegistro.getFullYear() != hoy.getFullYear() || fechaRegistro.getMonth() != hoy.getMonth() || fechaRegistro.getDay() != hoy.getDay()) {
                      controllerLogger.info("Realizando Actualizacion de vehiculo " + vehiculo.ppu + " validado")
                      await this.vehiculoRepository.updateVehiculo(vehiculo)
                    } else {
                      controllerLogger.info("Vehiculo " + vehiculo.ppu + " con Registro de hoy vigente, no se actualiza")
                    }
                  }
                  else {
                    controllerLogger.info("Realizando Insercion de vehiculo " + vehiculo.ppu + " validado")
                    await this.vehiculoRepository.insertVehiculoFV(vehiculo)
                  }
                } else {
                  vehiculo.motivoRechazo = rechazoAntiguedad.estado ? rechazoAntiguedad.motivo :
                    rechazoCivil.estado ? rechazoCivil.motivo :
                      rechazoDuplicado.estado ? rechazoDuplicado.motivo :
                        rechazoTipoVehiculo.estado ? rechazoTipoVehiculo.motivo : ''
                  if (vehiculoBD != undefined) {
                    controllerLogger.info("Realizando Actualizacion de vehiculo " + vehiculo.ppu + " rechazado")
                    await this.vehiculoRepository.updateVehiculo(vehiculo)
                  }
                  else {
                    controllerLogger.info("Realizando Insercion de vehiculo " + vehiculo.ppu + " rechazo")
                    await this.vehiculoRepository.insertVehiculoFV(vehiculo)
                  }
                  delete vehiculo.motivoRechazo
                }
              } catch (ex) {
                controllerLogger.info("Existia la patente, actualizando:  " + vehiculo.ppu + "\n" + ex);
                await this.vehiculoRepository.updateVehiculo(vehiculo)
                  .then((val: any) => {
                    controllerLogger.info("vehiculo " + JSON.stringify(val))
                  })
                  .catch((Ex) => {
                    controllerLogger.info("Error actualizando vehiculo " + vehiculo.ppu + "\n" + Ex)
                  })
              }
              if (!rechazoAntiguedad.estado && !rechazoCivil.estado && !rechazoDuplicado.estado && !rechazoTipoVehiculo.estado) {
                // validacion revision tecnica
                if (vehiculo.estadoRT != 'A') {
                  let vehRTIdx: any = resultado.tiposDocumentosPosiblesAdjuntar.data.map((e: any) => { return e.codigo }).indexOf('VEH_RT')
                  let vehRT: any = resultado.tiposDocumentosPosiblesAdjuntar.data[vehRTIdx]
                  if (vehRT == undefined)
                    resultado.tiposDocumentosPosiblesAdjuntar.data.push({ codigo: "VEH_RT", nombre: "Certificado de revisión Técnica", ppu: [_ppu.ppu] })
                  else
                    resultado.tiposDocumentosPosiblesAdjuntar.data[vehRTIdx].ppu.push(_ppu.ppu)
                }
                //revision de Leasing
                let tenedores: any = v.return.limita.itemLimita[v.return.limita.itemLimita.length - 1].tenedores
                //   controllerLogger.info("Tenedores y nombre: " + JSON.stringify(tenedores) + ", " + tenedores.nombre)
                if (tenedores != undefined && tenedores.itemTenedores[0].nombres != undefined) {
                  let vehClsIdx: any = resultado.tiposDocumentosPosiblesAdjuntar.data.map((e: any) => { return e.codigo }).indexOf('VEH_CLS')
                  let vehCls: any = resultado.tiposDocumentosPosiblesAdjuntar.data[vehClsIdx];
                  let vehAutIdx: any = resultado.tiposDocumentosPosiblesAdjuntar.data.map((e: any) => { return e.codigo }).indexOf('VEH_AUT')
                  let vehAut: any = resultado.tiposDocumentosPosiblesAdjuntar.data[vehAutIdx];
                  let vehRlsIdx: any = resultado.tiposDocumentosPosiblesAdjuntar.data.map((e: any) => { return e.codigo }).indexOf('VEH_RLS')
                  let vehRls: any = resultado.tiposDocumentosPosiblesAdjuntar.data[vehRlsIdx];
                  if (vehCls == undefined)
                    resultado.tiposDocumentosPosiblesAdjuntar.data.push({ codigo: "VEH_CLS", nombre: "Contrato de leasing", ppu: [_ppu.ppu] });
                  else
                    resultado.tiposDocumentosPosiblesAdjuntar.data[vehClsIdx].ppu.push(_ppu.ppu)
                  if (vehAut == undefined)
                    resultado.tiposDocumentosPosiblesAdjuntar.data.push({ codigo: "VEH_AUT", nombre: "Autorización de entidad financiera para salir del país", ppu: [_ppu.ppu] });
                  else
                    resultado.tiposDocumentosPosiblesAdjuntar.data[vehAutIdx].ppu.push(_ppu.ppu)
                  /*if (vehRls == undefined)
                    resultado.tiposDocumentosPosiblesAdjuntar.data.push({ codigo: "VEH_RLS", nombre: "Declaracion de responsabilidad de vehículos bajo régimen de leasing", ppu: [ppuRequest] })
                  else
                    resultado.tiposDocumentosPosiblesAdjuntar.data[vehRlsIdx].ppu.push(ppuRequest)*/
                }
              }
            } else {
              if (!rechazoAntiguedad.estado && !rechazoCivil.estado && !rechazoDuplicado.estado && !rechazoTipoVehiculo.estado) {
                let vehRTIdx: any = resultado.tiposDocumentosPosiblesAdjuntar.data.map((e: any) => { return e.codigo }).indexOf('VEH_RT')
                let vehRT: any = resultado.tiposDocumentosPosiblesAdjuntar.data[vehRTIdx]
                if (vehRT == undefined)
                  resultado.tiposDocumentosPosiblesAdjuntar.data.push({ codigo: "VEH_RT", nombre: "Certificado de revisión Técnica", ppu: [_ppu.ppu] })
                else
                  resultado.tiposDocumentosPosiblesAdjuntar.data[vehRTIdx].ppu.push(_ppu.ppu)
              }
            }
            delete vehiculo.identificador
            delete vehiculo.tipoid
            if (!rechazoAntiguedad.estado && !rechazoCivil.estado && !rechazoDuplicado.estado && !rechazoTipoVehiculo.estado)
              resultado.flotaValidada.push(vehiculo)
          } else {
            if (resultado.flotaRechazada.find((value: any) => {
              if (value.ppu == _ppu.ppu) return value
            }) == undefined) {
              resultado.flotaRechazada.push({ ppu: _ppu.ppu, motivoRechazo: 'Vehículo no encontrado en Registro civil' });
            }
          }
        }
      }
      let capacidadTotal = 0;
      for (let v of resultado.flotaValidada) {
        capacidadTotal += v.capacidadCargaToneladas
        let resumenTipoIdx: any = resultado.resumenFlotaValidadaPorTipo.map((veh: any) => {
          return veh.tipoVehiculo.toLowerCase()
        }).indexOf(v.tipo.toLowerCase())
        let resumenTipo: any = resultado.resumenFlotaValidadaPorTipo[resumenTipoIdx]
        if (resumenTipo == undefined)
          resultado.resumenFlotaValidadaPorTipo.push({ tipoVehiculo: v.tipo.toLowerCase(), cantidad: 1 })
        else
          resultado.resumenFlotaValidadaPorTipo[resumenTipoIdx].cantidad = resumenTipo.cantidad + 1;
      }
      resultado.resumenFlotaValidada = {
        cantidadVehiculos: resultado.flotaValidada.length,
        capacidadCargaToneladas: capacidadTotal
      }

      let vehRTIdx: any = resultado.tiposDocumentosPosiblesAdjuntar.data.map((e: any) => { return e.codigo }).indexOf('VEH_RT')
      let vehClsIdx: any = resultado.tiposDocumentosPosiblesAdjuntar.data.map((e: any) => { return e.codigo }).indexOf('VEH_CLS')
      if (vehRTIdx == -1 && vehClsIdx != -1)
        resultado.tiposDocumentosPosiblesAdjuntar.caso = 1
      else if (vehRTIdx != -1 && vehClsIdx == -1)
        resultado.tiposDocumentosPosiblesAdjuntar.caso = 2
      else if (vehRTIdx != -1 && vehClsIdx != -1)
        resultado.tiposDocumentosPosiblesAdjuntar.caso = 3
      else if (vehRTIdx == -1 && vehClsIdx == -1)
        resultado.tiposDocumentosPosiblesAdjuntar.caso = 0

      if (resultado.flotaRechazada.length == 0) {
        resultado.codigoResultado = 1;
        resultado.descripcionResultado = 'Todas las PPUs validadas correctamente';

        let empresa: any = (await this.vehiculoRepository.obtenerEmpresaByRut(params.rutSujeto))[0];
        if (empresa == undefined) {
          resultado.empresa = "";
        }
        else {
          resultado.empresa = empresa.razon_social;
        }
      }
      if (resultado.flotaValidada.length > 0 && resultado.flotaRechazada.length > 0) {
        resultado.codigoResultado = 3
        resultado.descripcionResultado = 'PPUs parcialmente validadas';
      }
      if (resultado.flotaValidada.length == 0 && params.ppus.length > 0) {
        resultado.codigoResultado = 2
        resultado.descripcionResultado = 'Todas las PPUs rechazadas';
      }
      resultado.cantidadVehiculosRechazados = resultado.flotaRechazada.length
      return resultado;
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
