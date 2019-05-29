import { param, HttpErrors, post, requestBody } from "@loopback/rest";
import * as moment from 'moment';
import { controllerLogger } from "../logger/logger-config";
import { repository } from "@loopback/repository";
import { TraduccionTipoVehiculoEjesCargaRepository, VehiculoRepository } from "../repositories";
import { serviciosGateway } from "../utils/servicios-gateway";
import { C_BLOCK_COMMENT_MODE } from "highlight.js";
import { callbackify } from "util";
import { HttpError } from "http-errors";

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
    // let matrizConversionCapacidadesCargas = await internacionalGateway.obtenerCapacidadesCargas()
    let matrizConversionCapacidadesCargas = await this.traduccionTipoVehiculosEjesCargaRepository.obtenerCapacidadesCargas();
    let tiposVehiculosAceptados = ['camioneta', 'furgon', 'tractocamion', 'camion', 'semiremolque', 'remolque', 'chasis cabinado', 'CAMION']
    try {
      // let params: any = q;
      if (!params || !params.rutSujeto || !params.ppus || params.ppus.length === 0) {
        throw new HttpErrors.NotFound('Parámetros Incorrectos');
      }
      let newtipArr = [], vehiculosTipo2 = [], promisesPpus: any[] = [], ppusProcesadas: any[] = [], promisesPrt: any[] = [], vehiculosValidados: any[] = [], vehiculosValidadosPorTipo: any[] = [], motivosRechazos: any[] = [], totalCarga = 0, vehiculosDocsLeasing: any[] = [], vehiculosDocsRevision: any[] = [], vehiculosValidadosPar: any[] = [], contadorRechazos: any[] = [], contadorParcial: any = [], Noexiste: any[] = [], ppuRech: any[] = [], docLeasing = false, docRevision = false, existe: string;
      existe = "";
      let resultado: any = {};
      resultado.flotaValidada = new Array();
      resultado.tiposDocumentosPosiblesAdjuntar = {};
      resultado.tiposDocumentosPosiblesAdjuntar.data = new Array();
      resultado.flotaRechazada = new Array();
      resultado.codigoResultado = 1;
      resultado.descripcionResultado = 'Todas las PPUs validadas correctamente';
      resultado.resumenFlotaValidadaPorTipo = new Array();

      for (let _ppu of params.ppus) {
        let v: any = await serviciosGateway.obtenerVehiculo(_ppu);
        let infoPrt: any = await serviciosGateway.obtenerRevisionTecnica(_ppu);
        let ppu: any;
        try {
          ppu = v.return.patente.split('-')[0]
        } catch (Ex) {
          controllerLogger.info("Saltando PPU: " + _ppu + " no se encontro en SRCeI");
          continue;
        }
        let ppuDuplicada = ppusProcesadas.find(p => p.ppu == ppu)
        ppusProcesadas.push({ ppu: ppu })
        //Condicion de rechazo, propiedad sea diferente o meratenencia, tipo de vehiculo se valida contra una lista, antiguedad del vehiculo
        if (ppuDuplicada != undefined) {
          resultado.flotaRechazada.push({ ppu: _ppu, motivoRechazo: 'Vehículo duplicado' });
          continue;
        } else {
          if (v.return.marca) {
            let propietario
            let tenedores = v.return.limita.itemLimita[v.return.limita.itemLimita.length - 1].tenedores
            if (tenedores && tenedores.itemTenedores[0].nombres) {
              propietario = tenedores.itemTenedores[0]
            } else {
              let itemPropietario = v.return.propieActual.propact.itemPropact[0]
              propietario = { nombres: itemPropietario.nombres, rut: itemPropietario.rut }
            }
            let limitacionesConcatendas = ''
            let limitaciones = v.return.limita.itemLimita
            let pos = 0
            for (let limitacion of limitaciones) {
              if (limitacion.ACausa) {
                let textoLimitacion = 'ACausa:' + limitacion.ACausa + ', acreedor:' + limitacion.acreedor + ', autorizante:' + limitacion.autorizante + ', causa:' + limitacion.causa + ', comuna:' + limitacion.comuna +
                  ', documento:' + limitacion.documento + ', fecReper:' + limitacion.fecReper + ', fechaDoc:' + limitacion.fechaDoc + ', naturaleza:' + limitacion.naturaleza + ', numReper:' + limitacion.numReper +
                  ', repertorio:' + limitacion.repertorio + ', titulo:' + limitacion.titulo
                if (pos === 0) {
                  limitacionesConcatendas = textoLimitacion
                } else {
                  limitacionesConcatendas = limitacionesConcatendas + ' @ ' + textoLimitacion
                }
                pos++
              }

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
              limitacion: limitacionesConcatendas
            }

            // validacion tipo vehiculo
            if (!tiposVehiculosAceptados.includes(vehiculo.tipo.toLowerCase())) {
              // if (tiposVehiculosAceptados.indexOf(vehiculo.tipo.toLowerCase()) == -1) {
              resultado.flotaRechazada.push({ ppu: _ppu, motivoRechazo: 'Tipo de vehículo no corresponde a solicitud' });
              continue
            }
            // validacion año antiguedad
            if (vehiculo.tipo != 'REMOLQUE' && vehiculo.tipo != 'SEMIREMOLQUE') {
              controllerLogger.info('validacion de años')
              controllerLogger.info('new Date().getFullYear() ' + new Date().getFullYear())
              controllerLogger.info('vehiculo.anno' + vehiculo.anno)
              controllerLogger.info('diferencia: ' + (new Date().getFullYear() - vehiculo.anno));

              if ((new Date().getFullYear() - vehiculo.anno) > 28) {
                resultado.flotaRechazada.push({ ppu: _ppu, motivoRechazo: 'Antigüedad del vehiculo supera la permitida (28 años)' });
                continue
              }
            }
            if (infoPrt && infoPrt.return.revisionTecnica) {
              let revisionTecnica: any = {}
              if (infoPrt && infoPrt.return && infoPrt.return.revisionTecnica && infoPrt.return.revisionTecnica.fechaVencimiento) {
                revisionTecnica.fechaVencimiento = moment(infoPrt.return.revisionTecnica.fechaVencimiento)
                revisionTecnica.estado = infoPrt.return.revisionTecnica.resultado
              }
              controllerLogger.info("Tipo Vehiculo = " + infoPrt.return.tipoVehiculo.toLowerCase().replace(' ', ''));
              let cap = matrizConversionCapacidadesCargas.find((matriz: any) => matriz.tipo_vehiculo === infoPrt.return.tipoVehiculo.toLowerCase().replace(' ', '') && matriz.cantidad_ejes === infoPrt.return.cantEjes)
              vehiculo.carroceria = infoPrt.return.tipoCarroceria ? infoPrt.return.tipoCarroceria : 'Sin dato'
              vehiculo.numeroMotor = infoPrt.return.numeroMotor ? infoPrt.return.numeroMotor : 'Sin dato'
              vehiculo.ejes = infoPrt && infoPrt.return && infoPrt.return.cantEjes ? infoPrt.return.cantEjes : '0'
              vehiculo.capacidadCargaToneladas = cap ? cap.capacidad_carga : 0
              vehiculo.fechaVencimientoRT = revisionTecnica.fechaVencimiento ? revisionTecnica.fechaVencimiento.format("DD/MM/YYYY") : ''
              vehiculo.estadoRT = revisionTecnica.estado ? revisionTecnica.estado : ''
              let info = {}
              vehiculo.carroceria = infoPrt.tipoCarroceria ? infoPrt.return.tipoCarroceria : 'Sin dato'
              vehiculo.numeroMotor = infoPrt.return.numeroMotor ? infoPrt.return.numeroMotor : 'Sin dato'
              vehiculo.ejes = infoPrt && infoPrt.return && infoPrt.return.cantEjes ? infoPrt.return.cantEjes : '0'
              vehiculo.modelo = v.return.modelo ? v.return.modelo : 'Sin Dato'
              vehiculo.marca = v.return.marca ? v.return.marca : 'Sin Dato'
              vehiculo.tipo = v.return.tipoVehi ? v.return.tipoVehi : 'Sin Dato'
              vehiculo.ppu = infoPrt.return.ppu ? infoPrt.return.ppu : 'Sin Dato'
              vehiculo.anno = infoPrt.return.anoFabricacion ? infoPrt.return.anoFabricacion : 'Sin Dato'
              vehiculo.carroceria = infoPrt.return.marcaCarroceria ? infoPrt.return.marcaCarroceria : 'Sin Dato'
              vehiculo.chasis = infoPrt.return.numeroChasis ? infoPrt.return.numeroChasis : 'Sin dato'
              vehiculo.numeroMotor = infoPrt.return.numeroMotor ? infoPrt.return.numeroMotor : 'Sin dato'

              try {
                this.vehiculoRepository.insertVehiculoFV(vehiculo).catch((Ex) => {
                  controllerLogger.info("Existia la patente, actualizando");
                  this.vehiculoRepository.updateVehiculoFV(vehiculo).then((res) => {
                    controllerLogger.info("Vehiculo: " + vehiculo.ppu + " actualizado")
                  });
                });
                controllerLogger.info("Realizando Insercion de vehiculo")
                controllerLogger.info("El valor de Existe es: " + existe);
              } catch (ex) {
                controllerLogger.info("Existia la patente, actualizando");
                await this.vehiculoRepository.updateVehiculoFV(vehiculo);
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
              if (tenedores != undefined && tenedores.itemTenedores[0].nombre) {
                let vehClsIdx: any = resultado.tiposDocumentosPosiblesAdjuntar.data.map((e: any) => { return e.codigo }).indexOf('VEH_CLS')
                let vehCls: any = resultado.tiposDocumentosPosiblesAdjuntar.data[vehClsIdx];
                let vehAutIdx: any = resultado.tiposDocumentosPosiblesAdjuntar.data.map((e: any) => { return e.codigo }).indexOf('VEH_AUT')
                let vehAut: any = resultado.tiposDocumentosPosiblesAdjuntar.data[vehAutIdx];
                let vehRlsIdx: any = resultado.tiposDocumentosPosiblesAdjuntar.map((e: any) => { return e.codigo }).indexOf('VEH_RLS')
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
                  resultado.tiposDocumentosPosiblesAdjuntar.data[vehRlsIdx].push(_ppu)
              }

            } else {
              let vehRTIdx: any = resultado.tiposDocumentosPosiblesAdjuntar.data.map((e: any) => { return e.codigo }).indexOf('VEH_RT')
              let vehRT: any = resultado.tiposDocumentosPosiblesAdjuntar.data[vehRTIdx]
              if (vehRT == undefined)
                resultado.tiposDocumentosPosiblesAdjuntar.data.push({ codigo: "VEH_RT", nombre: "Certificado de revisión Técnica", ppu: [_ppu] })
              else
                resultado.tiposDocumentosPosiblesAdjuntar.data[vehRTIdx].ppu.push(_ppu)
            }
            resultado.flotaValidada.push(vehiculo)
          } else {
            resultado.flotaRechazada.push({ ppu: _ppu, motivoRechazo: 'Vehículo no encontrado en Registro civil' });
          }

        }
      }

      //Falta resumenFlotaValidada con las toneladas
      //falta resumenFlotaValidadaPorTipo
      let capacidadTotal = 0;
      for (let v of resultado.flotaValidada) {
        controllerLogger.info('Tipo de Vehiculo es: ' + v.tipo)
        capacidadTotal += v.capacidadCargaToneladas
        let resumenTipoIdx: any = resultado.resumenFlotaValidadaPorTipo.map((veh: any) => {
          if (veh.tipoVehiculo == undefined) {
            controllerLogger.info('Is Undefined tipo')
            controllerLogger.info('veh.ppu: ' + veh.ppu)
          }
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

      //Falta revisar si estan todas las PPUs validadas, todas rechazadas o parcial

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
