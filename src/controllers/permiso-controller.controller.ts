import { post, requestBody, HttpErrors } from "@loopback/rest";
import { TipoTramiteRepository, IntermediarioTramiteRepository, RegionRepository, AnalistaRepository, EmpresaRepository, TipoIdPersonaRepository, PermisoRepository, PersonaJuridicaRepository, PersonaNaturalRepository, DomicilioEmpresaRepository, TipoEmpresaRepository, SolicitanteAutorizadoRepository, TipoDocumentoRepository, DocumentoEmpresaRepository, EstadoTramiteRepository, SolicitudTramiteRepository, TramiteRepository, PaisRepository, TipoCargaRepository, TipoPermisoRepository, TipoIdVehiculoRepository, SujetoRepository, VehiculoRepository, SujetoVehiculoRepository, DocumentoRepository, PermisoSujetoVehiculoRepository } from "../repositories";
import { repository } from "@loopback/repository";
import * as moment from 'moment';
import * as dateFormat from 'dateformat';
import { ObtenerPDFs } from "../utils/obtener-pdf";
import { ServiciosGateway, serviciosGateway } from "../utils/servicios-gateway";
import { httpify } from "caseless";
import { rejects } from "assert";
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
    @repository(SolicitudTramiteRepository) public solicitudTramiteRepository: SolicitudTramiteRepository,
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
  ) { }
  @post('/tramites/internacional/chile-chile/permiso/persona')
  async crearPermisoChileChilePersona(@requestBody() params: any): Promise<any> {
    try {
      if (params == undefined || params.identificadorIntermediario == undefined || params.fechaHoraCreacion == undefined || params.solicitante == undefined
        || params.documentosAdjuntos == undefined
        || params.solicitante.rut == undefined
        || params.codigoAnalista == undefined || params.nombreAnalista == undefined || params.codigoRegion == undefined
        || params.flotaFinal == undefined || params.flotaFinal.length === 0
        || params.documentosAdjuntos == undefined || params.urlCallback == undefined) {
        throw new HttpErrors.NotFound('Parámteros incorrectos');
      }
      console.log("inicia tramite");
      let tipoTramite: any = (await this.tipoTramiteRepository.obtenerTipoTramitesByCodigo('chile-chile'))[0]
      if (tipoTramite == undefined) console.error('Debe crear un Tipo de Trámite con código chile-chile.')
      let intermediarios: any = await this.intermediarioTramiteRepository.obtenerIntermediarios();
      let region: any = (await this.regionRepository.obtenerRegionesByCodigo(params.codigoRegion))[0]
      if (region == undefined) {
        return {
          codigoResultado: 3,
          descripcionResultado: "No existe una región con el código " + params.codigoRegion + "."
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
          // await gestionTramitesGateway.actualizarAnalista(analista)
          await this.analistaRepository.actualizarAnalista(params.nombreAnalista, params.codigoRegion, params.codigoAnalista)
        }
      }
      console.log("Analista OK");
      let solicitante = (await this.personaNaturalrepsitory.obtenerPersonaNaturalByRut(params.solicitante.rut))[0];
      if (solicitante == undefined) {
        solicitante = {
          nombreCompleto: params.solicitante.nombre,
          identificador: params.solicitante.rut,
          tipoIdentificadorId: 1,
          email: params.solicitante.email
        }
        // await internacionalGateway.crearPersonaNatural(solicitante)
        let respPersonaNatural = (await this.personaNaturalrepsitory.crearPersonaNatural(solicitante))[0];
        solicitante.id = respPersonaNatural.id;
      }
      console.log("Solicitante OK");
      let paisChile: any = (await this.paisRepository.obtenerPaisByCodigo('CL'))[0];
      if (paisChile.id == undefined) console.error('Debe registrar a Chile como país con código CL.')
      let tiposCargas: any = await this.tipoCargaRepository.obtenerTiposCargas();
      if (tiposCargas.length == 0) console.error('Debe registrar Tipos de Cargas.')
      let tipoPermisoChileChile: any = (await this.tipoPermisoRepository.obtenerTipoPermisoByCodigo('CHILE-CHILE'))[0]
      if (tipoPermisoChileChile == undefined) console.error('Debe registrar el Tipo de Permiso con código CHILE-CHILE.')
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
        idTramiteCreado = (await this.tramiteRepository.crearTramite(tramite))[0]

      } catch (err) {
        controllerLogger.info(err)
        throw new HttpErrors.BadGateway('No fue posible crear el permiso.');

      }
      console.log("Tramite OK");
      //Se crea el caso que se deba eliminar el tramite recien generado.
      let body = {
        codigoResultado: 6,
        descripcionResultado: "Tramite no será generado, " + idTramiteCreado.id + "."
      }
      let tipoIdRut: any = (await this.tipoIdPersonaRepository.obtenerTiposIdentificadoresPersonasByCodigo('RUT'))[0];
      if (!tipoIdRut) console.error('Debe crear el tipo de identificador con código RUT')
      let tipoIdCarroceria: any = (await this.tipoIdVehiculoRepository.obtenerTipoIdentificadorVehiculoByCodigo('CARROCERIA'))[0];
      if (!tipoIdCarroceria) console.error('Debe crear el tipo de identificador de vehículo con código CARROCERIA')
      let respCreacionSujeto: any = (await this.sujetoRepository.crearSujeto('Natural', solicitante.id))[0];
      console.log("Sujeto OK");
      let sujetosVehiculosIds: any = []
      for (let vehiculo of params.flotaFinal) {
        //Lo nuevo FV
        vehiculo.tipoId = tipoIdCarroceria.id
        vehiculo.ppu = vehiculo.ppu
        let respObtenerPPUVehiculo: any = (await this.vehiculoRepository.ObtenerPPUVehiculo(vehiculo.ppu))[0];
        if (respObtenerPPUVehiculo == undefined) {
          console.error('PPU no existe en tabla Vehiculo, recuerde validar flota')
          console.log(vehiculo.ppu)
          await this.tramiteRepository.DeleteTramiteByIdentificadorIntermediario(params.identificadorIntermediario);
          console.error('Tramite no sera generado.')
          return body
        }
        let respObtenerVehiculo: any = (await this.vehiculoRepository.ObtenerVehiculo(vehiculo.ppu))[0];
        if (respObtenerVehiculo == undefined) {
          return body
        }
        let i: number;
        do {
          let respCreacionSujetoVehiculo: any = (await this.sujetoVehiculoRepository.crearSujetoVehiculo(respCreacionSujeto.id, respObtenerVehiculo.id))[0];
          sujetosVehiculosIds.push(respCreacionSujetoVehiculo.id)
          if (respCreacionSujetoVehiculo != '') {
            i = 0
          } else {
            i = 1
          }
        } while (i != 0)
      }
      console.log("Sujeto vehículo OK");
      let permiso = {
        sujetoId: respCreacionSujeto.id,
        paisId: paisChile.id,
        tipoCargaId: tiposCargas[0].id,
        tipoId: tipoPermisoChileChile.id,
        urlCallback: params.urlCallback,
        fechaHoraCreacion: moment(params.fechaHoraCreacion, "DD/MM/YYYY kk:mm:ss").toDate(),
        fechaFinVigencia: moment(params.fechaHoraCreacion, "DD/MM/YYYY kk:mm:ss").add(tipoPermisoChileChile.meses_vigencia, "M").toDate()
      }
      //Nuevo FV
      let respCreacionPermiso: any = (await this.permisoRepository.crearPermiso(permiso))[0];
      console.log("Permiso OK");
      let flotaFinal: any = []
      for (let flotas of params.flotaFinal) {
        let vehiculoFlota = {
          ejes: flotas.ejes,
          fechaVigenciaLS: flotas.fechaVencimientoLS,
          observacion: flotas.limitacion,
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
          propietario: flotas.propietario,
          toneladas: flotas.capacidadCargaToneladas
        }
        if (vehiculoFlota.ejes == "Sin dato" || vehiculoFlota.ejes == "Sin Dato" || vehiculoFlota.ejes == "") {
          vehiculoFlota.ejes = 0
          flotaFinal.push(vehiculoFlota)
        }
        if (vehiculoFlota.fechaVigenciaLS == "" || vehiculoFlota.fechaVigenciaLS == '') {
          vehiculoFlota.fechaVigenciaLS = "01/01/1900"
        }
        await this.permisoSujetoVehiculoRepository.insertPermisoSujetoVehiculoFV(vehiculoFlota, respCreacionPermiso);
        console.log("Permiso Sujeto Vehiculo OK");
      }
      body = {
        codigoResultado: 1,
        descripcionResultado: "Trámite de Creación de Permiso Chile-Chile registrado exitosamente. Permiso creado."
      }
      let flotasPorTipo: any = []
      let flotasResumen: any = []
      // params.flotaFinal.forEach((flota: any) => {
      for (let flota of params.flotaFinal) {
        let vehiculoFlota = {
          marca: flota.marca,
          anno: flota.anno,
          chasis: flota.carroceria,
          ejes: flota.ejes,
          capacidadCarga: flota.capacidadCargaToneladas,
          patente: flota.ppu,
          tipo: flota.tipo
        }
        let flotaTipo = flotasPorTipo.find((flotaPorTipo: any) => flotaPorTipo.tipo === flota.tipo)
        if (flotaTipo != undefined) {
          flotasPorTipo.push(vehiculoFlota)
          let flotaResumen = flotasResumen.find((resumen: any) => resumen.tipoVehiculo === flota.tipo)
          flotaResumen.cantidadVehiculos = flotaResumen.cantidadVehiculos + 1
        } else {
          flotaTipo = {
            tipo: flota.tipo,
            //vehiculos: []
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
          console.log("Documento OK");
        } catch (err) {
          controllerLogger.info("Error insertando documento: " + err)
        }

      }
      let certificado = {
        titulo: 'Permiso Ocasional País-País',
        encabezado: 'CONFORME A LO ACORDADO EN EL CONVENIO CHILENO-ARGENTINO DE TRANSPORTE TERRESTRE EN TRÁNSITO PARA VINCULAR DOS PUNTOS DE UN MISMO PAÍS, COMUNICO A USTED, HABER AUTORIZADO PERMISO OCASIONAL CON DESTINO A TERRITORIO NACIONAL EN TRÁNSITO POR TERRITORIO ARGENTINO POR PASOS FRONTERIZOS AUTORIZADOS ENTRE LAS REGIONES DE LOS LAGOS, DE AYSÉN Y DE MAGALLANES ANTÁRTICA CHILENA.',
        numeroPermiso: respCreacionPermiso.id,
        fechaInicio: dateFormat(permiso.fechaHoraCreacion, "yyyy-mm-dd"),
        fechaFin: dateFormat(permiso.fechaFinVigencia, "yyyy-mm-dd"),
        nombreTransportista: params.solicitante.nombre,
        tipoCarga: 'CARGA GENERAL',
        flota: flotasPorTipo,
        resumen: flotasResumen
      }
      let serviciosGateway: ServiciosGateway = new ServiciosGateway();
      let responseFirmador: any = await serviciosGateway.firmar(params.codigoRegion, certificado);
      console.log("Certificado OK");
      if (responseFirmador.return < 0) {
        await this.tramiteRepository.DeleteTramiteByIdentificadorIntermediario(params.identificadorIntermediario);
        //console.log(respCreacionPermiso)
        await this.permisoSujetoVehiculoRepository.borrarPermisoSujetoVehiculo(respCreacionPermiso.id);
        await this.permisoRepository.borrarPermiso(respCreacionPermiso.id);
        await this.sujetoVehiculoRepository.borrarSujetoVehiculo(respCreacionPermiso.id);
        console.error('Permiso debera ser borrado.')
        console.error('Tramite no sera generado.')
        body = {
          codigoResultado: 7,
          descripcionResultado: "Por Problemas en respuesta del servicio firmador, el tramite no será generado, intente nuevamente."
        }
      } else {
        this.permisoRepository.actualizarCertificadoEnPermisoById(respCreacionPermiso.id, responseFirmador.return);
      }
      return body;
    } catch (ex) {
      console.log(ex)
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
      console.log("inicio el tramite")
      let body: any;
      if (!params || !params.identificadorIntermediario || !params.fechaHoraCreacion || !params.solicitante
        || !params.documentosAdjuntos
        || !params.solicitante.nombre || !params.solicitante.rut || !params.solicitante.email
        || !params.codigoAnalista || !params.nombreAnalista || !params.codigoRegion
        || !params.flotaFinal || params.flotaFinal.length === 0
        || !params.empresa || !params.empresa.rut || !params.urlCallback) {
        throw new HttpErrors.NotFound('Parámteros incorrectos');
      }
      console.log("inicia tramite");
      // let tiposTramite = await gestionTramitesGateway.obtenerTiposTramites()
      let tiposTramite: any = await this.tipoTramiteRepository.obtenerTipoTramites();
      let tipoTramite = tiposTramite.find((tipo: any) => tipo.codigo === 'chile-chile')
      if (!tipoTramite) console.error('Debe crear un Tipo de Trámite con código chile-chile.')
      // let intermediarios = await gestionTramitesGateway.obtenerIntermediarios()
      let intermediarios: any = await this.intermediarioTramiteRepository.obtenerIntermediarios();
      // let regiones = await internacionalGateway.obtenerRegiones()
      let region: any = (await this.regionRepository.obtenerRegionesByCodigo(params.codigoRegion))[0]
      if (region == undefined) {
        return {
          codigoResultado: 3,
          descripcionResultado: "No existe una región con el código " + params.codigoRegion + "."
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
          // await gestionTramitesGateway.actualizarAnalista(analista)
          await this.analistaRepository.actualizarAnalista(params.nombreAnalista, params.codigoRegion, params.codigoAnalista);
        }
      }
      console.log("Analista OK");
      // let empresa = await internacionalGateway.obtenerEmpresaByRut(params.empresa.rut)
      let empresa: any = (await this.empresaRepository.obtenerEmpresaByRut(params.empresa.rut))[0];
      if (empresa == undefined) {
        return {
          codigoResultado: 4,
          descripcionResultado: "No hay una empresa registrada con el rut " + params.empresa.rut + "."
        }
      }
      // let solicitud = await gestionTramitesGateway.obtenerSolicitudByIdentificadorIntermediario(params.identificadorIntermediario)
      // let solicitud: any = (await this.solicitudTramiteRepository.obtenerSolicitudByIdentificadorIntermediario(params.identificadorIntermediario))[0];
      // if (solicitud == undefined) {
      //   return {
      //     codigoResultado: 2,
      //     descripcionResultado: "No existe una solicitud con el identificador de intermediario " + params.identificadorIntermediario + "."
      //   }
      // }
      // let tram = await gestionTramitesGateway.obtenerTramiteBySolicitudId(solicitud.id)
      // let tram: any = (await this.tramiteRepository.obtenerTramiteBySolicitudId(solicitud.id))[0];
      // if (tram != undefined) {
      //   return {
      //     codigoResultado: 5,
      //     descripcionResultado: "Ya existe un trámite creado para la solicitud solicitada."
      //   }
      // }
      // let paisChile = await internacionalGateway.obtenerPaisByCodigo('CL')
      let paisChile = (await this.paisRepository.obtenerPaisByCodigo('CL'))[0];
      if (!paisChile) console.error('Debe registrar a Chile como país con código CL.')
      // let tiposCargas = await internacionalGateway.obtenerTiposCargas()
      let tiposCargas: any = await this.tipoCargaRepository.obtenerTiposCargas();
      if (!tiposCargas) console.error('Debe registrar Tipos de Cargas.')
      let tipoPermisoChileChile: any = (await this.tipoPermisoRepository.obtenerTipoPermisoByCodigo('CHILE-CHILE'))[0]
      if (tipoPermisoChileChile == undefined) console.error('Debe registrar el Tipo de Permiso con código CHILE-CHILE.')
      let tramite = {
        identificadorIntermediario: params.identificadorIntermediario,
        analistaId: analista.id,
        solicitudId: null,
        metadata: JSON.stringify({
          //relacionSolicitanteEmpresa: '',
          solicitante: params.solicitante,
          empresa: params.empresa
        }),
        codigo: null,
        fechaHoraCreacion: moment(params.fechaHoraCreacion, "DD/MM/YYYY kk:mm:ss").toDate(),
        tipoTramiteId: tipoTramite.id,
        intermediarioId: intermediarios[0].id
      }
      // await gestionTramitesGateway.crearTramite(tramite)
      let idTramiteCreado: any
      try {
        idTramiteCreado = (await this.tramiteRepository.crearTramite(tramite))[0]
      } catch (err) {
        controllerLogger.info(err)
        throw new HttpErrors.BadGateway('No fue posible crear el permiso.');
      }
      console.log("Tramite OK");
      //Se crea el caso que se deba eliminar el tramite recien generado.
      body = {
        codigoResultado: 6,
        descripcionResultado: "Tramite no será generado, " + idTramiteCreado.id + "."
      }

      let tipoIdRut: any = (await this.tipoIdPersonaRepository.obtenerTiposIdentificadoresPersonasByCodigo('RUT'))[0];
      if (!tipoIdRut) console.error('Debe crear el tipo de identificador con código RUT')
      // let tipoIdCarroceria = await internacionalGateway.obtenerTipoIdentificadorVehiculoByCodigo('CARROCERIA')
      let tipoIdCarroceria: any = (await this.tipoIdVehiculoRepository.obtenerTipoIdentificadorVehiculoByCodigo('CARROCERIA'))[0];
      if (!tipoIdCarroceria) console.error('Debe crear el tipo de identificador de vehículo con código CARROCERIA')
      // let respCreacionSujeto = await internacionalGateway.crearSujeto('Juridica', empresa.persona_juridica_id)
      let respCreacionSujeto: any = (await this.sujetoRepository.crearSujeto('Juridica', empresa.persona_juridica_id))[0];
      console.log("Sujeto OK");
      let sujetosVehiculosIds: any = []
      for (let vehiculo of params.flotaFinal) {
        //Lo nuevo FV
        vehiculo.tipoId = tipoIdCarroceria.id,
          vehiculo.ppu = vehiculo.ppu
        let respObtenerPPUVehiculo: any = (await this.vehiculoRepository.ObtenerPPUVehiculo(vehiculo.ppu))[0];
        let respObtenerVehiculo: any = (await this.vehiculoRepository.ObtenerVehiculo(vehiculo.ppu))[0];
        if (respObtenerPPUVehiculo == undefined || respObtenerVehiculo == undefined) {
          console.error('PPU no existe en tabla Vehiculo, recuerde validar flota')
          console.log(vehiculo.ppu)
          await this.tramiteRepository.DeleteTramiteByIdentificadorIntermediario(params.identificadorIntermediario);
          console.error('Tramite no sera generado.')
          return body
        } else {
          let respCreacionSujetoVehiculo: any = (await this.sujetoVehiculoRepository.crearSujetoVehiculo(respCreacionSujeto.id, respObtenerPPUVehiculo.id))[0];
          (respCreacionSujetoVehiculo != '') ? sujetosVehiculosIds.push(respCreacionSujetoVehiculo.id) : null
        }
      }
      console.log("Sujeto vehículo OK");
      let permiso = {
        sujetoId: respCreacionSujeto.id,
        paisId: paisChile.id,
        tipoCargaId: tiposCargas[0].id,
        tipoId: tipoPermisoChileChile.id,
        urlCallback: params.urlCallback,
        fechaHoraCreacion: moment(params.fechaHoraCreacion, "DD/MM/YYYY kk:mm:ss").toDate(),
        fechaFinVigencia: moment(params.fechaHoraCreacion, "DD/MM/YYYY kk:mm:ss").add(tipoPermisoChileChile.meses_vigencia, "M").toDate()
      }
      //Nuevo FV
      let respCreacionPermiso: any = (await this.permisoRepository.crearPermiso(permiso))[0];
      console.log("Permiso OK");
      let flotasPorTipo: any = []
      let flotasResumen: any = []
      for (let flota of params.flotaFinal) {
        // params.flotaFinal.forEach((flota: any) => {
        let vehiculoFlota = {
          ejes: flota.ejes,
          fechaVigenciaLS: flota.fechaVencimientoLS,
          observacion: flota.limitacion,
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
          propietario: flota.propietario,
          capacidadCarga: flota.capacidadCargaToneladas
        }
        if (vehiculoFlota.ejes == "Sin dato" || vehiculoFlota.ejes == "Sin Dato" || vehiculoFlota.ejes == "") {
          vehiculoFlota.ejes = 0
        } else {
          vehiculoFlota.ejes = vehiculoFlota.ejes
        }
        if (vehiculoFlota.fechaVigenciaLS == "") {
          vehiculoFlota.fechaVigenciaLS = "01/01/1900"
        } else {
          vehiculoFlota.fechaVigenciaLS = vehiculoFlota.fechaVigenciaLS
        }
        console.log(vehiculoFlota.ejes)
        console.log(vehiculoFlota.fechaVigenciaLS)
        await this.permisoSujetoVehiculoRepository.insertPermisoSujetoVehiculoFV(vehiculoFlota, respCreacionPermiso).catch(error => {
          controllerLogger.info("Error en update de permisoSujetoVehiculo\n" + error);
        });

        let flotaTipo = flotasPorTipo.find((flotaPorTipo: any) => flotaPorTipo.tipo === flota.tipo)
        if (flotaTipo) {
          console.log("#1")
          flotasPorTipo.push(vehiculoFlota)
          let flotaResumen = flotasResumen.find((resumen: any) => resumen.tipoVehiculo === flota.tipo)
          flotaResumen.cantidadVehiculos = flotaResumen.cantidadVehiculos + 1
        } else {
          flotaTipo = {
            tipo: flota.tipo,
            // vehiculos: []
          }
          console.log("#2")
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
        descripcionResultado: "Trámite de Creación de Permiso Chile-Chile registrado exitosamente. Permiso creado."
      }
      //Insert sobre tabla documento
      let opdf: ObtenerPDFs = new ObtenerPDFs();
      for (let doc of params.documentosAdjuntos) {
        try {
          doc.idPersistido = (await this.documentoRepository.insertarDocumento(doc.urlDescargaDocumento, doc.codigoTipoDocumento, respCreacionPermiso.id))[0].id
          opdf.obtenerVehiculo(doc.urlDescargaDocumento, respCreacionPermiso.id, doc.idPersistido)
          controllerLogger.info(doc.urlDescargaDocumento + " - " + respCreacionPermiso.id + " - " + doc.idPersistido)
          console.log("Documento OK");
        } catch (err) {
          controllerLogger.info("Error insertando documento: " + err)
        }
      }
      console.log("Genero XML")
      //let now: Date = new Date()
      let certificado = {
        titulo: 'Permiso Ocasional País-País',
        encabezado: 'CONFORME A LO ACORDADO EN EL CONVENIO CHILENO-ARGENTINO DE TRANSPORTE TERRESTRE EN TRÁNSITO PARA VINCULAR DOS PUNTOS DE UN MISMO PAÍS, COMUNICO A USTED, HABER AUTORIZADO PERMISO OCASIONAL CON DESTINO A TERRITORIO NACIONAL EN TRÁNSITO POR TERRITORIO ARGENTINO POR PASOS FRONTERIZOS AUTORIZADOS ENTRE LAS REGIONES DE LOS LAGOS, DE AYSÉN Y DE MAGALLANES ANTÁRTICA CHILENA.',
        numeroPermiso: respCreacionPermiso.id,
        fechaInicio: dateFormat(permiso.fechaHoraCreacion, "yyyy-mm-dd"),
        fechaFin: dateFormat(permiso.fechaFinVigencia, "yyyy-mm-dd"),
        nombreTransportista: params.solicitante.nombre,
        tipoCarga: 'CARGA GENERAL',
        flota: flotasPorTipo,
        resumen: flotasResumen
      }
      console.log('llamando al firmador')
      let serviciosGateway: ServiciosGateway = new ServiciosGateway();
      let responseFirmador: any = await serviciosGateway.firmar(params.codigoRegion, certificado);
      console.log("Certificado OK");
      if (responseFirmador.return < 0) {
        await this.tramiteRepository.DeleteTramiteByIdentificadorIntermediario(params.identificadorIntermediario);
        //console.log(respCreacionPermiso)
        await this.permisoSujetoVehiculoRepository.borrarPermisoSujetoVehiculo(respCreacionPermiso.id);
        await this.permisoRepository.borrarPermiso(respCreacionPermiso.id);
        await this.sujetoVehiculoRepository.borrarSujetoVehiculo(respCreacionPermiso.id);
        console.error('Permiso debera ser borrado.')
        console.error('Tramite no sera generado.')
        body = {
          codigoResultado: 7,
          descripcionResultado: "Por Problemas en respuesta del servicio firmador, el tramite no será generado, intente nuevamente."
        }
      } else {
        this.permisoRepository.actualizarCertificadoEnPermisoById(respCreacionPermiso.id, responseFirmador.return);
      }
      return body;
    } catch (ex) {
      console.log(ex)
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
