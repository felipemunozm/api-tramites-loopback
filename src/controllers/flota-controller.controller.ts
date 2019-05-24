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
        // throw { error: { statusCode: 502, message: 'Parámetros incorrectos' } };
        throw new HttpErrors.NotFound('Parámetros Incorrectos');

        // let e: HttpError = new HttpErrors.HttpError('Parámetros incorrectoss');
        // let e: HttpError = new HttpErrors.NotFound('Parámetros incorrectoss');
        // e.statusCode = 404;
        // e.status = 404;
        // throw e;
      }
      let newtipArr = [], vehiculosTipo2 = [], vehiculosRechazados3: any[] = [], promisesPpus: any[] = [], ppusProcesadas: any[] = [], promisesPrt: any[] = [], vehiculosRechazados: any[] = [], vehiculosRechazados2: any[] = [], vehiculosValidados: any[] = [], vehiculosValidadosPorTipo: any[] = [], motivosRechazos: any[] = [], totalCarga = 0, vehiculosDocsLeasing: any[] = [], vehiculosDocsRevision: any[] = [], vehiculosValidadosPar: any[] = [], contadorRechazos: any[] = [], contadorParcial: any = [], Noexiste: any[] = [], ppuRech: any[] = [], docLeasing = false, docRevision = false, existe: string;
      existe = "";
      // params.ppus.forEach((ppu: any) => {
      //   promisesPpus.push(serviciosGateway.obtenerVehiculo(ppu))
      //   controllerLogger.info(ppu + "PPU en el forEach")
      //   promisesPrt.push(serviciosGateway.obtenerRevisionTecnica(ppu))
      // })

      let cantiVehiculoValidadosPar: any;
      let resultado: any = {};
      let tiposDocumentosPosiblesAdjuntar: any = { caso: 0, data: [] }
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
        let ppuDuplicada = ppusProcesadas.find(p => p.ppu === ppu)
        ppusProcesadas.push({ ppu: ppu })

        if (ppuDuplicada != undefined) {
          let vehiculo = {
            ppu: ppu,
            motivoRechazo: 'Vehículo duplicado'
          }
          vehiculosRechazados2.push(vehiculo)
          ppuRech.push(vehiculo.ppu)
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
            // limitaciones.forEach(function (limitacion: any) {
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
            //Validacion propietario
            if (params.rutSujeto !== propietario.rut) {
              let vehiculo: any = {
                ppu: ppu,
                motivoRechazo: 'Propietario del vehículo no corresponde a persona/empresa solicitante'
              }
              vehiculosRechazados2.push(vehiculo)
              ppuRech.push(vehiculo.ppu)
              //motivosRechazos.push('Propietario del vehículo no corresponde a persona/empresa solicitante')
            }

            // validacion tipo vehiculo
            if (tiposVehiculosAceptados.indexOf(vehiculo.tipo.toLowerCase()) === -1) {
              let vehiculo = {
                ppu: ppu,
                motivoRechazo: 'Tipo de vehículo no corresponde a solicitud'
              }
              var tipoAcep: any = 1
              ppuRech.push(vehiculo.ppu)
              vehiculosRechazados2.push(vehiculo)
            }
            // validacion año antiguedad
            if (vehiculo.tipo !== 'REMOLQUE' && vehiculo.tipo !== 'SEMIREMOLQUE') {
              console.log('validacion de años')
              console.log('new Date().getFullYear() ' + new Date().getFullYear())
              console.log('vehiculo.anno' + vehiculo.anno)
              console.log('diferencia: ' + (new Date().getFullYear() - vehiculo.anno));

              if ((new Date().getFullYear() - vehiculo.anno) > 28) {
                let vehiculo = {
                  ppu: ppu,
                  motivoRechazo: 'Antigüedad del vehiculo supera la permitida (28 años)'
                }
                var annoAnt: any = 1
                ppuRech.push(vehiculo.ppu)
                vehiculosRechazados2.push(vehiculo)
              }

              if (params.rutSujeto != propietario.rut && vehiculosRechazados2.length >= 1) {
                console.log("cumple!")
                let vehiculo = {
                  ppu: ppu,
                  motivoRechazo: 'Propietario del vehículo no corresponde a persona/empresa solicitante'
                }
                vehiculosRechazados3.push(vehiculo)
              } else if (params.rutSujeto == propietario.rut && tiposVehiculosAceptados.indexOf(vehiculo.tipo.toLowerCase()) === -1 && vehiculosRechazados2.length >= 1) {
                console.log("No cumple!")
                let vehiculo = {
                  ppu: ppu,
                  motivoRechazo: 'Tipo de vehículo no corresponde a solicitud'
                }
                vehiculosRechazados3.push(vehiculo)
              } else if (params.rutSujeto == propietario.rut && (new Date().getFullYear() - vehiculo.anno) > 28) {
                console.log("No cumple!")
                let vehiculo = {
                  ppu: ppu,
                  motivoRechazo: 'Antigüedad del vehiculo supera la permitida (28 años)'
                }
                vehiculosRechazados3.push(vehiculo)
              }
            }
            console.log("Arriba esta resultado")
            console.log()

            if (infoPrt && infoPrt.return.revisionTecnica) {
              let revisionTecnica: any = {}
              if (infoPrt && infoPrt.return && infoPrt.return.revisionTecnica && infoPrt.return.revisionTecnica.fechaVencimiento) {
                revisionTecnica.fechaVencimiento = moment(infoPrt.return.revisionTecnica.fechaVencimiento)
                revisionTecnica.estado = infoPrt.return.revisionTecnica.resultado
              }
              let cap = matrizConversionCapacidadesCargas.find((matriz: any) => matriz.tipo_vehiculo === infoPrt.return.tipoVehiculo.toLowerCase() && matriz.cantidad_ejes === infoPrt.return.cantEjes)
              vehiculo.carroceria = infoPrt.return.tipoCarroceria ? infoPrt.return.tipoCarroceria : 'Sin dato'
              vehiculo.numeroMotor = infoPrt.return.numeroMotor ? infoPrt.return.numeroMotor : 'Sin dato'
              vehiculo.ejes = infoPrt && infoPrt.return && infoPrt.return.cantEjes ? infoPrt.return.cantEjes : '0'
              vehiculo.capacidadCargaToneladas = cap ? cap.capacidad_carga : 0
              vehiculo.fechaVencimientoRT = revisionTecnica.fechaVencimiento ? revisionTecnica.fechaVencimiento.format("DD/MM/YYYY") : ''
              vehiculo.estadoRT = revisionTecnica.estado ? revisionTecnica.estado : ''
              console.log("===================")
              let info = {}
              vehiculo.carroceria = infoPrt.tipoCarroceria ? infoPrt.return.tipoCarroceria : 'Sin dato'
              vehiculo.numeroMotor = infoPrt.return.numeroMotor ? infoPrt.return.numeroMotor : 'Sin dato'
              vehiculo.ejes = infoPrt && infoPrt.return && infoPrt.return.cantEjes ? infoPrt.return.cantEjes : '0'
              // vehiculo.tipoid = '1'
              vehiculo.modelo = v.return.modelo ? v.return.modelo : 'Sin Dato'
              // vehiculo.identificador = 'Sin Dato'
              vehiculo.marca = v.return.marca ? v.return.marca : 'Sin Dato'
              vehiculo.tipo = v.return.tipoVehi ? v.return.tipoVehi : 'Sin Dato'
              vehiculo.ppu = infoPrt.return.ppu ? infoPrt.return.ppu : 'Sin Dato'
              vehiculo.anno = infoPrt.return.anoFabricacion ? infoPrt.return.anoFabricacion : 'Sin Dato'
              vehiculo.carroceria = infoPrt.return.marcaCarroceria ? infoPrt.return.marcaCarroceria : 'Sin Dato'
              // vehiculo.propietario = v.return.propieActual.propact.itemPropact[0].nombres
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
              if (vehiculo.estadoRT === 'R') {
                docRevision = true
                vehiculo.observacion = 'Revisión Técnica Rechazada o Vencida, debe adjuntar Certificado de RT para este vehiculo'
                vehiculosDocsRevision.push(ppu)
              }


            } else {
              docRevision = true
              vehiculo.observacion = 'Vehículo sin datos en revisión técnica'
              vehiculosDocsRevision.push(ppu)
            }

            //Logica para definir si es aprobacion parcial o rechazo completo
            console.log(vehiculosValidados.length)
            console.log(vehiculosRechazados2.length)
            console.log(propietario.rut)
            //contRechazo = 0
            var contadorAprobacionParcial: any = 0
            if (propietario.rut == params.rutSujeto && vehiculosRechazados2.length < 0 && vehiculosValidados.length > 0) {
              contadorAprobacionParcial = "OK"
              contadorParcial.push(contadorAprobacionParcial)
            }
            if (propietario.rut != params.rutSujeto && vehiculosRechazados2.length > 0 && vehiculosValidados.length <= 0) {
              contadorAprobacionParcial = "NOK"
              contadorRechazos.push(contadorAprobacionParcial)
            }
            if (propietario.rut == params.rutSujeto && vehiculosRechazados2.length > 0 && vehiculosValidados.length <= 0) {
              contadorAprobacionParcial = "NOK"
              contadorRechazos.push(contadorAprobacionParcial)
            }
            if (propietario.rut == params.rutSujeto && vehiculosRechazados2.length <= 0 && vehiculosValidados.length > 0 && annoAnt != 1 && tipoAcep != 1) {
              contadorAprobacionParcial = "OK"
              contadorParcial.push(contadorAprobacionParcial)
            }
            if (propietario.rut == params.rutSujeto && vehiculosRechazados2.length > 0 && vehiculosValidados.length > 0 && annoAnt == 1) {
              contadorAprobacionParcial = "NOK"
              contadorRechazos.push(contadorAprobacionParcial)
            }
            if (propietario.rut == params.rutSujeto && vehiculosRechazados2.length > 0 && vehiculosValidados.length > 0 && tipoAcep == 1) {
              contadorAprobacionParcial = "NOK"
              contadorRechazos.push(contadorAprobacionParcial)
            }
            if (propietario.rut != params.rutSujeto && vehiculosRechazados2.length > 0 && annoAnt == 1) {
              contadorAprobacionParcial = "NOK"
              contadorRechazos.push(contadorAprobacionParcial)
            }
            if (propietario.rut != params.rutSujeto && vehiculosRechazados2.length > 0 && tipoAcep == 1) {
              contadorAprobacionParcial = "NOK"
              contadorRechazos.push(contadorAprobacionParcial)
            }
            if (propietario.rut == params.rutSujeto && vehiculosRechazados2.length <= 0) {
              contadorAprobacionParcial = "OK"
              contadorParcial.push(contadorAprobacionParcial)
            }
            if (propietario.rut !== params.rutSujeto) {
              contadorAprobacionParcial = "NOK"
              contadorRechazos.push(contadorAprobacionParcial)
            }
            if (propietario.rut == params.rutSujeto && annoAnt != 1 && tipoAcep != 1) {
              contadorAprobacionParcial = "OK"
              contadorParcial.push(contadorAprobacionParcial)
            }
            if (propietario.rut == params.rutSujeto && annoAnt == 1 && tipoAcep != 1) {
              contadorAprobacionParcial = "NOK"
              contadorRechazos.push(contadorAprobacionParcial)
            }
            if (propietario.rut == params.rutSujeto && annoAnt != 1 && tipoAcep == 1) {
              contadorAprobacionParcial = "NOK"
              contadorRechazos.push(contadorAprobacionParcial)
            }
            if (propietario.rut == params.rutSujeto && annoAnt == 1 && tipoAcep == 1) {
              contadorAprobacionParcial = "NOK"
              contadorRechazos.push(contadorAprobacionParcial)
            }
            if (propietario.rut != params.rutSujeto && annoAnt == 1 && tipoAcep == 1) {
              contadorAprobacionParcial = "NOK"
              contadorRechazos.push(contadorAprobacionParcial)
            }
            if (propietario.rut != params.rutSujeto && annoAnt != 1 && tipoAcep == 1) {
              contadorAprobacionParcial = "NOK"
              contadorRechazos.push(contadorAprobacionParcial)
            }
            if (propietario.rut != params.rutSujeto && annoAnt == 1 && tipoAcep != 1) {
              contadorAprobacionParcial = "NOK"
              contadorRechazos.push(contadorAprobacionParcial)
            }
            if (propietario.rut != params.rutSujeto && annoAnt != 1 && tipoAcep != 1) {
              contadorAprobacionParcial = "NOK"
              contadorRechazos.push(contadorAprobacionParcial)
            }

            console.log("!!!!!!")
            console.log(contadorRechazos.length)
            console.log(contadorParcial.length)
            console.log("!!!!!!")
            //Fin

            if (vehiculosRechazados2.length > 0 && propietario.rut == params.rutSujeto) {
              vehiculosValidadosPar.push(vehiculo)
              let cantiVehiculoValidadosPar = vehiculosValidadosPar.length
              //cantiVehiculoValidadosParR = contRechazo
            } else if (vehiculosRechazados2.length <= 0 && propietario.rut == params.rutSujeto) {
              vehiculosValidadosPar.push(vehiculo)
              let cantiVehiculoValidadosPar: any = vehiculosValidadosPar.length
              //cantiVehiculoValidadosParR = contRechazo
            }
            //Toneladas validadas
            if (motivosRechazos.length > 0) {
              vehiculo.motivoRechazo = motivosRechazos.concat().toString()
              vehiculosRechazados3.push(vehiculo)
              console.log("ToneladasNO")
            } else if (contadorParcial.length > 0 && propietario.rut == params.rutSujeto && annoAnt != 1 && tipoAcep != 1) {
              console.log("Toneladas")
              console.log(vehiculo.capacidadCargaToneladas)
              totalCarga = totalCarga + vehiculo.capacidadCargaToneladas
              console.log(totalCarga)
              vehiculosValidados.push(vehiculo)

              //Logica para pintar los vehiculos aprobados

              let vehiculosTipos: any = vehiculosValidadosPorTipo.filter((vehi: any) => vehi.tipoVehiculo.toLowerCase() == vehiculo.tipo.toLowerCase())

              if (vehiculosTipos.length === 0 || vehiculosTipos == undefined) {
                console.log("entro if")
                let vehiculoTipo: any = {}
                vehiculoTipo.tipoVehiculo = vehiculo.tipo.toLowerCase()
                vehiculoTipo.cantidad = 1
                vehiculosValidadosPorTipo.push(vehiculoTipo)

              } else if (propietario.rut === params.rutSujeto && tipoAcep != 1) {
                console.log("entro else")
                console.log(vehiculosTipos)
                vehiculosTipos[0].cantidad = vehiculosTipos[0].cantidad + 1
              }

              if (tenedores && tenedores.itemTenedores[0].nombres) {
                docLeasing = true
                vehiculosDocsLeasing.push(ppu)
              }

            }

          } else {

            let vehiculo = {
              ppu: ppu,
              motivoRechazo: 'Vehículo no encontrado en Registro civil'
            }
            existe = "no";
            Noexiste.push(existe)
            ppuRech.push(vehiculo.ppu)
            console.log(v.return.patente)
            vehiculosRechazados2.push(vehiculo)
            vehiculosRechazados3.push(vehiculo)

          }

        }
        if (docLeasing) {
          let documentoAdjuntar: any = {}
          documentoAdjuntar.codigo = 'VEH_CLS'
          documentoAdjuntar.nombre = 'Contrato de leasing'
          documentoAdjuntar.ppu = vehiculosDocsLeasing
          tiposDocumentosPosiblesAdjuntar.data.push(documentoAdjuntar)
          let documentoAdjuntar2: any = {}
          documentoAdjuntar2.codigo = 'VEH_AUT'
          documentoAdjuntar2.nombre = 'Autorización de entidad financiera para salir del país'
          documentoAdjuntar2.ppu = vehiculosDocsLeasing
          tiposDocumentosPosiblesAdjuntar.data.push(documentoAdjuntar2)
        }
        if (docRevision) {
          let documentoAdjuntar: any = {}
          documentoAdjuntar.codigo = 'VEH_RT'
          documentoAdjuntar.nombre = 'Certificado de revisión técnica'
          documentoAdjuntar.ppu = vehiculosDocsRevision
          tiposDocumentosPosiblesAdjuntar.data.push(documentoAdjuntar)
        }

        //contabilizacion de Rechazos
        console.log(ppuRech.length)
        let ContadorRechazo: any = 0
        let ContadorRechazo2: any = 0
        if (vehiculosRechazados3.length >= 1 && ppuRech.length >= 1) {
          let ContadorRechazo2: any = ppuRech.filter((ppu, indiceActual, arreglo) => arreglo.indexOf(ppu) === indiceActual)
          ContadorRechazo = ContadorRechazo2.length
          console.log("tamos limpiando ppu")
          //vehiculosRechazados3.push(vehiculosRechazados2)
        } else if (vehiculosRechazados3.length <= 1 && ppuRech.length >= 1) {
          vehiculosRechazados3.push(vehiculosRechazados2)
          ContadorRechazo = vehiculosRechazados2.length
          console.log("tamos limpiando nada")
        }
        console.log(vehiculosDocsRevision)
        console.log(ContadorRechazo2)
        //console.log (vehiculosRechazados2)
        if (vehiculosRechazados3.length > 0 && ContadorRechazo2.length > 0) {
          vehiculosRechazados.push(vehiculosRechazados2)
        }

        if (docLeasing && !docRevision && contadorParcial > 1) {
          tiposDocumentosPosiblesAdjuntar.caso = 1
        } else if (!docLeasing && docRevision && contadorParcial > 1) {
          tiposDocumentosPosiblesAdjuntar.caso = 2
        } else if (docLeasing && docRevision && contadorParcial > 1) {
          tiposDocumentosPosiblesAdjuntar.caso = 3
        }
        controllerLogger.info("El valor de Existe es: " + existe);
        if (vehiculosRechazados2.length == 0) {
          resultado.codigoResultado = 1
          resultado.descripcionResultado = 'Todas las PPUs validadas correctamente'
          resultado.flotaValidada = vehiculosValidados
          resultado.resumenFlotaValidada = {
            cantidadVehiculos: vehiculosValidados.length,
            capacidadCargaToneladas: totalCarga
          }
          resultado.resumenFlotaValidadaPorTipo = vehiculosValidadosPorTipo
          /*resultado.resumenFlotaValidadaPorTipo = {
            tipo: newTipo,
            cantidad: cantiVehiculoValidadosPar
          } */
          resultado.tiposDocumentosPosiblesAdjuntar = tiposDocumentosPosiblesAdjuntar
        } else if (contadorParcial.length <= 0 && contadorRechazos.length > 0) {
          resultado.codigoResultado = 2
          resultado.descripcionResultado = 'Todas las PPUs rechazadas'
          //resultado.flotaRechazada.ppu = ContadorRechazo2
          //resultado.flotaRechazada.motivos = vehiculosRechazados
          resultado.flotaRechazada = vehiculosRechazados3
          /*resultado.flotaRechazada ={
            PPU: ppus,
            Motivos: vehiculosRechazados
          }*/
          resultado.cantidadVehiculosRechazados = ContadorRechazo
        } else if (contadorParcial.length <= 0 && contadorRechazos.length > 0 && existe.length > 0) {
          resultado.codigoResultado = 2
          resultado.descripcionResultado = 'Todas las PPUs rechazadas'
          //resultado.flotaRechazada.ppu = ContadorRechazo2
          //resultado.flotaRechazada.motivos = vehiculosRechazados
          resultado.flotaRechazada = vehiculosRechazados3
          /*resultado.flotaRechazada ={
            PPU: ppus,
            Motivos: vehiculosRechazados
          }*/
          resultado.cantidadVehiculosRechazados = ContadorRechazo
        } else if (contadorParcial.length <= 0 && existe.length > 0) {
          resultado.codigoResultado = 2
          resultado.descripcionResultado = 'Todas las PPUs rechazadas'
          //resultado.flotaRechazada.ppu = ContadorRechazo2
          //resultado.flotaRechazada.motivos = vehiculosRechazados
          resultado.flotaRechazada = vehiculosRechazados3
          /*resultado.flotaRechazada ={
            PPU: ppus,
            Motivos: vehiculosRechazados
          }*/
          resultado.cantidadVehiculosRechazados = ContadorRechazo
        } else if (contadorParcial.length >= 1) {
          resultado.codigoResultado = 3
          resultado.descripcionResultado = 'PPUs parcialmente validadas'
          resultado.flotaValidada = vehiculosValidadosPar
          resultado.resumenFlotaValidada = {
            cantidadVehiculos: cantiVehiculoValidadosPar,
            capacidadCargaToneladas: totalCarga
          }
          resultado.resumenFlotaValidadaPorTipo = vehiculosValidadosPorTipo
          /*resultado.resumenFlotaValidadaPorTipo = {
            tipo: newTipo,
            cantidad: cantiVehiculoValidadosPar
          } */
          //resultado.flotaRechazada.ppu = ContadorRechazo2
          //resultado.flotaRechazada.motivos = vehiculosRechazados
          resultado.flotaRechazada = vehiculosRechazados3
          /*resultado.flotaRechazada ={
            PPU: ppus,
            Motivos: vehiculosRechazados
          }*/
          resultado.cantidadVehiculosRechazados = ContadorRechazo
          resultado.tiposDocumentosPosiblesAdjuntar = tiposDocumentosPosiblesAdjuntar
        } else if (contadorParcial.length >= 1 && existe.length >= 1) {
          resultado.codigoResultado = 3
          resultado.descripcionResultado = 'PPUs parcialmente validadas'
          resultado.flotaValidada = vehiculosValidadosPar;
          resultado.resumenFlotaValidada = {
            cantidadVehiculos: cantiVehiculoValidadosPar,
            capacidadCargaToneladas: totalCarga
          }
          resultado.resumenFlotaValidadaPorTipo = vehiculosValidadosPorTipo
          /*resultado.resumenFlotaValidadaPorTipo = {
            tipo: newTipo,
            cantidad: cantiVehiculoValidadosPar
          } */
          //resultado.flotaRechazada.ppu = ContadorRechazo2
          //resultado.flotaRechazada.motivos = vehiculosRechazados
          resultado.flotaRechazada = vehiculosRechazados3
          /*resultado.flotaRechazada ={
            PPU: ppus,
            Motivos: vehiculosRechazados
          }*/
          resultado.cantidadVehiculosRechazados = ContadorRechazo
          resultado.tiposDocumentosPosiblesAdjuntar = tiposDocumentosPosiblesAdjuntar
        }
      }
      controllerLogger.info("resultado es: " + JSON.stringify(resultado.toString()));
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
