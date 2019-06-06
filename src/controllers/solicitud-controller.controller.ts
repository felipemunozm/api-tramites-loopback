import { post, param, requestBody, HttpErrors, put } from "@loopback/rest";
import * as moment from 'moment';
import { controllerLogger } from "../logger/logger-config";
import { repository } from "@loopback/repository";
import { TipoTramiteRepository, IntermediarioTramiteRepository, TipoTramiteEtapaSolicitudRepository, EmpresaRepository, SolicitanteAutorizadoRepository, PersonaNaturalRepository, SolicitudTramiteRepository, SujetoSolicitudRepository, SolicitanteTramiteRepository, EstadoSolicitudRepository, RegionRepository, AnalistaRepository } from "../repositories";

// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/context';
//test


export class SolicitudControllerController {
  constructor(
    @repository(TipoTramiteRepository) public tipoTramiteRepository: TipoTramiteRepository,
    @repository(IntermediarioTramiteRepository) public intermediarioTramiteRepository: IntermediarioTramiteRepository,
    @repository(TipoTramiteEtapaSolicitudRepository) public tipoTramiteEtapaSolicitudRepository: TipoTramiteEtapaSolicitudRepository,
    @repository(EmpresaRepository) public empresaRepository: EmpresaRepository,
    @repository(SolicitanteAutorizadoRepository) public solicitanteAutorizadoRepository: SolicitanteAutorizadoRepository,
    @repository(PersonaNaturalRepository) public personaNaturalrepsitory: PersonaNaturalRepository,
    @repository(SolicitudTramiteRepository) public solicitudTramiteRepository: SolicitudTramiteRepository,
    @repository(SujetoSolicitudRepository) public sujetoSolicitudRepository: SujetoSolicitudRepository,
    @repository(SolicitanteTramiteRepository) public solicitanteTramiteRepository: SolicitanteTramiteRepository,
    @repository(EstadoSolicitudRepository) public estadoSolicitudRepository: EstadoSolicitudRepository,
    @repository(RegionRepository) public regionRepository: RegionRepository,
    @repository(AnalistaRepository) public analistaRepository: AnalistaRepository,
  ) { }

