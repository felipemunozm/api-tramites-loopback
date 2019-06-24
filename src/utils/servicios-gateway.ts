import * as builder from 'xmlbuilder';
import * as soap from 'soap';

export class ServiciosGateway {
  constructor() { }

  // private urlPpu = '../wsdl/ppu.wsdl'
  // private urlRT = '../wsdl/revisionTecnica.wsdl'
  // private urlFirmador = '../wsdl/RecibeDocumentoFirma_Api_Tramites.wsdl'
  private urlPpu = 'http://ws.mtt.cl/services/PPUService_API_Tramites?wsdl'
  private urlRT = 'http://ws.mtt.cl/services/ConsultaRevisionTecnica_API_Tramites?wsdl'
  private urlFirmador = 'http://wsqa.mtt.cl:8280/services/RecibeDocumentoFirma_Api_Tramites?wsdl'

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
              patente: ppu
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
          reject(new Error(error1))
          return
        }
        if (!client) {
          reject('No fue posible la conexión con el servicio externo.')
          return
        }
        client.procesarXml({ region: region, sistema: 'tramites', tipoDcto: 'Certificado', materia: 'carga_chile_chile', xml: '<![CDATA[' + xml + ']]>' }, function (error2: any, result: any) {
          console.log('<![CDATA[' + xml + ']]>')
          console.log('*****************************')
          if (error2) {
            console.log(error2)
            reject(new Error(error2))
            return
          }

          console.log(result)
          resolve(result)
        })
      })
    })
  }

  public armarXmlCertificado2(certificado: any): any {
    let xml = builder.create('certificado', { version: '1.0', encoding: 'UTF-8' })
      //xml.ele('certificado').cdata(xml)
      .ele('titulo', certificado.titulo).up()
      .ele('encabezado', certificado.encabezado).up()
      .ele('nro_permiso', certificado.numeroPermiso).up()
      .ele('fecha_inicio', certificado.fechaInicio).up()
      .ele('fecha_fin', certificado.fechaFin).up()
      .ele('nombre_transportista', certificado.nombreTransportista).up()
      .ele('tipo_carga', certificado.tipoCarga).up()
    //.ele('listado_flota', {'etiqueta': 'Listado flota'}).up()
    //xml.ele('certificado').cdata(xml)
    let listado_flota = xml.ele('listado_flota')
    //console..log(certificado.flota)
    certificado.resumen.forEach((item: any) => {
      let itemResumen = listado_flota.ele('item_Tabla_tipo_vehiculo')
      itemResumen.ele('tipoVehiculo', {}, item.tipoVehiculo)
      let listadoVehiculos = itemResumen.ele('listado_vehiculos')
      certificado.flota.forEach((flota: any) => {
        if (item.tipoVehiculo == flota.tipo) {
          let vehiculo = listadoVehiculos.ele('vehiculo')
          vehiculo.ele('marca', {}, flota.marca)
          vehiculo.ele('anno', {}, flota.anno)
          vehiculo.ele('chasis', {}, flota.chasis)
          vehiculo.ele('ejes', {}, flota.ejes)
          vehiculo.ele('capacidad_carga', {}, flota.capacidadCarga)
          vehiculo.ele('patente', {}, flota.patente)
        }
      })
    })

    let resumenFlota = xml.ele('resumen_flota')
    certificado.resumen.forEach((item: any) => {
      let itemResumen = resumenFlota.ele('item_resumen')
      itemResumen.ele('tipoVehiculo', {}, item.tipoVehiculo)
      itemResumen.ele('cantidad_vehiculos', {}, item.cantidadVehiculos)
    })

    //var xml2 = xml.cdata('cerificado')

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
