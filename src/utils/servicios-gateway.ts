import * as builder from 'xmlbuilder';
import * as soap from 'soap';
import { controllerLogger } from '../logger/logger-config';
//import { DataSource } from 'loopback-datasource-juggler';
import { Vehiculo } from '../models';

export class ServiciosGateway {
  constructor(
  ) { }

  // private urlPpu = '../wsdl/ppu.wsdl'
  // private urlRT = '../wsdl/revisionTecnica.wsdl'
  // private urlFirmador = '../wsdl/RecibeDocumentoFirma_Api_Tramites.wsdl'
  private urlPpu = 'http://ws.mtt.cl/services/PPUService_API_Tramites?wsdl'
  private urlRT = 'http://ws.mtt.cl/services/ConsultaRevisionTecnica_API_Tramites?wsdl'
  //QA
  //private urlFirmador = 'http://wsqa.mtt.cl:8280/services/RecibeDocumentoFirma_Api_Tramites?wsdl'
  //PRD
  private urlFirmador = 'http://ws.mtt.cl/services/RecibeDocumentoFirma_Api_Tramites?wsdl'


  public async obtenerVehiculo(ppu: string): Promise<any> {
    return new Promise((resolve, reject) => {
      soap.createClient(this.urlPpu, function (error1, client) {
        if (error1) {
          reject(new Error(error1))
          return
        }
        if (!client) {
          reject('No fue posible la conexión con el servicio externo.')
          return
        }
        client.getPlaca({ ppu: ppu }, function (error2: any, result: any) {
          if (error2) {
            reject(new Error(error2))
            return
          }
          if (result != null) {
            resolve(result)
          } else {
            let response: any = {}
            response.return = {
              patente: ppu + '-'
            }
            resolve(response)
          }

        })
      })
    })
  }

  public async obtenerRevisionTecnica(ppu: string): Promise<any> {
    return new Promise((resolve, reject) => {
      soap.createClient(this.urlRT, function (error1, client) {
        if (error1) {
          reject(new Error(error1))
          return
        }
        if (!client) {
          reject('No fue posible la conexión con el servicio externo.')
          return
        }
        client.consultaRevisionTecnica({ ppu: ppu }, function (error2: any, result: any) {
          if (error2) {

            let response: any = {}
            response.return = {
              patente: ppu
            }
            resolve(response)
          }
          resolve(result)
        })
      })
    })
  }

  public async firmar(region: any, certificado: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let xml = this.armarXmlCertificado2(certificado)
      soap.createClient(this.urlFirmador, function (error1, client) {
        if (error1) {
          controllerLogger.info(error1 + ' - id error:-9')
          return reject(-9)
        }
        if (!client) {
          controllerLogger.info('No fue posible la conexión con el servicio externo - id error:-9')
          return reject(-9)
        }
        client.procesarXml({ region: region, sistema: 'tramites', tipoDcto: 'Certificado', materia: 'carga_chile_chile', xml: '<![CDATA[' + xml + ']]>' }, function (error2: any, result: any) {
          controllerLogger.info('<![CDATA[' + xml + ']]>')
          controllerLogger.info('*****************************')
          if (error2) {
            controllerLogger.info(error2 + ' - id error:-10')
            return reject(-10)
          }
          if (!result) {
            controllerLogger.info('No fue posible la conexión con el servicio externo - id error:-10')
            return reject(-10)
          }
          controllerLogger.info(JSON.stringify(result) + ' - id resp: 1')
          resolve(result)
        })
      })
    })
  }

  public armarXmlCertificado2(certificado: any): any {
    let xml = builder.create('certificado', { version: '1.0', encoding: 'UTF-8' })
      .ele('titulo', certificado.titulo).up()
      .ele('titulo2', certificado.titulo2).up()
      .ele('titulo3', certificado.titulo3).up()
      .ele('encabezado', certificado.encabezado).up()
      .ele('texto_autorizacion', certificado.texto_autorizacion).up()
      .ele('texto_aclarativo', certificado.texto_aclarativo).up()
      .ele('footer', certificado.footer).up()
      .ele('footer2', certificado.footer2).up()
      .ele('nro_permiso_ant', certificado.nro_permiso_ant).up()
      .ele('fecha_inicio', certificado.fecha_inicio).up()
      .ele('fecha_fin', certificado.fecha_fin).up()
      .ele('empresa', certificado.empresa).up()
      .ele('ciudad_origen', certificado.ciudad_origen).up()
      .ele('ciudad_destino', certificado.ciudad_destino).up()

    if (!Array.isArray(certificado.listado_flota) || certificado.listado_flota.length === 0 || certificado.listado_flota === undefined) {
      console.log(certificado.listado_flota)
    }
    let listado_flota = xml.ele('listado_flota')

    certificado.listado_flota.forEach((f: any) => {

      let vehiculo = listado_flota.ele('vehiculo')

      vehiculo.ele('tipo', {}, f.tipo)
      vehiculo.ele('marca', {}, f.marca)
      vehiculo.ele('anno', {}, f.anno)
      vehiculo.ele('chasis', {}, f.chasis)
      vehiculo.ele('carroceria', {}, f.carroceria)
      vehiculo.ele('ejes', {}, f.ejes)
      if (f.toneladas != undefined) {
        vehiculo.ele('carga', {}, f.toneladas).up()
      } else {
        vehiculo.ele('carga', {}, f.carga).up()
      }
      vehiculo.ele('patente', {}, f.patente)
    })

    return xml.end({ pretty: true })
  }

  public allbackToPromise(method: any, ...args: any) {
    return new Promise(function (resolve, reject) {
      return method(...args, function (err: any, result: any) {
        return err ? reject(err) : resolve(result)
      })
    })
  }
}

export const serviciosGateway = new ServiciosGateway();
