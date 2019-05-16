import { post, requestBody, HttpErrors } from "@loopback/rest";
import { repository } from "@loopback/repository";
import { TipoTramiteRepository, IntermediarioTramiteRepository, RegionRepository, AnalistaRepository, EmpresaRepository, PermisoRepository, TipoIdPersonaRepository, PersonaNaturalRepository, PersonaJuridicaRepository, TipoEmpresaRepository, DomicilioEmpresaRepository, SolicitanteAutorizadoRepository, TipoDocumentoRepository, DocumentoEmpresaRepository, EstadoTramiteRepository } from "../repositories";
import * as moment from 'moment';
import { controllerLogger } from "../logger/logger-config";
import { getHeapStatistics } from "v8";
import { SolicitanteAutorizado } from "../models";

// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/context';


export class EmpresaControllerController {
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
  ) { }
  @post('/tramites/internacional/chile-chile/empresa')
  public async creacionTramiteCreacionEmpresa(@requestBody() params: any): Promise<any> {
    try {
      // let params = ctx.request.body
      if (!params || !params.identificadorIntermediario || !params.fechaHoraCreacion || !params.solicitante
        || !params.relacionSolicitanteEmpresa || !params.empresa || !params.documentosAdjuntos
        || !params.solicitante.nombre || !params.solicitante.rut || !params.solicitante.email
        || !params.empresa.rut || !params.empresa.razonSocial || !params.empresa.nombreFantasia
        || !params.empresa.tipoEmpresa || !params.empresa.direccion || !params.empresa.representanteLegal
        || !params.codigoAnalista || !params.nombreAnalista || !params.codigoRegion) {
        throw { error: { statusCode: 502, message: 'Parámetros incorrectos' } };
      }
      console.log('Paso 1')
      // let tiposTramite = await gestionTramitesGateway.obtenerTiposTramites()
      let tiposTramite: any = await this.tipoTramiteRepository.obtenerTipoTramites();
      let tipoTramite = tiposTramite.find((tipo: any) => tipo.codigo === 'creacion-empresa')
      if (tipoTramite.id == undefined) console.error('Debe crear un Tipo de Trámite con código creacion-empresa.')
      // let intermediarios = await gestionTramitesGateway.obtenerIntermediarios()
      let intermediarios: any = await this.intermediarioTramiteRepository.obtenerIntermediarios();
      // let regiones = await internacionalGateway.obtenerRegiones()
      let regiones: any = await this.regionRepository.obtenerRegiones();
      let region = regiones.find((r: any) => r.codigo === params.codigoRegion)
      console.log('Paso 2')
      console.log(region)
      if (region.id == undefined) {
        return {
          codigoResultado: 3,
          descripcionResultado: "No existe una región con el código " + params.codigoRegion + "."
        }
      }
      // let analistas = await gestionTramitesGateway.obtenerAnalistas()
      let analistas: any = await this.analistaRepository.obtenerAnalistas();
      let analista = analistas.find((analista: any) => analista.codigo === params.codigoAnalista)
      if (analista.id == undefined) {
        analista = {
          codigo: params.codigoAnalista,
          nombre_completo: params.nombreAnalista,
          region_id: region.id
        }
        // let resultadoCreacionAnalista = await gestionTramitesGateway.crearAnalista(analista)
        let resultadoCreacionAnalista: any = await this.analistaRepository.crearAnalista(analista);
        analista.id = resultadoCreacionAnalista.id
      } else {
        if (analista.nombre_completo !== params.nombreAnalista || analista.region_id.toString() !== params.codigoRegion) {
          // await gestionTramitesGateway.actualizarAnalista(analista)
          await this.analistaRepository.actualizarAnalista(analista);
        }
      }
      // let empresa = await internacionalGateway.obtenerEmpresaByRut(params.empresa.rut)
      let empresa: any = (await this.empresaRepository.obtenerEmpresaByRut(params.empresa.rut))[0];
      if (empresa.id != undefined) {
        return {
          codigoResultado: 4,
          descripcionResultado: "Ya existe una empresa registrada con el rut " + params.empresa.rut + "."
        }
      }
      let tramite = {
        identificadorIntermediario: params.identificadorIntermediario,
        analistaId: analista.id,
        solicitudId: null,
        metadata: JSON.stringify({
          //relacionSolicitanteEmpresa: params.relacionSolicitanteEmpresa,
          solicitante: params.solicitante,
          empresa: params.empresa
        }),
        codigo: null,
        fechaHoraCreacion: moment(params.fechaHoraCreacion, "DD/MM/YYYY kk:mm:ss").toDate(),
        tipoTramiteId: tipoTramite.id,
        intermediarioId: intermediarios[0].id
      }

      // await gestionTramitesGateway.crearTramite(tramite)
      await this.permisoRepository.crearTramite(tramite)
        .then(async (resp: any) => {
          // let tiposIdentificadores = await internacionalGateway.obtenerTiposIdentificadoresPersonas()
          let tiposIdentificadores = await this.tipoIdPersonaRepository.obtenerTiposIdentificadoresPersonas();
          let tipoIdRut = tiposIdentificadores.find((tipo: any) => tipo.codigo === 'RUT')
          if (!tipoIdRut) console.error('Debe crear el tipo de identificador con código RUT')
          let representanteLegal = {
            nombreCompleto: params.empresa.representanteLegal.nombre,
            identificador: params.empresa.representanteLegal.rut,
            tipoIdentificadorId: tipoIdRut.id
          }
          // let persona = await internacionalGateway.obtenerPersonaNaturalByRut(representanteLegal.identificador)
          let persona: any = await this.personaNaturalrepsitory.obtenerPersonaNaturalByRut(representanteLegal.identificador);
          if (persona.id == undefined) {
            persona = {
              nombreCompleto: representanteLegal.nombreCompleto,
              identificador: representanteLegal.identificador,
              tipoIdentificadorId: representanteLegal.tipoIdentificadorId
            }
            // let respuestaCreacionPersonaNatural = await internacionalGateway.crearPersonaNatural(persona)
            let respuestaCreacionPersonaNatural: any = await this.personaNaturalrepsitory.crearPersonaNatural(persona);
            persona.id = respuestaCreacionPersonaNatural.id;
            let direccionParticularRepresentante = {
              codigo_region: params.empresa.representanteLegal.direccion.codigoRegionIntermediario,
              codigo_comuna: params.empresa.representanteLegal.direccion.codigoComunaIntermediario,
              texto: params.empresa.representanteLegal.direccion.textoDireccion,
              tipo: 'particular',
              persona_id: respuestaCreacionPersonaNatural.id
            }
            // await internacionalGateway.crearDireccionPersonaNatural(direccionParticularRepresentante)
            await this.personaNaturalrepsitory.crearDireccionPersonaNatural(direccionParticularRepresentante);
          }

          let personaJuridica = {
            razonSocial: params.empresa.razonSocial,
            identificador: params.empresa.rut,
            tipoIdentificadorId: tipoIdRut.id,
            nombreFantasia: params.empresa.nombreFantasia,
            representanteLegalId: persona.id
          }
          // let respuestaCreacionPersonaJuridica = await internacionalGateway.crearPersonaJuridica(personaJuridica)
          let respuestaCreacionPersonaJuridica = (await this.personaJuridicaRepository.crearPersonaJuridica(personaJuridica))[0];
          // let tipoEmpresa = await internacionalGateway.obtenerTipoEmpresaByCodigo(params.empresa.tipoEmpresa)
          let tipoEmpresa = (await this.tipoEmpresaRepository.obtenerTipoEmpresaByCodigo(params.empresa.tipoEmpresa))[0];

          // let empresaCreada = await internacionalGateway.crearEmpresa(respuestaCreacionPersonaJuridica.id, tipoEmpresa.id)
          let empresaCreada: any = (await this.empresaRepository.crearEmpresa(respuestaCreacionPersonaJuridica.id, tipoEmpresa.id))[0];

          let domicilio = {
            codigoRegion: params.empresa.direccion.codigoRegionIntermediario,
            codigoComuna: params.empresa.direccion.codigoComunaIntermediario,
            texto: params.empresa.direccion.textoDireccion,
            telefonoFijo: params.empresa.direccion.telefonoFijo,
            telefonoMovil: params.empresa.direccion.telefonoMovil,
            email: params.empresa.direccion.email,
            empresaId: empresaCreada.id
          }
          // await internacionalGateway.crearDomicilioEmpresa(domicilio)
          await this.domicilioEmpresaRepository.crearDomicilioEmpresa(domicilio);

          // let solicitante = await internacionalGateway.obtenerPersonaNaturalByRut(params.solicitante.rut)
          let solicitante: any = (await this.personaNaturalrepsitory.obtenerPersonaNaturalByRut(params.solicitante.rut))[0];
          if (solicitante.id == undefined) {
            let personaSolicitante: any = {}
            personaSolicitante.nombreCompleto = params.solicitante.nombre
            personaSolicitante.identificador = params.solicitante.rut
            personaSolicitante.tipoIdentificadorId = 1
            personaSolicitante.email = params.solicitante.email
            // let solicitanteCreado = await internacionalGateway.crearPersonaNatural(personaSolicitante)
            let solicitanteCreado: any = (await this.personaNaturalrepsitory.crearPersonaNatural(personaSolicitante))[0];
            // await internacionalGateway.crearSolicitanteAutorizado(empresaCreada.id, solicitanteCreado.id, params.relacionSolicitanteEmpresa)
            await this.solicitanteAutorizadoRepository.crearSolicitanteAutorizado(empresaCreada.id, solicitanteCreado.id, params.relacionSolicitanteEmpresa);
          } else {
            // await internacionalGateway.crearSolicitanteAutorizado(empresaCreada.id, solicitante.id, params.relacionSolicitanteEmpresa)
            await this.solicitanteAutorizadoRepository.crearSolicitanteAutorizado(empresaCreada.id, solicitante.id, params.relacionSolicitanteEmpresa);
          }

          await params.documentosAdjuntos.forEach(async (documento: any) => {
            // let tipoDocumento = await internacionalGateway.obtenerTipoDocumentoByCodigo(documento.codigoTipoDocumento)
            let tipoDocumento: any = await this.tipoDocumentoRepository.obtenerTipoDocumentoByCodigo(documento.codigoTipoDocumento);
            // await internacionalGateway.crearDocumentoEmpresa(tipoDocumento[0].id, empresaCreada.id, documento.urlDescargaDocumento)
            (await this.documentoEmpresaRepository.crearDocumentoEmpresa(tipoDocumento[0].id, empresaCreada.id, documento.urlDescargaDocumento))[0];

          })

          console.log('tramite')
          console.log(resp[0])
          // await gestionTramitesGateway.crearEstadoTramite(resp.id, 7)
          await this.estadoTramiteRepository.crearEstadoTramite(resp[0].id, 7);


          return {
            codigoResultado: 1,
            descripcionResultado: "Trámite de Creación de Empresa registrado exitosamente. Empresa creada."
          }
        })
        .catch((error: any) => {
          console.log(error)
          controllerLogger.error(error, error);
          throw new HttpErrors.InternalServerError('No fue posible crear la empresa');
        })
    } catch (ex) {
      console.log(ex);
      controllerLogger.error(ex, ex);
      throw new HttpErrors.InternalServerError(ex.toString());
    }
  }
}
