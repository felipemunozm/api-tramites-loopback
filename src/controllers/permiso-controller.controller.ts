import { post, requestBody, HttpErrors } from "@loopback/rest";
import { TipoTramiteRepository, IntermediarioTramiteRepository, RegionRepository, AnalistaRepository, EmpresaRepository, TipoIdPersonaRepository, PermisoRepository, PersonaJuridicaRepository, PersonaNaturalRepository, DomicilioEmpresaRepository, TipoEmpresaRepository, SolicitanteAutorizadoRepository, TipoDocumentoRepository, DocumentoEmpresaRepository, EstadoTramiteRepository, TramiteRepository, PaisRepository, TipoCargaRepository, TipoPermisoRepository, TipoIdVehiculoRepository, SujetoRepository, VehiculoRepository, SujetoVehiculoRepository, DocumentoRepository, PermisoSujetoVehiculoRepository, EstadoPermisoRepository, Log_wsdl_docfirmaRepository, DireccionPersonaNaturalRepository } from "../repositories";
import { repository } from "@loopback/repository";
import * as moment from 'moment';
import * as dateFormat from 'dateformat';
import { ObtenerPDFs } from "../utils/obtener-pdf";
import { ServiciosGateway, serviciosGateway } from "../utils/servicios-gateway";
import { controllerLogger } from "../logger/logger-config";
import { HttpError } from "http-errors";

// Uncomment these imports to begin using these cool features!
// import {inject} from '@loopback/context';

