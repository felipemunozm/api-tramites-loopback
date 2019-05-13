import { post, param, requestBody, HttpErrors } from "@loopback/rest";
import * as moment from 'moment';
import { controllerLogger } from "../logger/logger-config";
import { repository } from "@loopback/repository";
import { TipoTramiteRepository, IntermediarioTramiteRepository, TipoTramiteEtapaSolicitudRepository, EmpresaRepository, SolicitanteAutorizadoRepository, PersonaNaturalRepository, SolicitudTramiteRepository, SujetoSolicitudRepository, SolicitanteTramiteRepository, EstadoSolicitudRepository } from "../repositories";

// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/context';


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
  ) { }

  @post('/tramites/internacional/chile-chile/solicitud/empresa')
  async ingresarSolicitudEmpresa(@requestBody() params: any): Promise<any> {
    try {
      if (!params || !params.identificadorIntermediario || !params.fechaHoraCreacion || !params.solicitante
        || !params.tipoSujeto || !params.sujeto || !params.solicitante.rut
        || !params.solicitante.nombre || !params.sujeto.rut /*|| !params.sujeto.nombre*/) {
        throw 'Parámetros incorrectos';
        return
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
            this.sujetoSolicitudRepository.crearSujetoPersonaNaturalPermiso(resp.id, personaNatural.id);
          }

          //gestionTramitesGateway.crearSolicitantePermiso(params.relacionSolicitanteSujeto, resp.id, solicitantePermiso.id)
          // gestionTramitesGateway.crearSolicitantePermiso('', resp.id, solicitantePermiso.id)
          this.solicitanteTramiteRepository.crearSolicitantePermiso('', resp.id, solicitantePermiso.id);

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
}
