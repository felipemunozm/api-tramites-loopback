import { HttpErrors, post, requestBody } from "@loopback/rest";
import * as moment from 'moment';
import { controllerLogger } from "../logger/logger-config";
import { repository, DATE } from "@loopback/repository";
import { TraduccionTipoVehiculoEjesCargaRepository, VehiculoRepository } from "../repositories";
import { serviciosGateway } from "../utils/servicios-gateway";
import { HttpError } from "http-errors";
import { Vehiculo } from "../models";
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
    try {

      if (!params || !params.rutSujeto || !params.ppus || params.ppus.length === 0) {
        throw new HttpErrors.NotFound('Parámetros Incorrectos');
      }
      let ppusProcesadas: any[] = []
      let resultado: any = {};
      let lstVehiculosRechazadosParaPersistir: any[] = []
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


      for (let _ppu of params.ppus) {
        let vehiculoExistente: Vehiculo
        let rechazoTipoVehiculo: Rechazo = new Rechazo(), rechazoAntiguedad: Rechazo = new Rechazo(), rechazoCivil: Rechazo = new Rechazo(), rechazoDuplicado: Rechazo = new Rechazo();
        // let vehiculoBD: any = await this.vehiculoRepository.ObtenerVehiculoPorPPU(_ppu)
        //   .then((v: Vehiculo) => {
        //     controllerLogger.info("El resultado del Vehiculo from BD fue: " + JSON.stringify(v))
        //     vehiculoExistente = v
        //   })
        //   .catch((ex) => {
        //     controllerLogger.info("Exception al traer vehiculo: " + ex)
        //   })
        let vehiculoBD: any = await this.vehiculoRepository.ObtenerVehiculoPorPPU(_ppu)
        if (vehiculoBD.length == 0)
          vehiculoBD = undefined;
        else
          controllerLogger.info('vehiculo BD: ' + JSON.stringify(vehiculoBD[0]));
        let v: any = {
          return: {}
        }
        let fechaRegistro: Date
        if (vehiculoBD != undefined) {
          controllerLogger.info("fecha_vigencia: " + vehiculoBD[0].vigencia_registro)
          fechaRegistro = vehiculoBD[0].vigencia_registro
        }
        else {
          controllerLogger.info('Sin fecha_vigencia, no exite PPU: ' + _ppu + ' en al BD')
          fechaRegistro = new Date('')
        }
        let hoy: Date = new Date();
        controllerLogger.info('fecha: ' + (vehiculoBD ? vehiculoBD[0].vigencia_registro : undefined))
        if (vehiculoBD == undefined) {
          v = await serviciosGateway.obtenerVehiculo(_ppu)
        }
        else {
          if (fechaRegistro.getFullYear() <= hoy.getFullYear() && fechaRegistro.getMonth() <= hoy.getMonth() && fechaRegistro.getDay() < hoy.getDay())
            v = await serviciosGateway.obtenerVehiculo(_ppu)
          else
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
          controllerLogger.info('vehiculo de civil simulado v: ' + JSON.stringify(v))
        }
        controllerLogger.info('Respuesta de Civil: ' + JSON.stringify(v))
        let infoPrt: any = await serviciosGateway.obtenerRevisionTecnica(_ppu);
        let ppu: any;
        try {
          ppu = v.return.patente.split('-')[0]
        } catch (Ex) {
          controllerLogger.info("Saltando PPU: " + _ppu + " no se encontro en SRCeI");
          resultado.flotaRechazada.push({ ppu: _ppu, motivoRechazo: 'Vehículo no encontrado en Registro civil' });
          rechazoCivil.estado = true
          rechazoCivil.motivo = 'Vehículo no encontrado en Registro civil'
          // continue;
        }
        let ppuDuplicada = ppusProcesadas.find(p => p.ppu == ppu)
        ppusProcesadas.push({ ppu: ppu })
        //Condicion de rechazo, propiedad sea diferente o meratenencia, tipo de vehiculo se valida contra una lista, antiguedad del vehiculo
        if (ppuDuplicada != undefined) {
          resultado.flotaRechazada.push({ ppu: _ppu, motivoRechazo: 'Vehículo duplicado' });
          rechazoDuplicado.estado = true
          rechazoDuplicado.motivo = 'Vehículo duplicado'
        } else {
          if (v.return.marca) {
            let merotenedor: any, limitacionesConcatendas: any = ''
            if (vehiculoBD == undefined) {
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
              merotenedor = vehiculoBD[0].merotenedor
              limitacionesConcatendas = vehiculoBD[0].limitaciones
              //asignar merotenedor a v
              if (merotenedor != '') {
                v.return.limita.itemLimita[v.return.limita.itemLimita.length - 1].tenedores = {
                  nombres: vehiculoBD[0].merotenedor,
                  rut: vehiculoBD[0].rut_merotenedor
                }
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
              //capacidadCargaToneladas: 0,
              fechaVencimientoRT: '',
              estadoRT: '',
              nombrePropietario: v.return.propieActual.propact.itemPropact[0].nombres,
              rutPropietario: v.return.propieActual.propact.itemPropact[0].rut,
              fechaVencimientoLS: '',
              limitacion: limitacionesConcatendas,
              merotenedor: merotenedor ? merotenedor.nombres : '',
              rutMerotenedor: merotenedor ? merotenedor.rut : ''
            }
            // validacion tipo vehiculo
            if (!tiposVehiculosAceptados.includes(vehiculo.tipo.toLowerCase())) {
              resultado.flotaRechazada.push({ ppu: _ppu, motivoRechazo: 'Tipo de vehículo no corresponde a solicitud' });
              rechazoTipoVehiculo.estado = true
              rechazoTipoVehiculo.motivo = 'Tipo de vehículo no corresponde a solicitud'
              // continue
            }
            // validacion año antiguedad
            if (vehiculo.tipo != 'REMOLQUE' && vehiculo.tipo != 'SEMIREMOLQUE') {
              controllerLogger.info('validacion de años')
              controllerLogger.info('new Date().getFullYear() ' + new Date().getFullYear())
              controllerLogger.info('vehiculo.anno' + vehiculo.anno)
              controllerLogger.info('diferencia: ' + (new Date().getFullYear() - vehiculo.anno));

              if ((new Date().getFullYear() - vehiculo.anno) > 28) {
                resultado.flotaRechazada.push({ ppu: _ppu, motivoRechazo: 'Antigüedad del vehiculo supera la permitida (28 años)' });
                rechazoAntiguedad.estado = true
                rechazoAntiguedad.motivo = 'Antigüedad del vehiculo supera la permitida (28 años)'
                // continue
              }
            }
            if (infoPrt && infoPrt.return.revisionTecnica) {
              let revisionTecnica: any = {}
              if (infoPrt && infoPrt.return && infoPrt.return.revisionTecnica && infoPrt.return.revisionTecnica.fechaVencimiento) {
                revisionTecnica.fechaVencimiento = moment(infoPrt.return.revisionTecnica.fechaVencimiento)
                revisionTecnica.estado = infoPrt.return.revisionTecnica.resultado
              }
              controllerLogger.info("Tipo Vehiculo = " + infoPrt.return.tipoVehiculo.toLowerCase().replace(' ', ''));
              let cap = matrizConversionCapacidadesCargas.find((matriz: any) => matriz.tipo_vehiculo.toLowerCase() === v.return.tipoVehi.toLowerCase().replace(' ', '') && matriz.cantidad_ejes === infoPrt.return.cantEjes)
              vehiculo.carroceria = infoPrt.return.tipoCarroceria ? infoPrt.return.tipoCarroceria : 'Sin dato'
              vehiculo.numeroMotor = infoPrt.return.numeroMotor ? infoPrt.return.numeroMotor : 'Sin dato'
              vehiculo.ejes = infoPrt && infoPrt.return && infoPrt.return.cantEjes ? infoPrt.return.cantEjes : '0'
              vehiculo.capacidadCargaToneladas = cap ? cap.capacidad_carga : 0
              vehiculo.fechaVencimientoRT = revisionTecnica.fechaVencimiento ? revisionTecnica.fechaVencimiento.format("DD/MM/YYYY") : ''
              vehiculo.estadoRT = revisionTecnica.estado ? revisionTecnica.estado : ''
              vehiculo.identificador = 'Sin Dato'
              vehiculo.tipoid = '1'
              // vehiculo.propietario = v.return.propieActual.propact.itemPropact[0].nombres
              let info = {}
              vehiculo.modelo = v.return.modelo ? v.return.modelo : 'Sin Dato'
              vehiculo.marca = v.return.marca ? v.return.marca : 'Sin Dato'
              vehiculo.tipo = v.return.tipoVehi ? v.return.tipoVehi : 'Sin Dato'
              vehiculo.ppu = infoPrt.return.ppu ? infoPrt.return.ppu : 'Sin Dato'
              vehiculo.anno = infoPrt.return.anoFabricacion ? infoPrt.return.anoFabricacion : 'Sin Dato'
              vehiculo.carroceria = infoPrt.return.marcaCarroceria ? infoPrt.return.marcaCarroceria : 'Sin Dato'
              vehiculo.chasis = infoPrt.return.numeroChasis ? infoPrt.return.numeroChasis : 'Sin dato'
              vehiculo.numeroMotor = infoPrt.return.numeroMotor ? infoPrt.return.numeroMotor : 'Sin dato'
              try {
                controllerLogger.info("resultado validaciones rechazo: " + (!rechazoAntiguedad.estado && !rechazoCivil.estado && !rechazoDuplicado.estado && !rechazoTipoVehiculo.estado))
                if (!rechazoAntiguedad.estado && !rechazoCivil.estado && !rechazoDuplicado.estado && !rechazoTipoVehiculo.estado) {
                  await this.vehiculoRepository.insertVehiculoFV(vehiculo)
                    .then((value: any) => {
                      controllerLogger.info("Inserción exitosa: " + value)
                    })
                    .catch((Ex) => {
                      if (!v.return.fromDB) {
                        controllerLogger.info("Existia la patente, actualizando\n el Error es: " + Ex);
                        // this.vehiculoRepository.updateVehiculoFV(vehiculo).then((res) => {
                        this.vehiculoRepository.updateVehiculo(vehiculo).then((res) => {
                          controllerLogger.info("Vehiculo: " + vehiculo.ppu + " actualizado")
                        });
                      }
                    });
                  controllerLogger.info("Realizando Insercion de vehiculo")
                } else {
                  vehiculo.motivoRechazo = rechazoAntiguedad.estado ? rechazoAntiguedad.motivo :
                    rechazoCivil.estado ? rechazoCivil.motivo :
                      rechazoDuplicado.estado ? rechazoDuplicado.motivo :
                        rechazoTipoVehiculo.estado ? rechazoTipoVehiculo.motivo : ''
                  await this.vehiculoRepository.insertVehiculoFV(vehiculo)
                    .then((value: any) => {
                      controllerLogger.info("Inserción exitosa: " + value)
                    })
                    .catch((Ex) => {
                      controllerLogger.info("Existia la patente, actualizando\n el Error es: " + Ex);
                      this.vehiculoRepository.updateVehiculo(vehiculo).then((res) => {
                        // this.vehiculoRepository.updateVehiculoFV(vehiculo).then((res) => {
                        controllerLogger.info("Vehiculo: " + vehiculo.ppu + " actualizado")
                      });
                    });
                  controllerLogger.info("Realizando Insercion de vehiculo")
                  delete vehiculo.motivoRechazo
                }
              } catch (ex) {
                controllerLogger.info("Existia la patente, actualizando");
                // this.vehiculoRepository.updateVehiculoFV(vehiculo)
                await this.vehiculoRepository.updateVehiculo(vehiculo)
                  .then((val: any) => {
                    controllerLogger.info("vehiculo " + JSON.stringify(val))
                  })
                  .catch((Ex) => {
                    controllerLogger.info("Error actualizando vehiculo" + Ex)
                  })
              }
              // validacion revision tecnica
              if (vehiculo.estadoRT != 'A') {
                let vehRTIdx: any = resultado.tiposDocumentosPosiblesAdjuntar.data.map((e: any) => { return e.codigo }).indexOf('VEH_RT')
                let vehRT: any = resultado.tiposDocumentosPosiblesAdjuntar.data[vehRTIdx]
                if (vehRT == undefined)
                  resultado.tiposDocumentosPosiblesAdjuntar.data.push({ codigo: "VEH_RT", nombre: "Certificado de revisión Técnica", ppu: [_ppu] })
                else
                  resultado.tiposDocumentosPosiblesAdjuntar.data[vehRTIdx].ppu.push(_ppu)
              }
              //revision de Leasing
              let tenedores: any = v.return.limita.itemLimita[v.return.limita.itemLimita.length - 1].tenedores
              if (tenedores != undefined)
                controllerLogger.info("Tenedores y nombre: " + JSON.stringify(tenedores) + ", " + tenedores.nombre)
              if (tenedores != undefined && tenedores.nombres != undefined) {
                let vehClsIdx: any = resultado.tiposDocumentosPosiblesAdjuntar.data.map((e: any) => { return e.codigo }).indexOf('VEH_CLS')
                let vehCls: any = resultado.tiposDocumentosPosiblesAdjuntar.data[vehClsIdx];
                let vehAutIdx: any = resultado.tiposDocumentosPosiblesAdjuntar.data.map((e: any) => { return e.codigo }).indexOf('VEH_AUT')
                let vehAut: any = resultado.tiposDocumentosPosiblesAdjuntar.data[vehAutIdx];
                let vehRlsIdx: any = resultado.tiposDocumentosPosiblesAdjuntar.data.map((e: any) => { return e.codigo }).indexOf('VEH_RLS')
                let vehRls: any = resultado.tiposDocumentosPosiblesAdjuntar.data[vehRlsIdx];
                if (vehCls == undefined)
                  resultado.tiposDocumentosPosiblesAdjuntar.data.push({ codigo: "VEH_CLS", nombre: "Contrato de leasing", ppu: [_ppu] });
                else
                  resultado.tiposDocumentosPosiblesAdjuntar.data[vehClsIdx].ppu.push(_ppu)
                if (vehAut == undefined)
                  resultado.tiposDocumentosPosiblesAdjuntar.data.push({ codigo: "VEH_AUT", nombre: "Autorización de entidad financiera para salir del país", ppu: [_ppu] });
                else
                  resultado.tiposDocumentosPosiblesAdjuntar.data[vehAutIdx].ppu.push(_ppu)
                if (vehRls == undefined)
                  resultado.tiposDocumentosPosiblesAdjuntar.data.push({ codigo: "VEH_RLS", nombre: "Declaracion de responsabilida de vehículos bajo régimen de leasing", ppu: [_ppu] })
                else
                  resultado.tiposDocumentosPosiblesAdjuntar.data[vehRlsIdx].ppu.push(_ppu)
              }
            } else {
              let vehRTIdx: any = resultado.tiposDocumentosPosiblesAdjuntar.data.map((e: any) => { return e.codigo }).indexOf('VEH_RT')
              let vehRT: any = resultado.tiposDocumentosPosiblesAdjuntar.data[vehRTIdx]
              if (vehRT == undefined)
                resultado.tiposDocumentosPosiblesAdjuntar.data.push({ codigo: "VEH_RT", nombre: "Certificado de revisión Técnica", ppu: [_ppu] })
              else
                resultado.tiposDocumentosPosiblesAdjuntar.data[vehRTIdx].ppu.push(_ppu)
            }
            delete vehiculo.identificador
            delete vehiculo.tipoid
            if (!rechazoAntiguedad.estado && !rechazoCivil.estado && !rechazoDuplicado.estado && !rechazoTipoVehiculo.estado)
              resultado.flotaValidada.push(vehiculo)
          } else {
            resultado.flotaRechazada.push({ ppu: _ppu, motivoRechazo: 'Vehículo no encontrado en Registro civil' });
          }
        }
      }
      let capacidadTotal = 0;
      for (let v of resultado.flotaValidada) {
        controllerLogger.info('Tipo de Vehiculo es: ' + v.tipo)
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
      }
      if (resultado.flotaValidada.length > 0 && resultado.flotaRechazada.length > 0) {
        resultado.codigoResultado = 3
        resultado.descripcionResultado = 'PPUs parcialmente validadas';
      }
      if (resultado.flotaValidada.length == 0 && params.ppus.length > 0) {
        resultado.codigoResultado = 2
        resultado.descripcionResultado = 'Todas las PPUs rechazadas';
      }
      controllerLogger.info("resultado es: " + JSON.stringify(resultado));
      resultado.cantidadVehiculosRechazados = resultado.flotaRechazada.length
      return resultado;
    } catch (ex) {
      console.log(ex)
      controllerLogger.info(ex.toString());
      let error: HttpError;
      if (ex.status == 404)
        error = new HttpErrors.NotFound(ex.toString());
      else
        error = new HttpErrors.InternalServerError(ex.toString());
      // error.status = ex.status;
      error.statusCode = ex.status;
      // error.headers
      throw error;
    }
  }
}