  @post('/tramites/internacional/chile-chile/solicitud/empresa')
  async ingresarSolicitudEmpresa(@requestBody() params: any): Promise<any> {
    try {
      if (!params || !params.identificadorIntermediario || !params.fechaHoraCreacion || !params.solicitante
        || !params.tipoSujeto || !params.sujeto || !params.solicitante.rut
        || !params.solicitante.nombre || !params.sujeto.rut /*|| !params.sujeto.nombre*/) {
        throw { error: { statusCode: 502, message: 'Parámetros incorrectos' } };
      }
      // let tiposTramite = await gestionTramitesGateway.obtenerTiposTramites()
      let tiposTramite: any = await this.tipoTramiteRepository.obtenerTipoTramites();
      // let intermediarios = await gestionTramitesGateway.obtenerIntermediarios()
      let intermediarios: any = await this.intermediarioTramiteRepository.obtenerIntermediarios();
      // let etapas = await gestionTramitesGateway.obtenerEtapasSolicitudes()
      let etapas: any = await this.tipoTramiteEtapaSolicitudRepository.obtenerEtapasSolicitudes();
      let empresa: any, personaNatural: any;
      if (params.tipoSujeto.toLowerCase() === 'empresa') {
        // valido que exista la empresa
        // empresa = await internacionalGateway.obtenerEmpresaByRut(params.sujeto.rut)
        empresa = (await this.empresaRepository.obtenerEmpresaByRut(params.sujeto.rut))[0];
        if (empresa == undefined) {
          return {
            codigoResultado: 4,
            descripcionResultado: "No existe una empresa registrada con el rut " + params.sujeto.rut + "."
          }
        }

        // let solicitantes = await internacionalGateway.obtenerSolicitantesAutorizadosByEmpresaId(empresa.id)
        let solicitantes: any = await this.solicitanteAutorizadoRepository.obtenerSolicitantesAutorizadosByEmpresaId(empresa.id);
        let solicitante = solicitantes.find((s: any) => s.identificador === params.solicitante.rut)
        if (!solicitante) {
          return {
            codigoResultado: 3,
            descripcionResultado: "Solicitante rut " + params.solicitante.rut + " no esta autorizado para la empresa " + params.sujeto.rut
          }
        }
      } else {
        // acaaca logica de persona, registrarla cuando no exista y almacenar direccion
        // personaNatural = await internacionalGateway.obtenerPersonaNaturalByRut(params.sujeto.rut)
        personaNatural = (await this.personaNaturalrepsitory.obtenerPersonaNaturalByRut(params.sujeto.rut))[0];
        if (!personaNatural) {
          let personaCrear = {
            nombreCompleto: params.sujeto.nombre,
            identificador: params.sujeto.rut,
            tipoIdentificadorId: 1,
            email: params.sujeto.email
          }
          // personaNatural = await internacionalGateway.crearPersonaNatural(personaCrear)
          personaNatural = (await this.personaNaturalrepsitory.crearPersonaNatural(personaCrear))[0];
          let direccionPersonaNatural = {
            codigo_region: params.sujeto.direccion.codigoRegion,
            codigo_comuna: params.sujeto.direccion.codigoComuna,
            texto: params.sujeto.direccion.textoDireccion,
            tipo: 'particular',
            persona_id: personaNatural.id
          }
          // internacionalGateway.crearDireccionPersonaNatural(direccionPersonaNatural)
          this.personaNaturalrepsitory.crearDireccionPersonaNatural(direccionPersonaNatural);
        }

      }

      // let solicitantePermiso = await internacionalGateway.obtenerPersonaNaturalByRut(params.solicitante.rut)
      let solicitantePermiso: any = (await this.personaNaturalrepsitory.obtenerPersonaNaturalByRut(params.solicitante.rut))[0];
      if (solicitantePermiso.id == undefined) {
        let solitateCrear = {
          nombreCompleto: params.solicitante.nombre,
          identificador: params.solicitante.rut,
          tipoIdentificadorId: 1
        }
        // solicitantePermiso = await internacionalGateway.crearPersonaNatural(solitateCrear)
        solicitantePermiso = (await this.personaNaturalrepsitory.crearPersonaNatural(solitateCrear))[0];
      }

      let permiso = {
        identificadorIntermediario: params.identificadorIntermediario,
        metadata: JSON.stringify({
          identificadorIntermediario: params.identificadorIntermediario,
          fechaHoraCreacion: params.fechaHoraCreacion,
          tipoSujeto: params.tipoSujeto,
          // relacionSolicitanteSujeto: params.relacionSolicitanteSujeto,
          solicitanteRut: params.solicitante.rut,
          solicitanteNombre: params.solicitante.nombre,
          sujetoRut: params.sujeto.rut,
          sujetoNombre: params.sujeto.nombre
        }),
        fechaHoraCreacion: moment(params.fechaHoraCreacion, "DD/MM/YYYY kk:mm:ss").toDate(),
        tipoTramiteId: tiposTramite.find((tipo: any) => tipo.codigo === 'chile-chile').id,
        intermediarioId: intermediarios[0].id
      }
      // let solicitud = await gestionTramitesGateway.obtenerSolicitudByIdentificadorIntermediario(params.identificadorIntermediario)
      let solicitud: any = (await this.solicitudTramiteRepository.obtenerSolicitudByIdentificadorIntermediario(params.identificadorIntermediario))[0];
      if (solicitud.id != undefined) {
        return {
          codigoResultado: 2,
          descripcionResultado: "La solicitud con el identificador " + params.identificadorIntermediario + " ya existe."
        }
      }
      // await gestionTramitesGateway.crearSolicitudPermiso(permiso)
      await this.solicitudTramiteRepository.crearSolicitudPermiso(permiso)
        .then(async (resp: any) => {
          if (params.tipoSujeto.toLowerCase() === 'empresa') {
            // gestionTramitesGateway.crearSujetoPersonaJuridicaPermiso(resp.id, empresa.persona_juridica_id)
            this.sujetoSolicitudRepository.crearSujetoPersonaJuridicaPermiso(resp[0].id, empresa.persona_juridica_id);
          } else {
            // gestionTramitesGateway.crearSujetoPersonaNaturalPermiso(resp.id, personaNatural.id)
            this.sujetoSolicitudRepository.crearSujetoPersonaNaturalPermiso(resp[0].id, personaNatural.id);
          }

          //gestionTramitesGateway.crearSolicitantePermiso(params.relacionSolicitanteSujeto, resp.id, solicitantePermiso.id)
          // gestionTramitesGateway.crearSolicitantePermiso('', resp.id, solicitantePermiso.id)
          this.solicitanteTramiteRepository.crearSolicitantePermiso('', resp[0].id, solicitantePermiso.id);

          let estado = {
            analistaId: null,
            metadata: JSON.stringify({ permiso: permiso }),
            etapaId: etapas.find((etapa: any) => etapa.nombre === 'Ingresado').id,
            solicitudId: resp.id,
            fechaHora: moment(params.fechaHoraCreacion, "DD/MM/YYYY").toDate()
          }
          // await gestionTramitesGateway.crearEstadoSolicitudPermiso(estado)
          this.estadoSolicitudRepository.crearEstadoSolicitudPermiso(estado)
            .then((respCambioEstado: any) => {
              return {
                codigoResultado: 1,
                descripcionResultado: "Solicitud de Permiso creada correctamente"
              }
            })
            .catch((error: any) => {
              console.log(error)
              controllerLogger.error(error, error);
              throw new HttpErrors.InternalServerError('No fue posible crear la solicitud de permiso');
            })
        })
        .catch((error: any) => {
          console.log(error)
          controllerLogger.error(error, error);
          throw new HttpErrors.InternalServerError('No fue posible crear la solicitud de permiso');
        })
    } catch (ex) {
      console.log(ex)

      controllerLogger.error(ex, ex);
      throw new HttpErrors.InternalServerError(ex.toString());
    }
  }
  @post('/tramites/internacional/chile-chile/solicitud/persona')
  async ingresarSolicitudPersona(@requestBody() params: any): Promise<any> {
    try {
      if (!params || !params.identificadorIntermediario || !params.fechaHoraCreacion || !params.solicitante
        || !params.tipoSujeto || !params.sujeto || !params.solicitante.rut || !params.solicitante.email
        || !params.solicitante.codigoRegion || !params.solicitante.codigoComuna || !params.solicitante.direccion
        || !params.solicitante.nombre || !params.sujeto.rut || !params.sujeto.nombre) {
        throw { error: { statusCode: 502, message: 'Parámetros incorrectos' } };
      }
      // let tiposTramite = await gestionTramitesGateway.obtenerTiposTramites()
      let tiposTramite: any = await this.tipoTramiteRepository.obtenerTipoTramites();
      // let intermediarios = await gestionTramitesGateway.obtenerIntermediarios()
      let intermediarios: any = await this.intermediarioTramiteRepository.obtenerIntermediarios();
      // let etapas = await gestionTramitesGateway.obtenerEtapasSolicitudes()
      let etapas: any = await this.tipoTramiteEtapaSolicitudRepository.obtenerEtapasSolicitudes();
      let empresa: any, personaNatural: any;
      if (params.tipoSujeto.toLowerCase() === 'empresa') {
        // valido que exista la empresa
        // empresa = await internacionalGateway.obtenerEmpresaByRut(params.sujeto.rut)
        empresa = (await this.empresaRepository.obtenerEmpresaByRut(params.sujeto.rut))[0];
        if (empresa.id == undefined) {
          return {
            codigoResultado: 4,
            descripcionResultado: "No existe una empresa registrada con el rut " + params.sujeto.rut + "."
          }
        }

        // let solicitantes = await internacionalGateway.obtenerSolicitantesAutorizadosByEmpresaId(empresa.id)
        let solicitantes: any = await this.solicitanteAutorizadoRepository.obtenerSolicitantesAutorizadosByEmpresaId(empresa.id);
        let solicitante = solicitantes.find((s: any) => s.identificador === params.solicitante.rut)
        if (solicitante.id == undefined) {
          return {
            codigoResultado: 3,
            descripcionResultado: "Solicitante rut " + params.solicitante.rut + " no esta autorizado para la empresa " + params.sujeto.rut
          }
        }
      } else {
        // acaaca logica de persona, registrarla cuando no exista y almacenar direccion
        console.log("entra a generar direccion")
        // personaNatural = await internacionalGateway.obtenerPersonaNaturalByRut(params.sujeto.rut)
        personaNatural = this.personaNaturalrepsitory.obtenerPersonaNaturalByRut(params.sujeto.rut);
        if (personaNatural.id == undefined) {
          let personaCrear = {
            nombreCompleto: params.sujeto.nombre,
            identificador: params.sujeto.rut,
            tipoIdentificadorId: 1,
            email: params.solicitante.email
          }
          // personaNatural = await internacionalGateway.crearPersonaNatural(personaCrear)
          personaNatural = (await this.personaNaturalrepsitory.crearPersonaNatural(personaCrear))[0];
          console.log("crearPersonaNatural")
          console.log(params.solicitante.codigoRegion)
          console.log(params.solicitante.codigoComuna)
          let direccionPersonaNatural = {
            codigo_region: params.solicitante.codigoRegion,
            codigo_comuna: params.solicitante.codigoComuna,
            texto: params.solicitante.direccion,
            tipo: 'particular',
            persona_id: personaNatural.id
          }
          //console.log (codigo_region)
          //console.log (codigo_comuna)
          //console.log (texto)
          console.log("paso a crear direccion")
          // internacionalGateway.crearDireccionPersonaNatural(direccionPersonaNatural)
          this.personaNaturalrepsitory.crearDireccionPersonaNatural(direccionPersonaNatural);
        }
      }

      // let solicitantePermiso = await internacionalGateway.obtenerPersonaNaturalByRut(params.solicitante.rut)
      let solicitantePermiso: any = (await this.personaNaturalrepsitory.obtenerPersonaNaturalByRut(params.solicitante.rut))[0];
      if (solicitantePermiso.id == undefined) {
        let solitateCrear = {
          nombreCompleto: params.solicitante.nombre,
          identificador: params.solicitante.rut,
          tipoIdentificadorId: 1
        }
        // solicitantePermiso = await internacionalGateway.crearPersonaNatural(solitateCrear)
        solicitantePermiso = await this.personaNaturalrepsitory.crearPersonaNatural(solitateCrear);
      }

      let permiso = {
        identificadorIntermediario: params.identificadorIntermediario,
        metadata: JSON.stringify({
          identificadorIntermediario: params.identificadorIntermediario,
          fechaHoraCreacion: params.fechaHoraCreacion,
          tipoSujeto: params.tipoSujeto,
          // relacionSolicitanteSujeto: params.relacionSolicitanteSujeto,
          solicitanteRut: params.solicitante.rut,
          solicitanteNombre: params.solicitante.nombre,
          sujetoRut: params.sujeto.rut,
          sujetoNombre: params.sujeto.nombre
        }),
        fechaHoraCreacion: moment(params.fechaHoraCreacion, "DD/MM/YYYY kk:mm:ss").toDate(),
        tipoTramiteId: tiposTramite.find((tipo: any) => tipo.codigo === 'chile-chile').id,
        intermediarioId: intermediarios[0].id
      }
      // let solicitud = await gestionTramitesGateway.obtenerSolicitudByIdentificadorIntermediario(params.identificadorIntermediario)
      let solicitud: any = await this.solicitudTramiteRepository.obtenerSolicitudByIdentificadorIntermediario(params.identificadorIntermediario);
      if (solicitud.id != undefined) {
        return {
          codigoResultado: 2,
          descripcionResultado: "La solicitud con el identificador " + params.identificadorIntermediario + " ya existe."
        }
      }
      // await gestionTramitesGateway.crearSolicitudPermiso(permiso)
      this.solicitudTramiteRepository.crearSolicitudPermiso(permiso)
        .then(async (resp: any) => {
          if (params.tipoSujeto.toLowerCase() === 'empresa') {
            // gestionTramitesGateway.crearSujetoPersonaJuridicaPermiso(resp.id, empresa.persona_juridica_id)
            this.sujetoSolicitudRepository.crearSujetoPersonaJuridicaPermiso(resp[0].id, empresa.persona_juridica_id);
          } else {
            // gestionTramitesGateway.crearSujetoPersonaNaturalPermiso(resp.id, personaNatural.id)
            this.sujetoSolicitudRepository.crearSujetoPersonaNaturalPermiso(resp[0].id, personaNatural.id);
          }

          //gestionTramitesGateway.crearSolicitantePermiso(params.relacionSolicitanteSujeto, resp.id, solicitantePermiso.id)
          // gestionTramitesGateway.crearSolicitantePermiso('', resp.id, solicitantePermiso.id)
          this.solicitanteTramiteRepository.crearSolicitantePermiso('', resp[0].id, solicitantePermiso.id);

          let estado = {
            analistaId: null,
            metadata: JSON.stringify({ permiso: permiso }),
            etapaId: etapas.find((etapa: any) => etapa.nombre === 'Ingresado').id,
            solicitudId: resp.id,
            fechaHora: moment(params.fechaHoraCreacion, "DD/MM/YYYY").toDate()
          }
          // await gestionTramitesGateway.crearEstadoSolicitudPermiso(estado)
          this.estadoSolicitudRepository.crearEstadoSolicitudPermiso(estado)
            .then((respCambioEstado: any) => {
              return {
                codigoResultado: 1,
                descripcionResultado: "Solicitud de Permiso creada correctamente"
              }
            })
            .catch((error: any) => {
              console.log(error)
              throw new HttpErrors.InternalServerError('No fue posible crear la solicitud de permiso');
            })
        })
        .catch((error: any) => {
          console.log(error)
          throw new HttpErrors.InternalServerError('No fue posible crear la solicitud de permiso');
        })
    } catch (ex) {
      console.log(ex);
      throw new HttpErrors.InternalServerError('No fue posible crear la solicitud de permiso');
    }
  }
  @put('/tramites/internacional/chile-chile/solicitud')
  async rechazoSolicitud(@requestBody() params: any): Promise<any> {
    try {
      if (!params || !params.identificadorIntermediario || !params.fechaHoraRechazo || !params.tipoRechazo ||
        !params.motivo || !params.emailNotificacion || !params.tipoRechazo.codigo ||
        !params.tipoRechazo.descripcion || !params.analista || !params.analista.codigo ||
        !params.analista.nombre || !params.analista.codigoRegion) {
        throw { error: { statusCode: 502, message: 'Parámetros incorrectos' } };
      }
      // let intermediarios = await gestionTramitesGateway.obtenerIntermediarios()
      let intermediarios: any = await this.intermediarioTramiteRepository.obtenerIntermediarios();
      // let etapas = await gestionTramitesGateway.obtenerEtapasSolicitudes()
      let etapas: any = await this.tipoTramiteEtapaSolicitudRepository.obtenerEtapasSolicitudes();
      // let regiones = await internacionalGateway.obtenerRegiones()
      let regiones: any = await this.regionRepository.obtenerRegiones();
      let region = regiones.find((r: any) => r.codigo === params.analista.codigoRegion)
      if (region.id == undefined) {
        return {
          codigoResultado: 3,
          descripcionResultado: "No existe una región con el código " + params.codigoRegion + "."
        }
      }
      // let analistas = await gestionTramitesGateway.obtenerAnalistas()
      let analistas: any = await this.analistaRepository.obtenerAnalistas();
      let analista = analistas.find((analista: any) => analista.codigo === params.analista.codigo)
      if (analista.id == undefined) {
        analista = {
          codigo: params.analista.codigo,
          nombre_completo: params.analista.nombre,
          region_id: region.id
        }
        // let resultadoCreacionAnalista = await gestionTramitesGateway.crearAnalista(analista)
        let resultadoCreacionAnalista: any = (await this.analistaRepository.crearAnalista(analista))[0];
        analista.id = resultadoCreacionAnalista.id;
      } else {
        if (analista.nombre_completo !== params.analista.nombre || analista.region_id.toString() !== params.analista.codigoRegion) {
          // await gestionTramitesGateway.actualizarAnalista(analista)
          await this.analistaRepository.actualizarAnalista(params.nombreAnalista, params.codigoRegion, params.codigoAnalista);
        }
      }
      // let solicitud = await gestionTramitesGateway.obtenerSolicitudByIdentificadorIntermediario(params.identificadorIntermediario)
      let solicitud: any = await this.solicitudTramiteRepository.obtenerSolicitudByIdentificadorIntermediario(params.identificadorIntermediario);
      if (solicitud.id == undefined) {
        return {
          codigoResultado: 2,
          descripcionResultado: "No existe una solicitud con el identificador de intermediario " + params.identificadorIntermediario + "."
        }
      }
      let estado = {
        analistaId: analista.id,
        metadata: JSON.stringify({ tipoRechazo: { codigo: params.tipoRechazo.codigo, descripcion: params.tipoRechazo.descripcion }, motivo: params.motivo, emailNotificacion: params.emailNotificacion }),
        etapaId: etapas.find((etapa: any) => etapa.nombre === 'Rechazada').id,
        solicitudId: solicitud.id,
        fechaHora: moment(params.fechaHoraRechazo, "DD/MM/YYYY").toDate()
      }
      // await gestionTramitesGateway.crearEstadoSolicitudPermiso(estado)
      await this.estadoSolicitudRepository.crearEstadoSolicitudPermiso(estado)
        .then((resp: any) => {
          return {
            codigoResultado: 1,
            descripcionResultado: "Rechazo exitoso de Solicitud de Permiso"
          }
        })
        .catch((error: any) => {
          console.log(error)
          throw { error: { statusCode: 502, message: 'No fue posible rechazar la solicitud de permiso' } };
        })
    } catch (ex) {
      console.log(ex)
      throw { error: { statusCode: 502, message: ex.toString() } };
    }
  }
}