export class PermisoControllerController {
  constructor(
    @repository(TipoTramiteRepository) public tipoTramiteRepository: TipoTramiteRepository,
    @repository(IntermediarioTramiteRepository) public intermediarioTramiteRepository: IntermediarioTramiteRepository,
    @repository(RegionRepository) public regionRepository: RegionRepository,
    @repository(AnalistaRepository) public analistaRepository: AnalistaRepository,
    @repository(EmpresaRepository) public empresaRepository: EmpresaRepository,
    @repository(PermisoRepository) public permisoRepository: PermisoRepository,
    @repository(TipoIdPersonaRepository) public tipoIdPersonaRepository: TipoIdPersonaRepository,
    @repository(PersonaNaturalRepository) public personaNaturalrepsitory: PersonaNaturalRepository,
    @repository(PersonaJuridicaRepository) public personaJuridicaRepository: PersonaJuridicaRepository,
    @repository(TipoEmpresaRepository) public tipoEmpresaRepository: TipoEmpresaRepository,
    @repository(DomicilioEmpresaRepository) public domicilioEmpresaRepository: DomicilioEmpresaRepository,
    @repository(SolicitanteAutorizadoRepository) public solicitanteAutorizadoRepository: SolicitanteAutorizadoRepository,
    @repository(TipoDocumentoRepository) public tipoDocumentoRepository: TipoDocumentoRepository,
    @repository(DocumentoEmpresaRepository) public documentoEmpresaRepository: DocumentoEmpresaRepository,
    @repository(EstadoTramiteRepository) public estadoTramiteRepository: EstadoTramiteRepository,
    @repository(TramiteRepository) public tramiteRepository: TramiteRepository,
    @repository(PaisRepository) public paisRepository: PaisRepository,
    @repository(TipoCargaRepository) public tipoCargaRepository: TipoCargaRepository,
    @repository(TipoPermisoRepository) public tipoPermisoRepository: TipoPermisoRepository,
    @repository(TipoIdVehiculoRepository) public tipoIdVehiculoRepository: TipoIdVehiculoRepository,
    @repository(SujetoRepository) public sujetoRepository: SujetoRepository,
    @repository(VehiculoRepository) public vehiculoRepository: VehiculoRepository,
    @repository(SujetoVehiculoRepository) public sujetoVehiculoRepository: SujetoVehiculoRepository,
    @repository(DocumentoRepository) public documentoRepository: DocumentoRepository,
    @repository(PermisoSujetoVehiculoRepository) public permisoSujetoVehiculoRepository: PermisoSujetoVehiculoRepository,
    @repository(EstadoPermisoRepository) public estadoPermisoRepository: EstadoPermisoRepository,
    @repository(Log_wsdl_docfirmaRepository) public log_wsdl_docfirmaRepository: Log_wsdl_docfirmaRepository,
    @repository(DireccionPersonaNaturalRepository) public direccionPersonaNaturalRepository: DireccionPersonaNaturalRepository
  ) { }
  @post('/tramites/internacional/chile-chile/permiso/persona')
  async crearPermisoChileChilePersona(@requestBody() params: any): Promise<any> {
    try {
      // agregar despues
      if (params == undefined || params.identificadorIntermediario == undefined || params.idPermisoAnterior == undefined || params.fechaHoraCreacion == undefined || params.fechaHoraCreacion == "" || params.solicitante == undefined
        || params.documentosAdjuntos == undefined
        || params.solicitante.rut == undefined || params.empresa == undefined
        || params.codigoAnalista == undefined || params.nombreAnalista == undefined || params.codigoRegion == undefined
        || params.flotaFinal == undefined || params.flotaFinal.length === 0
        || params.documentosAdjuntos == undefined || params.urlCallback == undefined) {
        throw new HttpErrors.NotFound('Parámteros incorrectos')
      }
      controllerLogger.info("inicia tramite");

      if (params.idPermisoAnterior != "") {
        if (!/^[0-9]*$/.test(params.idPermisoAnterior)) {
          return {
            codigoResultado: 5,
            descripcionResultado: "El parámetro debe ser vacío o numérico (" + params.idPermisoAnterior + ")"
          }
        }
      } else { params.idPermisoAnterior = undefined }

      let tipoTramite: any = (await this.tipoTramiteRepository.obtenerTipoTramitesByCodigo('chile-chile'))[0]
      if (tipoTramite == undefined) controllerLogger.info('Debe crear un Tipo de Trámite con código chile-chile.')
      let intermediarios: any = await this.intermediarioTramiteRepository.obtenerIntermediarios();
      let region: any = (await this.regionRepository.obtenerRegionesByCodigo(params.codigoRegion))[0]
      if (region == undefined) {
        return {
          codigoResultado: 3,
          descripcionResultado: "No existe una región con el código (" + params.codigoRegion + ")"
        }
      }
      let analista = (await this.analistaRepository.obtenerAnalistasByCodigo(params.codigoAnalista, params.codigoRegion))[0]
      if (analista == undefined) {
        analista = {
          codigo: params.codigoAnalista,
          nombre_completo: params.nombreAnalista,
          region_id: region.id
        }
        let resultadoCreacionAnalista = (await this.analistaRepository.crearAnalista(analista))[0]
        analista.id = resultadoCreacionAnalista.id;
      } else {
        if (analista.nombre_completo !== params.nombreAnalista || analista.region_id !== region.id) {
          await this.analistaRepository.actualizarAnalista(params.nombreAnalista, params.codigoRegion, params.codigoAnalista)
        }
      }
      controllerLogger.info("Analista OK");
      let solicitante = (await this.personaNaturalrepsitory.obtenerPersonaNaturalByRut(params.solicitante.rut))[0];
      if (solicitante == undefined) {
        solicitante = {
          nombreCompleto: params.solicitante.nombre,
          identificador: params.solicitante.rut,
          tipoIdentificadorId: 1,
          email: params.solicitante.email
        }
        let respPersonaNatural = (await this.personaNaturalrepsitory.crearPersonaNatural(solicitante))[0];
        if (respPersonaNatural != undefined) {
          solicitante.id = respPersonaNatural.id;
          let direccionPersonaNatural = {
            personaId: respPersonaNatural.id,
            codigoRegion: params.solicitante.codigoRegion,
            codigoComuna: params.solicitante.codigoComuna,
            direccion: params.solicitante.direccion
          }
          if (params.persona_juridica_id == null) {
            let respDireccion: any = (await this.direccionPersonaNaturalRepository.crearDireccionPersonaNaturalsinEmpresa(direccionPersonaNatural))[0]
            respDireccion != undefined ? controllerLogger.info(respDireccion.id) : controllerLogger.info('la dirección no pudo ser creada')
          }
          else {
            let respDireccion: any = (await this.direccionPersonaNaturalRepository.crearDireccionPersonaNatural(direccionPersonaNatural, params.persona_juridica_id))[0]
            respDireccion != undefined ? controllerLogger.info(respDireccion.id) : controllerLogger.info('la dirección no pudo ser creada')
          }
        }
      }
      controllerLogger.info("Solicitante OK");
      let paisChile: any = (await this.paisRepository.obtenerPaisByCodigo('CL'))[0];
      if (paisChile.id == undefined) controllerLogger.info('Debe registrar a Chile como país con código CL.')
      let tiposCargas: any = await this.tipoCargaRepository.obtenerTiposCargas();
      if (tiposCargas.length == 0) controllerLogger.info('Debe registrar Tipos de Cargas.')
      let tipoPermisoChileChile: any = (await this.tipoPermisoRepository.obtenerTipoPermisoByCodigo('CHILE-CHILE'))[0]
      if (tipoPermisoChileChile == undefined) controllerLogger.info('Debe registrar el Tipo de Permiso con código CHILE-CHILE.')
      let tramite = {
        identificadorIntermediario: params.identificadorIntermediario,
        analistaId: analista.id,
        solicitudId: null,
        metadata: JSON.stringify({
          solicitante: params.solicitante,
          flotaFinal: params.flotaFinal
        }),
        codigo: null,
        fechaHoraCreacion: moment(params.fechaHoraCreacion, "DD/MM/YYYY kk:mm:ss").toDate(),
        tipoTramiteId: tipoTramite.id,
        intermediarioId: intermediarios[0].id
      }
      let idTramiteCreado: any
      try {
        //idTramiteCreado = (await this.tramiteRepository.crearTramite(tramite))[0]

      } catch (err) {
        controllerLogger.info(err)
        throw new HttpErrors.BadGateway('No fue posible crear el permiso.');
      }
      controllerLogger.info("Tramite OK");
      //Se crea el caso que se deba eliminar el tramite recien generado.
      let tipoIdRut: any = (await this.tipoIdPersonaRepository.obtenerTiposIdentificadoresPersonasByCodigo('RUT'))[0];
      if (!tipoIdRut) controllerLogger.info('Debe crear el tipo de identificador con código RUT')
      let tipoIdCarroceria: any = (await this.tipoIdVehiculoRepository.obtenerTipoIdentificadorVehiculoByCodigo('CARROCERIA'))[0];
      if (!tipoIdCarroceria) controllerLogger.info('Debe crear el tipo de identificador de vehículo con código CARROCERIA')
      let respCreacionSujeto: any = (await this.sujetoRepository.crearSujeto('Natural', solicitante.id))[0];
      controllerLogger.info("Sujeto OK");
      let sujetosVehiculosIds: any = []
      for (let vehiculo of params.flotaFinal) {
        //Lo nuevo FV
        vehiculo.tipoId = tipoIdCarroceria.id
        vehiculo.ppu = vehiculo.ppu
        let respObtenerPPUVehiculo: any = (await this.vehiculoRepository.ObtenerPPUVehiculo(vehiculo.ppu))[0];
        if (respObtenerPPUVehiculo == undefined) {
          await this.tramiteRepository.DeleteTramiteByIdentificadorIntermediario(params.identificadorIntermediario);
          controllerLogger.info('El Tramite (' + idTramiteCreado.id + '), no será generado porque PPU no existe en el registro de vehículos, recuerde validar flota')
          return {
            codigoResultado: 6,
            descripcionResultado: "El Tramite no será generado porque PPU no existe en el registro de Vehículos, recuerde validar flota"
          }
        }
        let i: number;
        do {
          let respCreacionSujetoVehiculo: any = (await this.sujetoVehiculoRepository.crearSujetoVehiculo(respCreacionSujeto.id, respObtenerPPUVehiculo.id))[0];
          sujetosVehiculosIds.push(respCreacionSujetoVehiculo.id)
          if (respCreacionSujetoVehiculo != undefined) {
            i = 0
          } else {
            i = 1
          }
        } while (i != 0)
      }
      controllerLogger.info("Sujeto vehículo OK")
      let idPermisoAnterior = params.idPermisoAnterior
      let fechaVigencia = moment(params.fechaHoraCreacion, "DD/MM/YYYY kk:mm:ss").add(tipoPermisoChileChile.meses_vigencia, "M").toDate()
      let obtenerPermisoAnt: any = (await this.permisoRepository.obtenerPermisoById(idPermisoAnterior))[0]
      obtenerPermisoAnt != undefined ? fechaVigencia = moment(obtenerPermisoAnt.fecha_fin_vigencia, "DD/MM/YYYY kk:mm:ss").toDate() : controllerLogger.info("Sin permiso anterior");
      let permiso = {
        id_anterior: idPermisoAnterior,
        sujetoId: respCreacionSujeto.id,
        paisId: paisChile.id,
        tipoCargaId: tiposCargas[0].id,
        tipoId: tipoPermisoChileChile.id,
        urlCallback: params.urlCallback,
        fechaHoraCreacion: moment(params.fechaHoraCreacion, "DD/MM/YYYY kk:mm:ss").toDate(),
        fechaFinVigencia: fechaVigencia,
        ciudadOrigen: params.ciudadOrigen,
        ciudadDestino: params.ciudadDestino
      }
      //Nuevo FV
      let respCreacionPermiso: any = (await this.permisoRepository.crearPermiso(permiso))[0];
      controllerLogger.info("Permiso OK")
      let flotaFinal: any = []
      for (let flotas of params.flotaFinal) {
        let vehiculoFlota =
        {
          ejes: flotas.ejes,
          fechaVigenciaLS: flotas.fechaVencimientoLS,
          observacion: flotas.observacion,
          ppu: flotas.ppu,
          tipo: flotas.tipo,
          marca: flotas.marca,
          modelo: flotas.modelo,
          anno: flotas.anno,
          carroceria: flotas.carroceria,
          chasis: flotas.chasis,
          numeroMotor: flotas.numeroMotor,
          fechaVencimientoRT: flotas.fechaVencimientoRT,
          estadoRT: flotas.estadoRT,
          propietario: flotas.rutPropietario,
          toneladas: flotas.capacidadCargaToneladas
        }
        if (vehiculoFlota.ejes == "Sin dato" || vehiculoFlota.ejes == "Sin Dato" || vehiculoFlota.ejes == "") {
          vehiculoFlota.ejes = 0
          flotaFinal.push(vehiculoFlota)
        }
        if (vehiculoFlota.fechaVigenciaLS == "" || vehiculoFlota.fechaVigenciaLS == '') {
          vehiculoFlota.fechaVigenciaLS = "01/01/1900"
        }
        if (vehiculoFlota.fechaVencimientoRT == "" || vehiculoFlota.fechaVencimientoRT == '') {
          vehiculoFlota.fechaVencimientoRT = "01/01/1900"
        }
        await this.permisoSujetoVehiculoRepository.insertPermisoSujetoVehiculoFV(vehiculoFlota, respCreacionPermiso);
        controllerLogger.info("Permiso Sujeto Vehiculo OK")
      }
      let body = {
        codigoResultado: 1,
        descripcionResultado: "Trámite de Creación de Permiso Chile-Chile registrado exitosamente, Permiso creado"
      }
      let flotasPorTipo: any = []
      let flotasResumen: any = []
      for (let flota of params.flotaFinal) {
        let vehiculoFlota = {
          marca: flota.marca,
          anno: flota.anno,
          chasis: flota.chasis,
          ejes: flota.ejes,
          carga: flota.capacidadCargaToneladas,
          patente: flota.ppu,
          tipo: flota.tipo,
          carroceria: flota.carroceria
        }

        let flotaTipo = flotasPorTipo.find((flotaPorTipo: any) => flotaPorTipo.tipo === flota.tipo)
        if (flotaTipo != undefined) {
          flotasPorTipo.push(vehiculoFlota)
          let flotaResumen = flotasResumen.find((resumen: any) => resumen.tipoVehiculo === flota.tipo)
          flotaResumen.cantidadVehiculos = flotaResumen.cantidadVehiculos + 1
        } else {
          flotaTipo = {
            tipo: flota.tipo,
          }
          flotasPorTipo.push(vehiculoFlota)
          let flotaResumen = {
            tipoVehiculo: flota.tipo,
            cantidadVehiculos: 1
          }
          flotasResumen.push(flotaResumen)
        }

      }
      //Insert sobre tabla documento
      let opdf: ObtenerPDFs = new ObtenerPDFs();
      for (let doc of params.documentosAdjuntos) {
        try {
          doc.idPersistido = (await this.documentoRepository.insertarDocumento(doc.urlDescargaDocumento, doc.codigoTipoDocumento, respCreacionPermiso.id))[0].id
          opdf.obtenerVehiculo(doc.urlDescargaDocumento, respCreacionPermiso.id, doc.idPersistido)
          controllerLogger.info(doc.urlDescargaDocumento + " - " + respCreacionPermiso.id + " - " + doc.idPersistido)
          controllerLogger.info("Documento OK");
        } catch (err) {
          controllerLogger.info("Error insertando documento: " + err)
        }
      }
      // tipo_estado_permiso_id = 3 Firmado
      let tipo_estado_permiso_id = 3;
      let folioDocumentoAnt = '';
      let estadoPermisoAnt: any = (await this.estadoPermisoRepository.ObtenerEstadoPermisoByPermisoId(idPermisoAnterior, tipo_estado_permiso_id))[0]
      estadoPermisoAnt != undefined ? folioDocumentoAnt = estadoPermisoAnt.folio_documento : controllerLogger.info("Sin folio anterior")
      let certificado = {
        titulo: 'Permiso Ocasional de Carga para Vincular dos puntos de Chile en Tránsito por Territorio Argentino',
        encabezado: 'El Ministerio de Transportes y Telecomunicaciones de la República de Chile, de acuerdo a las normas del Convenio Chileno-Argentino de Transporte Terrestre en Tránsito para Vincular dos puntos de un mismo País, comunica el haber autorizado el siguiente Permiso Ocasional:',
        texto_autorizacion: 'Este Permiso Ocasional autoriza a transportar todo tipo de carga y transitar en vacío',
        texto_aclarativo: 'La presente autorización no autoriza para cargar o descargar cualquier tipo de carga en Territorio Argentino.',
        footer: 'La empresa podrá hacer uso de los siguientes pasos fronterizos: Cardenal Samoré, Futalelfú, Río Encuentro, Coihaique, Huemules, Río Jeinemeni, Río Don Guillermo, Dorotea, Laurita Casas Viejas, Integración Austral y San Sebastián.  El Complejo Fronterizo Pino Hachado solo podrá ser usado cuando la carga sean productos del mar congelados y/o refrigerados, de acuerdo a las disposiciones de la legislación argentina.',
        numeroPermiso: 'acairaelfolio',
        nro_permiso_ant: folioDocumentoAnt,
        fecha_inicio: dateFormat(permiso.fechaHoraCreacion, "yyyy-mm-dd"),
        fecha_fin: dateFormat(permiso.fechaFinVigencia, "yyyy-mm-dd"),
        empresa: params.empresa,
        nombreTransportista: params.solicitante.nombre,
        tipoCarga: 'CARGA GENERAL',
        listado_flota: flotasPorTipo,
        resumen: flotasResumen,
        ciudad_origen: permiso.ciudadOrigen,
        ciudad_destino: permiso.ciudadDestino
      }
      let serviciosGateway: ServiciosGateway = new ServiciosGateway();
      let responseFirmador: any;
      let idEstadoLog = 1;
      let idPermisoLog = undefined;
      try {
        responseFirmador = await serviciosGateway.firmar(params.codigoRegion, certificado);
      } catch (error) {
        idEstadoLog = error;
        await this.tramiteRepository.DeleteTramiteByIdentificadorIntermediario(params.identificadorIntermediario);
        await this.permisoSujetoVehiculoRepository.borrarPermisoSujetoVehiculo(respCreacionPermiso.id);
        await this.documentoRepository.borrarDocumento(respCreacionPermiso.id);
        await this.permisoRepository.borrarPermiso(respCreacionPermiso.id);
        await this.sujetoVehiculoRepository.borrarSujetoVehiculo(respCreacionPermiso.id);
        controllerLogger.info('Permiso debera ser borrado.')
        controllerLogger.info('Tramite no sera generado.')
        let respLog: any = (await this.log_wsdl_docfirmaRepository.crearLog_wsdl_docfirma(idPermisoLog, idEstadoLog))[0]
        respLog != undefined ? controllerLogger.info('log Firmar generado id: ' + respLog.id) : controllerLogger.info('log Firmar no generado')
        return {
          codigoResultado: 7,
          descripcionResultado: "Por Problemas en respuesta del servicio firmador, el tramite no será generado, intente nuevamente"
        }
      }
      if (responseFirmador.return < 0) {
        idEstadoLog = responseFirmador.return;
        await this.tramiteRepository.DeleteTramiteByIdentificadorIntermediario(params.identificadorIntermediario);
        await this.permisoSujetoVehiculoRepository.borrarPermisoSujetoVehiculo(respCreacionPermiso.id);
        await this.documentoRepository.borrarDocumento(respCreacionPermiso.id);
        await this.permisoRepository.borrarPermiso(respCreacionPermiso.id);
        await this.sujetoVehiculoRepository.borrarSujetoVehiculo(respCreacionPermiso.id);
        controllerLogger.info('Permiso debera ser borrado.')
        controllerLogger.info('Tramite no sera generado.')
        body = {
          codigoResultado: 7,
          descripcionResultado: "Por Problemas en respuesta del servicio firmador, el tramite no será generado, intente nuevamente"
        }
      } else {
        controllerLogger.info("Certificado OK")
        // tipo_estado_permiso_id = 1 En espera de firma
        tipo_estado_permiso_id = 1;
        idPermisoLog = respCreacionPermiso.id;
        let respPermisoId: any = await this.permisoRepository.actualizarCertificadoEnPermisoById(respCreacionPermiso.id, responseFirmador.return, tipo_estado_permiso_id)
        if (respPermisoId != undefined) {
          let estadoPermiso = {
            fecha_hora_cambio: permiso.fechaHoraCreacion,
            permiso_id: respPermisoId.rows[0].id,
            tipo_estado_permiso_id: tipo_estado_permiso_id
          }
          //Guardar el detalle de cada estado del permiso
          let resEstadoPermiso = (await this.estadoPermisoRepository.crearEstadoPermiso(estadoPermiso))[0]
          if (resEstadoPermiso != undefined) { controllerLogger.info("Estado Permiso creado OK:" + resEstadoPermiso.id) }
        }
      }
      let respLog: any = (await this.log_wsdl_docfirmaRepository.crearLog_wsdl_docfirma(idPermisoLog, idEstadoLog))[0]
      respLog != undefined ? controllerLogger.info('log Firmar generado id: ' + respLog.id) : controllerLogger.info('log Firmar no generado')
      return body;
    } catch (ex) {
      controllerLogger.info(ex)
      let error: HttpError;
      if (ex.status == 502) {
        error = new HttpErrors.BadGateway(ex.toString());
        error.status = 502
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

  @post('/tramites/internacional/chile-chile/permiso/empresa')
  async crearPermisoChileChileEmpresa(@requestBody() params: any): Promise<any> {
    try {
      controllerLogger.info("inicio el tramite")
      let body: any;
      if (!params || !params.identificadorIntermediario || params.idPermisoAnterior == undefined || !params.fechaHoraCreacion || !params.solicitante
        || !params.documentosAdjuntos
        || !params.solicitante.nombre || !params.solicitante.rut || !params.solicitante.email
        || !params.codigoAnalista || !params.nombreAnalista || !params.codigoRegion
        || !params.flotaFinal || params.flotaFinal.length === 0
        || !params.empresa || !params.empresa.rut || !params.urlCallback) {
        throw new HttpErrors.NotFound('Parámteros incorrectos');
      }
      if (params.idPermisoAnterior != "") {
        if (!/^[0-9]*$/.test(params.idPermisoAnterior)) {
          return {
            codigoResultado: 5,
            descripcionResultado: "El parámetro debe ser vacío o numérico (" + params.idPermisoAnterior + ")"
          }
        }
      } else { params.idPermisoAnterior = undefined }
      let tiposTramite: any = await this.tipoTramiteRepository.obtenerTipoTramites();
      let tipoTramite = tiposTramite.find((tipo: any) => tipo.codigo === 'chile-chile')
      if (!tipoTramite) controllerLogger.info('Debe crear un Tipo de Trámite con código chile-chile.')
      let intermediarios: any = await this.intermediarioTramiteRepository.obtenerIntermediarios();
      let region: any = (await this.regionRepository.obtenerRegionesByCodigo(params.codigoRegion))[0]
      if (region == undefined) {
        return {
          codigoResultado: 3,
          descripcionResultado: "No existe una región con el código (" + params.codigoRegion + ")"
        }
      }
      // let analistas = await gestionTramitesGateway.obtenerAnalistas()
      let analista: any = (await this.analistaRepository.obtenerAnalistasByCodigo(params.codigoAnalista, params.codigoRegion))[0]
      if (analista == undefined) {
        analista = {
          codigo: params.codigoAnalista,
          nombre_completo: params.nombreAnalista,
          region_id: region.id
        }
        // let resultadoCreacionAnalista = await gestionTramitesGateway.crearAnalista(analista)
        let resultadoCreacionAnalista: any = (await this.analistaRepository.crearAnalista(analista))[0];
        analista.id = resultadoCreacionAnalista.id
      } else {
        if (analista.nombre_completo !== params.nombreAnalista || analista.region_id !== region.id) {
          await this.analistaRepository.actualizarAnalista(params.nombreAnalista, params.codigoRegion, params.codigoAnalista);
        }
      }
      controllerLogger.info("Analista OK")
      // let empresa = await internacionalGateway.obtenerEmpresaByRut(params.empresa.rut)
      let empresa: any = (await this.empresaRepository.obtenerEmpresaByRut(params.empresa.rut))[0];
      if (empresa == undefined) {
        return {
          codigoResultado: 4,
          descripcionResultado: "No hay una empresa registrada con el rut (" + params.empresa.rut + ")"
        }
      }
      let paisChile = (await this.paisRepository.obtenerPaisByCodigo('CL'))[0];
      if (!paisChile) controllerLogger.info('Debe registrar a Chile como país con código CL.')
      let tiposCargas: any = await this.tipoCargaRepository.obtenerTiposCargas();
      if (!tiposCargas) controllerLogger.info('Debe registrar Tipos de Cargas.')
      let tipoPermisoChileChile: any = (await this.tipoPermisoRepository.obtenerTipoPermisoByCodigo('CHILE-CHILE'))[0]
      if (tipoPermisoChileChile == undefined) controllerLogger.info('Debe registrar el Tipo de Permiso con código CHILE-CHILE.')
      let tramite = {
        identificadorIntermediario: params.identificadorIntermediario,
        analistaId: analista.id,
        solicitudId: null,
        metadata: JSON.stringify({
          solicitante: params.solicitante,
          empresa: params.empresa
        }),
        codigo: null,
        fechaHoraCreacion: moment(params.fechaHoraCreacion, "DD/MM/YYYY kk:mm:ss").toDate(),
        tipoTramiteId: tipoTramite.id,
        intermediarioId: intermediarios[0].id
      }
      let idTramiteCreado: any
      try {
        idTramiteCreado = (await this.tramiteRepository.crearTramite(tramite))[0]
      } catch (err) {
        controllerLogger.info(err)
        throw new HttpErrors.BadGateway('No fue posible crear el permiso.');
      }
      controllerLogger.info("Tramite OK")
      let tipoIdRut: any = (await this.tipoIdPersonaRepository.obtenerTiposIdentificadoresPersonasByCodigo('RUT'))[0];
      if (!tipoIdRut) controllerLogger.info('Debe crear el tipo de identificador con código RUT')
      let tipoIdCarroceria: any = (await this.tipoIdVehiculoRepository.obtenerTipoIdentificadorVehiculoByCodigo('CARROCERIA'))[0];
      if (!tipoIdCarroceria) controllerLogger.info('Debe crear el tipo de identificador de vehículo con código CARROCERIA')
      let respCreacionSujeto: any = (await this.sujetoRepository.crearSujeto('Juridica', empresa.persona_juridica_id))[0];
      controllerLogger.info("Sujeto OK");
      let sujetosVehiculosIds: any = []
      for (let vehiculo of params.flotaFinal) {
        //Lo nuevo FV
        vehiculo.tipoId = tipoIdCarroceria.id,
          vehiculo.ppu = vehiculo.ppu
        let respObtenerPPUVehiculo: any = (await this.vehiculoRepository.ObtenerPPUVehiculo(vehiculo.ppu))[0];
        if (respObtenerPPUVehiculo == undefined) {
          controllerLogger.info('PPU no existe en tabla Vehiculo, recuerde validar flota')
          controllerLogger.info(vehiculo.ppu)
          await this.tramiteRepository.DeleteTramiteByIdentificadorIntermediario(params.identificadorIntermediario);
          controllerLogger.info('Tramite ' + idTramiteCreado + ' no sera generado.')
          return {
            codigoResultado: 6,
            descripcionResultado: "El Tramite no será generado porque PPU no existe en el registro de Vehículos, recuerde validar flota"
          }
        } else {
          let respCreacionSujetoVehiculo: any = (await this.sujetoVehiculoRepository.crearSujetoVehiculo(respCreacionSujeto.id, respObtenerPPUVehiculo.id))[0];
          (respCreacionSujetoVehiculo != '') ? sujetosVehiculosIds.push(respCreacionSujetoVehiculo.id) : null
        }
      }
      controllerLogger.info("Sujeto vehículo OK");
      let idPermisoAnterior = params.idPermisoAnterior
      let fechaVigencia = moment(params.fechaHoraCreacion, "DD/MM/YYYY kk:mm:ss").add(tipoPermisoChileChile.meses_vigencia, "M").toDate()
      let obtenerPermisoAnt: any = (await this.permisoRepository.obtenerPermisoById(idPermisoAnterior))[0]

      obtenerPermisoAnt != undefined ? fechaVigencia = moment(obtenerPermisoAnt.fecha_fin_vigencia, "DD/MM/YYYY kk:mm:ss").toDate() : controllerLogger.info("Sin permiso anterior");

      let permiso = {
        id_anterior: idPermisoAnterior,
        sujetoId: respCreacionSujeto.id,
        paisId: paisChile.id,
        tipoCargaId: tiposCargas[0].id,
        tipoId: tipoPermisoChileChile.id,
        urlCallback: params.urlCallback,
        fechaHoraCreacion: moment(params.fechaHoraCreacion, "DD/MM/YYYY kk:mm:ss").toDate(),
        fechaFinVigencia: fechaVigencia,
        ciudadOrigen: params.ciudadOrigen,
        ciudadDestino: params.ciudadDestino
      }
      //Nuevo FV
      let respCreacionPermiso: any = (await this.permisoRepository.crearPermiso(permiso))[0];
      controllerLogger.info("Permiso OK");
      let flotasPorTipo: any = []
      let flotasResumen: any = []
      for (let flota of params.flotaFinal) {
        let vehiculoFlota = {
          ejes: flota.ejes,
          fechaVigenciaLS: flota.fechaVencimientoLS,
          observacion: flota.observacion,
          patente: flota.ppu,
          tipo: flota.tipo,
          marca: flota.marca,
          modelo: flota.modelo,
          anno: flota.anno,
          carroceria: flota.carroceria,
          chasis: flota.chasis,
          numeroMotor: flota.numeroMotor,
          fechaVencimientoRT: flota.fechaVencimientoRT,
          estadoRT: flota.estadoRT,
          propietario: flota.rutPropietario,
          toneladas: flota.capacidadCargaToneladas
        }
        if (vehiculoFlota.ejes == "Sin dato" || vehiculoFlota.ejes == "Sin Dato" || vehiculoFlota.ejes == "") {
          vehiculoFlota.ejes = 0
        }
        if (vehiculoFlota.fechaVigenciaLS == "" || vehiculoFlota.fechaVigenciaLS == '') {
          vehiculoFlota.fechaVigenciaLS = "01/01/1900"
        }
        if (vehiculoFlota.fechaVencimientoRT == "" || vehiculoFlota.fechaVencimientoRT == '') {
          vehiculoFlota.fechaVencimientoRT = "01/01/1900"
        }
        controllerLogger.info(vehiculoFlota.ejes)
        controllerLogger.info(vehiculoFlota.fechaVigenciaLS)
        await this.permisoSujetoVehiculoRepository.insertPermisoSujetoVehiculoFV(vehiculoFlota, respCreacionPermiso).catch(error => {
          controllerLogger.info("Error en update de permisoSujetoVehiculo\n" + error);
        });

        let flotaTipo = flotasPorTipo.find((flotaPorTipo: any) => flotaPorTipo.tipo === flota.tipo)
        if (flotaTipo) {
          controllerLogger.info("#1")
          flotasPorTipo.push(vehiculoFlota)
          let flotaResumen = flotasResumen.find((resumen: any) => resumen.tipoVehiculo === flota.tipo)
          flotaResumen.cantidadVehiculos = flotaResumen.cantidadVehiculos + 1
        } else {
          flotaTipo = {
            tipo: flota.tipo,
          }
          controllerLogger.info("#2")
          flotasPorTipo.push(vehiculoFlota)
          let flotaResumen = {
            tipoVehiculo: flota.tipo,
            cantidadVehiculos: 1
          }
          flotasResumen.push(flotaResumen)
        }
      }
      body = {
        codigoResultado: 1,
        descripcionResultado: "Trámite de Creación de Permiso Chile-Chile registrado exitosamente, Permiso creado"
      }
      //Insert sobre tabla documento
      let opdf: ObtenerPDFs = new ObtenerPDFs();
      for (let doc of params.documentosAdjuntos) {
        try {
          doc.idPersistido = (await this.documentoRepository.insertarDocumento(doc.urlDescargaDocumento, doc.codigoTipoDocumento, respCreacionPermiso.id))[0].id
          opdf.obtenerVehiculo(doc.urlDescargaDocumento, respCreacionPermiso.id, doc.idPersistido)
          controllerLogger.info(doc.urlDescargaDocumento + " - " + respCreacionPermiso.id + " - " + doc.idPersistido)
          controllerLogger.info("Documento OK");
        } catch (err) {
          controllerLogger.info("Error insertando documento: " + err)
        }
      }
      controllerLogger.info("Genero XML")
      // tipo_estado_permiso_id = 3 Firmado
      let tipo_estado_permiso_id = 3;
      let folioDocumentoAnt = '';
      let estadoPermisoAnt: any = (await this.estadoPermisoRepository.ObtenerEstadoPermisoByPermisoId(idPermisoAnterior, tipo_estado_permiso_id))[0]
      estadoPermisoAnt != undefined ? folioDocumentoAnt = estadoPermisoAnt.folio_documento : controllerLogger.info("Sin folio anterior")
      let certificado = {
        titulo: 'Permiso Ocasional de Carga para Vincular dos puntos de Chile en Tránsito por Territorio Argentino',
        encabezado: 'El Ministerio de Transportes y Telecomunicaciones de la República de Chile, de acuerdo a las normas del Convenio Chileno-Argentino de Transporte Terrestre en Tránsito para Vincular dos puntos de un mismo País, comunica el haber autorizado el siguiente Permiso Ocasional:',
        texto_autorizacion: 'Este Permiso Ocasional autoriza a transportar todo tipo de carga y transitar en vacío',
        texto_aclarativo: 'La presente autorización no autoriza para cargar o descargar cualquier tipo de carga en Territorio Argentino.',
        footer: 'La empresa podrá hacer uso de los siguientes pasos fronterizos: Cardenal Samoré, Futalelfú, Río Encuentro, Coihaique, Huemules, Río Jeinemeni, Río Don Guillermo, Dorotea, Laurita Casas Viejas, Integración Austral y San Sebastián.  El Complejo Fronterizo Pino Hachado solo podrá ser usado cuando la carga sean productos del mar congelados y/o refrigerados, de acuerdo a las disposiciones de la legislación argentina.',
        numeroPermiso: 'acairaelfolio',
        nro_permiso_ant: folioDocumentoAnt,
        fecha_inicio: dateFormat(permiso.fechaHoraCreacion, "yyyy-mm-dd"),
        fecha_fin: dateFormat(permiso.fechaFinVigencia, "yyyy-mm-dd"),
        empresa: params.empresa,
        nombreTransportista: params.solicitante.nombre,
        tipoCarga: 'CARGA GENERAL',
        listado_flota: flotasPorTipo,
        resumen: flotasResumen,
        ciudad_origen: permiso.ciudadOrigen,
        ciudad_destino: permiso.ciudadDestino
      }
      controllerLogger.info('llamando al firmador')
      let idEstadoLog = 1;
      let idPermisoLog = undefined;
      let responseFirmador: any
      let serviciosGateway: ServiciosGateway = new ServiciosGateway();
      try {
        responseFirmador = await serviciosGateway.firmar(params.codigoRegion, certificado);
      } catch (error) {
        idEstadoLog = error;
        await this.tramiteRepository.DeleteTramiteByIdentificadorIntermediario(params.identificadorIntermediario);
        await this.permisoSujetoVehiculoRepository.borrarPermisoSujetoVehiculo(respCreacionPermiso.id);
        await this.documentoRepository.borrarDocumento(respCreacionPermiso.id);
        await this.permisoRepository.borrarPermiso(respCreacionPermiso.id);
        await this.sujetoVehiculoRepository.borrarSujetoVehiculo(respCreacionPermiso.id);
        controllerLogger.info('Permiso debera ser borrado.')
        controllerLogger.info('Tramite no sera generado.')
        let respLog: any = (await this.log_wsdl_docfirmaRepository.crearLog_wsdl_docfirma(idPermisoLog, idEstadoLog))[0]
        respLog != undefined ? controllerLogger.info('log Firmar generado id: ' + respLog.id) : controllerLogger.info('log Firmar no generado')
        return {
          codigoResultado: 7,
          descripcionResultado: "Por Problemas en respuesta del servicio firmador, el tramite no será generado, intente nuevamente"
        }
      }
      if (responseFirmador.return < 0) {
        idEstadoLog = responseFirmador.return;
        await this.tramiteRepository.DeleteTramiteByIdentificadorIntermediario(params.identificadorIntermediario);
        await this.permisoSujetoVehiculoRepository.borrarPermisoSujetoVehiculo(respCreacionPermiso.id);
        await this.documentoRepository.borrarDocumento(respCreacionPermiso.id);
        await this.permisoRepository.borrarPermiso(respCreacionPermiso.id);
        await this.sujetoVehiculoRepository.borrarSujetoVehiculo(respCreacionPermiso.id);
        controllerLogger.info('Permiso debera ser borrado.')
        controllerLogger.info('Tramite no sera generado.')
        body = {
          codigoResultado: 7,
          descripcionResultado: "Por Problemas en respuesta del servicio firmador, el tramite no será generado, intente nuevamente"
        }
      } else {
        controllerLogger.info("Certificado OK")
        // tipo_estado_permiso_id = 1 En espera de firma
        tipo_estado_permiso_id = 1;
        idPermisoLog = respCreacionPermiso.id;
        let respPermisoId: any = await this.permisoRepository.actualizarCertificadoEnPermisoById(respCreacionPermiso.id, responseFirmador.return, tipo_estado_permiso_id)
        if (respPermisoId != undefined) {
          let estadoPermiso = {
            fecha_hora_cambio: permiso.fechaHoraCreacion,
            permiso_id: respPermisoId.rows[0].id,
            tipo_estado_permiso_id: tipo_estado_permiso_id
          }
          //Guardar el detalle de cada estado del permiso
          let resEstadoPermiso = (await this.estadoPermisoRepository.crearEstadoPermiso(estadoPermiso))[0]
          if (resEstadoPermiso != undefined) { controllerLogger.info("Estado Permiso creado OK:" + resEstadoPermiso.id) }
        }
      }
      let respLog: any = (await this.log_wsdl_docfirmaRepository.crearLog_wsdl_docfirma(idPermisoLog, idEstadoLog))[0]
      respLog != undefined ? controllerLogger.info('log Firmar generado id: ' + respLog.id) : controllerLogger.info('log Firmar no generado')
      return body;
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

