import {
  post,
  requestBody,
  HttpErrors,
  put,
  param,
  get
} from "@loopback/rest";
import {
  repository
} from "@loopback/repository";
import {
  TipoTramiteRepository,
  IntermediarioTramiteRepository,
  RegionRepository,
  AnalistaRepository,
  EmpresaRepository,
  TipoIdPersonaRepository,
  PersonaNaturalRepository,
  PersonaJuridicaRepository,
  TipoEmpresaRepository,
  DomicilioEmpresaRepository,
  SolicitanteAutorizadoRepository,
  TipoDocumentoRepository,
  DocumentoEmpresaRepository,
  EstadoTramiteRepository,
  DireccionPersonaNaturalRepository,
  TramiteRepository
} from "../repositories";
import * as moment from 'moment';
import {
  controllerLogger
} from "../logger/logger-config";
import {
  getHeapStatistics
} from "v8";
import {
  SolicitanteAutorizado
} from "../models";
import {
  httpify
} from "caseless";
import {
  Any
} from "json2typescript";
import { HttpError } from "http-errors";
// Uncomment these imports to begin using these cool features!
export class EmpresaControllerController {
  constructor(
    @repository(TipoTramiteRepository) public tipoTramiteRepository: TipoTramiteRepository,
    @repository(IntermediarioTramiteRepository) public intermediarioTramiteRepository: IntermediarioTramiteRepository,
    @repository(RegionRepository) public regionRepository: RegionRepository,
    @repository(AnalistaRepository) public analistaRepository: AnalistaRepository,
    @repository(EmpresaRepository) public empresaRepository: EmpresaRepository,
    @repository(TipoIdPersonaRepository) public tipoIdPersonaRepository: TipoIdPersonaRepository,
    @repository(PersonaNaturalRepository) public personaNaturalrepsitory: PersonaNaturalRepository,
    @repository(PersonaJuridicaRepository) public personaJuridicaRepository: PersonaJuridicaRepository,
    @repository(TipoEmpresaRepository) public tipoEmpresaRepository: TipoEmpresaRepository,
    @repository(DomicilioEmpresaRepository) public domicilioEmpresaRepository: DomicilioEmpresaRepository,
    @repository(SolicitanteAutorizadoRepository) public solicitanteAutorizadoRepository: SolicitanteAutorizadoRepository,
    @repository(TipoDocumentoRepository) public tipoDocumentoRepository: TipoDocumentoRepository,
    @repository(DocumentoEmpresaRepository) public documentoEmpresaRepository: DocumentoEmpresaRepository,
    @repository(EstadoTramiteRepository) public estadoTramiteRepository: EstadoTramiteRepository,
    @repository(DireccionPersonaNaturalRepository) public direccionPersonaNaturalRepository: DireccionPersonaNaturalRepository,
    @repository(TramiteRepository) public tramiteRepository: TramiteRepository
  ) { }
  @post('/tramites/internacional/chile-chile/empresa')
  public async creacionTramiteCreacionEmpresa(@requestBody() params: any): Promise<any> {
    try {
      if (!params || !params.identificadorIntermediario || !params.fechaHoraCreacion || !params.solicitante ||
        !params.relacionSolicitanteEmpresa || !params.empresa || !params.documentosAdjuntos ||
        !params.solicitante.nombre || !params.solicitante.rut || !params.solicitante.email ||
        !params.empresa.rut || !params.empresa.razonSocial || !params.empresa.nombreFantasia ||
        !params.empresa.tipoEmpresa || !params.empresa.direccion || !params.empresa.representanteLegal ||
        !params.empresa.tramite || !params.codigoAnalista || !params.nombreAnalista || !params.codigoRegion) {
        throw {
          error: {
            statusCode: 502,
            message: 'Parámetros incorrectos'
          }
        }
      }
      controllerLogger.info('Paso 1')
      let tiposTramite: any = await this.tipoTramiteRepository.obtenerTipoTramites();
      let tipoTramite = tiposTramite.find((tipo: any) => tipo.codigo === 'creacion-empresa')
      if (tipoTramite.id == undefined) console.error('Debe crear un Tipo de Trámite con código creacion-empresa.')
      let intermediarios: any = await this.intermediarioTramiteRepository.obtenerIntermediarios();
      let region = (await this.regionRepository.obtenerRegionesByCodigo(params.codigoRegion))[0]
      controllerLogger.info('Paso 2')
      if (region.id == undefined) {
        return {
          codigoResultado: 3,
          descripcionResultado: "No existe una región con el código (" + params.codigoRegion + ")"
        }
      }
      let analistas: any = await this.analistaRepository.obtenerAnalistas();
      let analista = analistas.find((analista: any) => analista.codigo === params.codigoAnalista)
      controllerLogger.info('Paso 3')
      if (analista.id == undefined) {
        analista = {
          codigo: params.codigoAnalista,
          nombre_completo: params.nombreAnalista,
          region_id: region.id
        }
        let resultadoCreacionAnalista: any = await this.analistaRepository.crearAnalista(analista);
        analista.id = resultadoCreacionAnalista.id
      } else {

        await this.analistaRepository.actualizarAnalista(params.nombreAnalista, params.codigoRegion, params.codigoAnalista);
      }
      controllerLogger.info('Paso 4')
      try {
        let empresa: any = (await this.empresaRepository.obtenerEmpresaByRut(params.empresa.rut))[0];
        if (empresa != undefined) {
          return {
            codigoResultado: 4,
            descripcionResultado: "Ya existe una empresa registrada con el rut (" + params.empresa.rut + ")"
          }
        }
      } catch (ex) {
        controllerLogger.info(ex);
        controllerLogger.error(ex, ex);
        throw new HttpErrors.InternalServerError(ex.toString());
      }
      controllerLogger.info('Paso 5')
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
      controllerLogger.info('Paso 6')
      try {
        let resultadoCrearTramite: any = (await this.tramiteRepository.crearTramite(tramite))[0]

        if (resultadoCrearTramite != undefined) {
          let tiposIdentificadores = await this.tipoIdPersonaRepository.obtenerTiposIdentificadoresPersonas();
          let tipoIdRut = tiposIdentificadores.find((tipo: any) => tipo.codigo === 'RUT')
          if (!tipoIdRut) console.error('Debe crear el tipo de identificador con código RUT')
          let representanteLegal = {
            nombreCompleto: params.empresa.representanteLegal.nombre,
            identificador: params.empresa.representanteLegal.rut,
            email: params.empresa.representanteLegal.direccion.email,
            tipoIdentificadorId: tipoIdRut.id
          }
          controllerLogger.info('Paso 7')

          //---------------- 1-------------

          let persona = (await this.personaNaturalrepsitory.obtenerPersonaNaturalByRut(representanteLegal.identificador))[0];
          if (persona == undefined) {
            persona = {
              nombreCompleto: representanteLegal.nombreCompleto,
              identificador: representanteLegal.identificador,
              tipoIdentificadorId: representanteLegal.tipoIdentificadorId,
              email: representanteLegal.email
            }
            let respuestaCreacionPersonaNatural = (await this.personaNaturalrepsitory.crearPersonaNatural(persona))[0];
            persona.id = respuestaCreacionPersonaNatural.id;

          } else {
            let datosRepresentanteLegal = {
              nombreCompleto: representanteLegal.nombreCompleto,
              identificador: representanteLegal.identificador,
              tipoIdentificadorId: representanteLegal.tipoIdentificadorId,
              email: representanteLegal.email

            }
            await this.personaNaturalrepsitory.actualizarPersonaNaturalByRut(datosRepresentanteLegal.nombreCompleto, datosRepresentanteLegal.identificador, datosRepresentanteLegal.email);
          }

          //-------------------fin ---1-------
          controllerLogger.info('Paso 8')
          let personaJuridica = {
            razonSocial: params.empresa.razonSocial,
            identificador: params.empresa.rut,
            tipoIdentificadorId: tipoIdRut.id,
            nombreFantasia: params.empresa.nombreFantasia,
            representanteLegalId: persona.id,
            tramite: params.empresa.tramite

          }
          controllerLogger.info('Paso 9')
          let tipoEmpresa = (await this.tipoEmpresaRepository.obtenerTipoEmpresaByCodigo(params.empresa.tipoEmpresa))[0];
          if (tipoEmpresa === undefined) return {
            codigoResultado: 5,
            descripcionResultado: "El tipo de empresa no existe (" + params.empresa.tipoEmpresa + ")"
          }
          let respuestaCreacionPersonaJuridica = (await this.personaJuridicaRepository.crearPersonaJuridica(personaJuridica))[0];
          let empresaCreada = (await this.empresaRepository.crearEmpresa(respuestaCreacionPersonaJuridica.id, tipoEmpresa.id))[0];
          controllerLogger.info('Paso 10')
          let domicilio = {
            codigoRegion: params.empresa.direccion.codigoRegionIntermediario,
            codigoComuna: params.empresa.direccion.codigoComunaIntermediario,
            texto: params.empresa.direccion.textoDireccion,
            telefonoFijo: params.empresa.direccion.telefonoFijo,
            telefonoMovil: params.empresa.direccion.telefonoMovil,
            email: params.empresa.direccion.email,
            empresaId: empresaCreada.id
          }
          await this.domicilioEmpresaRepository.crearDomicilioEmpresa(domicilio);
          controllerLogger.info('Paso 11')

          //------------------------------------- Solicitante ----------------------------------------------

          let solicitante: any = (await this.personaNaturalrepsitory.obtenerPersonaNaturalByRut(params.solicitante.rut))[0];
          controllerLogger.info('Paso 12')
          if (solicitante == undefined) {
            let personaSolicitante: any = {}
            personaSolicitante.nombreCompleto = params.solicitante.nombre
            personaSolicitante.identificador = params.solicitante.rut
            personaSolicitante.tipoIdentificadorId = 1
            personaSolicitante.email = params.solicitante.email
            let solicitanteCreado: any = (await this.personaNaturalrepsitory.crearPersonaNatural(personaSolicitante))[0];
            let direccion = {
              codigo_region: params.solicitante.direccion.codigoRegionIntermediario,
              codigo_comuna: params.solicitante.direccion.codigoComunaIntermediario,
              texto: params.solicitante.direccion.textoDireccion,
              tipo: 'particular',
              persona_id: solicitanteCreado.id,
              telefono_fijo: params.solicitante.direccion.telefonoFijo,
              telefono_movil: params.soliccitante.direccion.telefonoMovil
            }
            await this.solicitanteAutorizadoRepository.crearSolicitanteAutorizado(empresaCreada.id, solicitanteCreado.id, params.relacionSolicitanteEmpresa);
            await this.personaNaturalrepsitory.crearDireccionPersonaNatural(direccion, respuestaCreacionPersonaJuridica.id);
          }
          controllerLogger.info('Paso 13')
          await this.solicitanteAutorizadoRepository.crearSolicitanteAutorizado(empresaCreada.id, solicitante.id, params.relacionSolicitanteEmpresa);
          if (params.solicitante.rut == params.empresa.representanteLegal.rut) {
            let direccion = {
              codigo_region: params.empresa.direccion.codigoRegionIntermediario,
              codigo_comuna: params.empresa.direccion.codigoComunaIntermediario,
              texto: params.empresa.direccion.textoDireccion,
              tipo: 'particular',
              persona_id: solicitante.id,
              telefono_fijo: params.empresa.direccion.telefonoFijo,
              telefono_movil: params.empresa.direccion.telefonoMovil,
              email: params.empresa.direccion.email

            }
            await this.personaNaturalrepsitory.crearDireccionPersonaNatural(direccion, respuestaCreacionPersonaJuridica.id);
          }
          else {
            let direccion = {
              codigo_region: params.solicitante.direccion.codigoRegionIntermediario,
              codigo_comuna: params.solicitante.direccion.codigoComunaIntermediario,
              texto: params.solicitante.direccion.textoDireccion,
              tipo: 'particular',
              persona_id: solicitante.id,
              telefono_fijo: params.solicitante.direccion.telefonoFijo,
              telefono_movil: params.solicitante.direccion.telefonoMovil,
              email: params.solicitante.email
            }
            await this.personaNaturalrepsitory.crearDireccionPersonaNatural(direccion, respuestaCreacionPersonaJuridica.id);
          }
          controllerLogger.info('Paso 14')
          //----------------------------- Representante legal -----------------------
          let representante: any = (await this.personaNaturalrepsitory.obtenerPersonaNaturalByRut(params.empresa.representanteLegal.rut))[0];
          if (representante == undefined) {
            let personaRepresentante: any = {}
            personaRepresentante.nombreCompleto = params.empresa.representanteLegal.nombre,
              personaRepresentante.identificador = params.empresa.representanteLegal.rut,
              personaRepresentante.tipoIdentificadorId = 1,
              personaRepresentante.email = params.empresa.representanteLegal.direccion.email
            let representanteCreado: any = (await this.personaNaturalrepsitory.crearPersonaNatural(representante))[0];
            let direccionParticularRepresentante = {
              relacionEmpresa: "Representante legal",
              codigo_region: params.empresa.representanteLegal.direccion.codigoRegionIntermediario,
              codigo_comuna: params.empresa.representanteLegal.direccion.codigoComunaIntermediario,
              texto: params.empresa.representanteLegal.direccion.textoDireccion,
              tipo: 'particular',
              persona_id: representante.persona.identificador,
              telefono_fijo: params.empresa.representanteLegal.direccion.telefonoFijo,
              telefono_movil: params.empresa.representanteLegal.direccion.telefonoMovil,
              email: params.empresa.representanteLegal.direccion.email
            }
            await this.personaNaturalrepsitory.crearDireccionPersonaNatural(direccionParticularRepresentante, respuestaCreacionPersonaJuridica.persona_juridica_id);
            controllerLogger.info('Paso 15')
          }
          else {

            let relacionEmpresaRepresentanteLegal = {
              relacionEmpresa: "Representante legal"
            }
            if (params.empresa.representanteLegal.rut != params.solicitante.rut) {
              let direccionParticularRepresentante = {
                codigo_region: params.empresa.representanteLegal.direccion.codigoRegionIntermediario,
                codigo_comuna: params.empresa.representanteLegal.direccion.codigoComunaIntermediario,
                texto: params.empresa.representanteLegal.direccion.textoDireccion,
                tipo: 'particular',
                persona_id: representante.id,
                telefono_fijo: params.empresa.representanteLegal.direccion.telefonoFijo,
                telefono_movil: params.empresa.representanteLegal.direccion.telefonoMovil,
                email: params.empresa.representanteLegal.direccion.email

              }
              await this.personaNaturalrepsitory.crearDireccionPersonaNatural(direccionParticularRepresentante, respuestaCreacionPersonaJuridica.id);
            }
          }
          let relacionEmpresaRepresentanteLegal =
          {
            relacionEmpresa: "Representante legal"
          }
          await this.solicitanteAutorizadoRepository.crearSolicitanteAutorizado(empresaCreada.id, representante.id, relacionEmpresaRepresentanteLegal.relacionEmpresa);

          //-------------------------- FIN RL-------------------

          controllerLogger.info('Paso 16')
          await params.documentosAdjuntos.forEach(async (documento: any) => {
            let tipoDocumento = (await this.tipoDocumentoRepository.obtenerTipoDocumentoByCodigo(documento.codigoTipoDocumento));
            await this.documentoEmpresaRepository.crearDocumentoEmpresa(tipoDocumento[0].id, empresaCreada.id, documento.urlDescargaDocumento);
          })
          controllerLogger.info('Paso 17 Final')
          let estadoTramite: any = (await this.estadoTramiteRepository.crearEstadoTramite(resultadoCrearTramite.id, 7))[0]
          if (estadoTramite != undefined) {
            return {
              codigoResultado: 1,
              descripcionResultado: "Trámite de Creación de empresa éxitosa"
            }
          }
        }
      } catch (error) {
        controllerLogger.error(error, error);
        throw new HttpErrors.InternalServerError(error.toString());
      }
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
  @put('/tramites/internacional/chile-chile/empresa')
  public async modificarTramiteEmpresa(@requestBody() params: any): Promise<any> {
    var mensajes: any = [];
    try {
      if (!params || !params.identificadorIntermediario || !params.fechaHoraCreacion || !params.rutSolicitante ||
        !params.rutEmpresa || !params.modificaciones || !params.documentosAdjuntos || params.modificaciones.length === 0 ||
        !params.analista || !params.analista.codigo || !params.analista.nombre || !params.analista.codigoRegion) {
        throw {
          error: {
            statusCode: 502,
            message: 'Parámetros incorrectos'
          }
        };
      }

      let tiposTramite: any = await this.tipoTramiteRepository.obtenerTipoTramites();
      let tipoTramite = tiposTramite.find((tipo: any) => tipo.codigo === 'modifica-empresa')
      if (!tipoTramite) console.error('Debe crear un Tipo de Trámite con código modificacion-empresa.')
      let intermediarios: any = await this.intermediarioTramiteRepository.obtenerIntermediarios();
      let regiones: any = await this.regionRepository.obtenerRegiones();
      let region = regiones.find((r: any) => r.codigo === params.analista.codigoRegion)
      if (region == undefined) {
        return {
          codigoResultado: 3,
          descripcionResultado: "No existe una región con el código (" + params.analista.codigoRegion + ")"
        }
      }
      //controllerLogger.info('Modificacion 1')
      let analistas: any = await this.analistaRepository.obtenerAnalistas();
      let analista = analistas.find((analista: any) => analista.codigo === params.analista.codigo)
      if (analista == undefined) {
        analista = {
          codigo: params.analista.codigo,
          nombre_completo: params.analista.nombre,
          region_id: region.id
        }
        let resultadoCreacionAnalista: any = (await this.analistaRepository.crearAnalista(analista))[0];
        analista.id = resultadoCreacionAnalista.id;
      } else {
        await this.analistaRepository.actualizarAnalista(params.analista.nombre, params.analista.codigoRegion, params.analista.codigo);
      }
      //controllerLogger.info('Modificacion 2')
      let empresa: any = (await this.empresaRepository.obtenerEmpresaByRut(params.rutEmpresa))[0];
      try {
        if (empresa == undefined) {
          return {
            codigoResultado: 2,
            descripcionResultado: 'No hay una empresa registrada con el rut (' + params.rutEmpresa + ')'
          }
        }
      } catch (ex) {
        controllerLogger.error(ex, ex);
        throw new HttpErrors.InternalServerError(ex.toString());
      }
      //controllerLogger.info('Modificacion 3')
      let tiposIdentificadores: any = await this.tipoIdPersonaRepository.obtenerTiposIdentificadoresPersonas();
      let tipoIdRut = tiposIdentificadores.find((tipo: any) => tipo.codigo === 'RUT')
      if (tipoIdRut == undefined) throw new Error('Debe crear el tipo de identificador con código RUT')
      let modificaciones = params.modificaciones;
      let modificacion: any;
      for (let x = 0; x < modificaciones.length; x++) {
        modificacion = modificaciones[x]
        if (modificacion.tipo == undefined || modificacion.descripcion == undefined) {
          throw new Error('Modificación no contiene los parámetros esperados. ' + JSON.stringify(modificacion))
        }
        switch (modificacion.tipo) {
          case 1:
            controllerLogger.info('Modificaciones caso 1')
            if (modificacion.solicitantes.length === 0) throw new Error('Falta datos del o los solicitantes.')
            await this.solicitanteAutorizadoRepository.borrarSolicitanteAutorizadoExistente(empresa.id);
            //await this.solicitanteAutorizadoRepository.borrarDireccionAutorizadoExistente(empresa.persona_juridica_id);
            modificacion.solicitantes.forEach(async (solicitante: any) => {
              if (solicitante.relacionEmpresa === 'Representante Legal' || solicitante.relacionEmpresa === 'Representante legal' || solicitante.relacionEmpresa === 'representante legal' || solicitante.relacionEmpresa === 'Mandatario' || solicitante.relacionEmpresa === 'mandatario') {
                let persona: any = (await this.personaNaturalrepsitory.obtenerPersonaNaturalByRut(solicitante.rut))[0];
                if (persona == undefined) {
                  persona = {
                    nombreCompleto: solicitante.nombre,
                    identificador: solicitante.rut,
                    tipoIdentificadorId: tipoIdRut.id,
                    email: solicitante.email
                  }
                  let respuestaCreacionPersonaNatural: any = (await this.personaNaturalrepsitory.crearPersonaNatural(persona))[0];
                  persona.id = respuestaCreacionPersonaNatural.id;
                  let direccionParticularRepresentante = {
                    codigo_region: solicitante.codigoRegionIntermediario,
                    codigo_comuna: solicitante.codigoComunaIntermediario,
                    texto: solicitante.textoDireccion,
                    tipo: 'particular',
                    persona_id: respuestaCreacionPersonaNatural.id,
                    telefono_fijo: solicitante.telefonoFijo,
                    telefono_movil: solicitante.telefonoMovil
                  }
                  await this.personaNaturalrepsitory.crearDireccionPersonaNatural(direccionParticularRepresentante, empresa.persona_juridica_id);
                }
                else {
                  await this.personaNaturalrepsitory.actualizarPersonaNaturalByRut(solicitante.nombre, solicitante.rut, solicitante.email);
                  let direccion_mandatario: any = await this.personaNaturalrepsitory.obtenerDireccionByPersonaId(persona.id, empresa.persona_juridica_id);

                  if (!Array.isArray(direccion_mandatario) || direccion_mandatario.length === 0 || direccion_mandatario === undefined) {

                    let direccionParticularMandatario = {
                      texto: solicitante.textoDireccion,
                      tipo: 'particular',
                      persona_id: persona.id,
                      telefono_fijo: solicitante.telefonoFijo,
                      telefono_movil: solicitante.telefonoMovil,
                      codigo_region: solicitante.codigoRegionIntermediario,
                      codigo_comuna: solicitante.codigoComunaIntermediario
                    }
                    await this.personaNaturalrepsitory.crearDireccionPersonaNatural(direccionParticularMandatario, empresa.persona_juridica_id);
                  }
                  else {
                    let direccionParticularMandatario = {
                      texto: solicitante.textoDireccion,
                      tipo: 'particular',
                      persona_id: persona.id,
                      telefono_fijo: solicitante.telefonoFijo,
                      telefono_movil: solicitante.telefonoMovil,
                      codigo_region: solicitante.codigoRegionIntermediario,
                      codigo_comuna: solicitante.codigoComunaIntermediario
                    }
                    await this.personaNaturalrepsitory.actualizarDireccionNaturalByRut(direccionParticularMandatario.codigo_region, direccionParticularMandatario.codigo_comuna, direccionParticularMandatario.tipo, direccionParticularMandatario.texto, direccionParticularMandatario.persona_id, direccionParticularMandatario.telefono_fijo, direccionParticularMandatario.telefono_movil, empresa.persona_juridica_id);
                  }

                  //await this.personaNaturalrepsitory.actualizarDireccionNaturalByRut(direccionParticularMandatario.codigo_region, direccionParticularMandatario.codigo_comuna, direccionParticularMandatario.tipo, direccionParticularMandatario.texto, direccionParticularMandatario.persona_id, direccionParticularMandatario.telefono_fijo, direccionParticularMandatario.telefono_movil, empresa.persona_juridica_id);
                }
                await this.solicitanteAutorizadoRepository.crearSolicitanteAutorizado(empresa.id, persona.id, solicitante.relacionEmpresa);
                //await this.solicitanteAutorizadoRepository.crearDireccionPersonaNatural(direccionParticularRepresentante, empresa.persona_juridica_id);

                mensajes.push('Nuevo solicitante autorizado creado: ' + solicitante.nombre);
              }
              else {
                throw new Error('Relación ' + solicitante.relacionEmpresa + ' desconocida.')
              }
            })
            break
          case 2:
            controllerLogger.info('Modificaciones caso 2')
            if (!modificacion.domicilio.codigoRegionIntermediario || !modificacion.domicilio.codigoComunaIntermediario ||
              !modificacion.domicilio.textoDireccion || !modificacion.domicilio.telefonoFijo || !modificacion.domicilio.email) {
              throw new Error('Parámetros de modificación de domicilio incorrectos.')
            }
            let domicilio: any = {
              codigoRegion: modificacion.domicilio.codigoRegionIntermediario,
              codigoComuna: modificacion.domicilio.codigoComunaIntermediario,
              texto: modificacion.domicilio.textoDireccion,
              telefonoFijo: modificacion.domicilio.telefonoFijo,
              telefonoMovil: modificacion.domicilio.telefonoMovil,
              email: modificacion.domicilio.email,
              empresaId: empresa.id
            }
            let resultadoCreacionDomicilio: any = await this.domicilioEmpresaRepository.actualizarDomicilioEmpresalById(domicilio);
            domicilio.id = resultadoCreacionDomicilio.id;
            mensajes.push('Domicilio de empresa actualizado: ' + domicilio.texto)
            break
          case 3:
            controllerLogger.info('Modificaciones caso 3')
            if (modificacion.razonSocial == undefined) throw new Error('No viene la Razón Social a cambiar.')
            await this.personaJuridicaRepository.actualizarRazonSocialPersonaJuridica(empresa.persona_juridica_id, modificacion.razonSocial);
            mensajes.push('Razón Social modificada a "' + modificacion.razonSocial + '"')
            break
          case 4:
            controllerLogger.info('Modificaciones caso 4')
            if (modificacion.representanteLegal == undefined || modificacion.representanteLegal.rut == undefined || modificacion.representanteLegal.nombre == undefined) throw new Error('Parámetros de Representante Legal incorrectos.')
            let persona: any = (await this.personaNaturalrepsitory.obtenerPersonaNaturalByRut(modificacion.representanteLegal.rut))[0];
            if (persona == undefined) {
              persona = {
                nombreCompleto: modificacion.representanteLegal.nombre,
                identificador: modificacion.representanteLegal.rut,
                tipoIdentificadorId: tipoIdRut.id,
                email: modificacion.representanteLegal.email
              }
              let respuestaCreacionPersonaNatural: any = (await this.personaNaturalrepsitory.crearPersonaNatural(persona))[0];
              persona.id = respuestaCreacionPersonaNatural.id;
              let direccionParticularRepresentante = {
                codigo_region: params.empresa.representanteLegal.direccion.codigoRegionIntermediario,
                codigo_comuna: params.empresa.representanteLegal.direccion.codigoComunaIntermediario,
                texto: params.empresa.representanteLegal.direccion.textoDireccion,
                tipo: 'particular',
                persona_id: respuestaCreacionPersonaNatural.id,
                telefono_fijo: params.empresa.representanteLegal.direccion.telefonoFijo,
                telefono_movil: params.empresa.representanteLegal.direccion.telefonoMovil
              }
              await this.personaNaturalrepsitory.crearDireccionPersonaNatural(direccionParticularRepresentante, empresa.persona_juridica_id);
            }
            else {
              try {
                for (let datosRepresentante of params.modificaciones) {
                  if (datosRepresentante.tipo == "4") {
                    await this.personaJuridicaRepository.actualizarRepresentanteLegalEmpresa(empresa.persona_juridica_id, persona.id);
                    await this.personaNaturalrepsitory.actualizarPersonaNaturalByRut(datosRepresentante.representanteLegal.nombre, datosRepresentante.representanteLegal.rut, datosRepresentante.representanteLegal.direccion.email);
                    let direccion: any = (await this.personaNaturalrepsitory.obtenerDireccionByPersonaId(persona.id, empresa.persona_juridica_id));

                    if (!Array.isArray(direccion) || direccion.length === 0) {
                      direccion = {
                        codigo_region: modificacion.representanteLegal.direccion.codigoRegionIntermediario,
                        codigo_comuna: modificacion.representanteLegal.direccion.codigoComunaIntermediario,
                        texto: modificacion.representanteLegal.direccion.textoDireccion,
                        tipo: 'particular',
                        persona_id: persona.id,
                        telefono_fijo: modificacion.representanteLegal.direccion.telefonoFijo,
                        telefono_movil: modificacion.representanteLegal.direccion.telefonoMovil
                      }
                      await this.personaNaturalrepsitory.crearDireccionPersonaNatural(direccion, empresa.persona_juridica_id);
                    }
                    else {
                      await this.personaNaturalrepsitory.actualizarDireccionNaturalByRut(datosRepresentante.representanteLegal.direccion.codigoRegionIntermediario, datosRepresentante.representanteLegal.direccion.codigoComunaIntermediario, datosRepresentante.tipo, datosRepresentante.representanteLegal.direccion.textoDireccion, persona.id, datosRepresentante.representanteLegal.direccion.telefonoFijo, datosRepresentante.representanteLegal.direccion.telefonoMovil, empresa.persona_juridica_id);
                    }
                    mensajes.push('Representante Legal cambiado a: ' + datosRepresentante.representanteLegal.nombre);
                  }
                }
              } catch (ex) {
                controllerLogger.error(ex, ex);
                throw new HttpErrors.InternalServerError(ex.toString());
              }
            }
            break
          default:
            throw new Error('Tipo ' + modificacion.tipo + ' desconocido.')
        }
      }
      controllerLogger.info('Modificacion fuera del ciclo for2:' + mensajes.join('; '))
      let tramite = {
        identificadorIntermediario: params.identificadorIntermediario,
        analistaId: analista.id,
        solicitudId: null,
        metadata: JSON.stringify(modificaciones),
        codigo: null,
        fechaHoraCreacion: moment(params.fechaHoraCreacion, "DD/MM/YYYY kk:mm:ss").toDate(),
        tipoTramiteId: tipoTramite.id,
        intermediarioId: intermediarios[0].id
      }
      let resultadoCrearTramite: any = (await this.tramiteRepository.crearTramite(tramite))[0]
      if (resultadoCrearTramite != undefined) {
        return {
          codigoResultado: 1,
          descripcionResultado: "Trámite de Modificación de Empresa registrado exitosamente. Modificaciones realizadas: " + mensajes + ";"
        }
      }

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
  @get('/tramites/internacional/chile-chile/empresa')
  async getEmpresa(@param.query.string('q') q: string): Promise<any> {
    try {
      let params = q.replace(/\{/g, '').replace(/\}/g, '').replace(/\s/g, '').split(',')
      let pRutSolicitante = params[0].split('='), pRutEmpresa = params[1].split('=')
      if (pRutSolicitante[0] !== "'rutSolicitante'" || pRutEmpresa[0] !== "'rutEmpresa'") throw 'Parámetros incorrectos'
      let rutSolicitante = pRutSolicitante[1].replace(/\'/g, '')
      let rutEmpresa = pRutEmpresa[1].replace(/\'/g, '')
      let empresa: any = [];
      empresa = (await this.empresaRepository.obtenerEmpresaByRut(rutEmpresa))[0];
      //let empresa: any = (await this.empresaRepository.obtenerEmpresaByRut(rutEmpresa))[0];
      let solicitantes: any = [],
        sol: any = [],
        documentos = [],
        datosRepresentanteLegal: any = []
      if (empresa == undefined) {
        return {
          codigoResultado: 2,
          descripcionResultado: "No hay una empresa registrada con el rut (" + rutEmpresa + ")"
        }
      }
      //solicitantes = await this.solicitanteAutorizadoRepository.obtenerSolicitantesAutorizadosByEmpresaId(empresa.id);
      if (rutSolicitante !== empresa.identificador_representante_legal) {
        solicitantes = await this.solicitanteAutorizadoRepository.obtenerSolicitantesAutorizadosByEmpresaId(empresa.id);

        if (!solicitantes || solicitantes.length === 0) {
          return {
            codigoResultado: 4,
            descripcionResultado: "No hay solicitantes autorizados para esta empresa"
          }
        }
        let solicitante = solicitantes.find((s: any) => s.identificador === rutSolicitante)
        if (solicitante == undefined) {
          return {
            codigoResultado: 3,
            descripcionResultado: "No hay un solicitante autorizado con el rut (" + rutSolicitante + ")"
          }
        }
      }

      let direccionRepresentanteLegal: any = (await this.direccionPersonaNaturalRepository.obtenerDireccionByPersonaId(empresa.id_representante_legal, empresa.persona_juridica_id));

      documentos = await this.documentoEmpresaRepository.obtenerDocumentosEmpresaById(empresa.id);
      solicitantes.forEach((s: any) => {
        controllerLogger.info('sol')
        controllerLogger.info(s)
        sol.push({
          rut: s.identificador,
          nombre: s.nombre_completo,
          email: s.email,
          relacion: s.relacion,
          codigo_comuna: s.codigo_comuna,
          codigo_region: s.codigo_region,
          nombre_region: s.nombre_region,
          nombre_comuna: s.nombre_comuna,
          texto: s.texto,
          telefono_fijo: s.telefono_fijo,
          telefono_movil: s.telefono_movil
        })
      })
      return {
        codigoResultado: 1,
        descripcionResultado: "Exitoso",
        empresa: {
          id: empresa.id,
          rut: empresa.identificador,
          razonSocial: empresa.razon_social,
          nombreFantasia: empresa.nombre_fantasia,
          tipoEmpresa: empresa.tipo_empresa,
          tramite: empresa.tramite,
          representanteLegal: {
            rut: empresa.identificador_representante_legal,
            nombre: empresa.nombre_representante_legal,
            texto: empresa.texto_rl,
            codigo_region: empresa.codigo_region_rl,
            nombre_region: empresa.nombre_region_rl,
            codigo_comuna: empresa.codigo_comuna_rl,
            nombre_comuna: empresa.nombre_comuna_rl,
            telefonoFijo: empresa.telefono_fijo_rl,
            telefonoMovil: empresa.telefono_movil_rl,
            email: empresa.email_representante_legal

          },
          direccion: {
            texto: empresa.texto,
            telefono_fijo: empresa.telefono_fijo,
            telefono_movil: empresa.telefono_movil,
            email: empresa.email
          },
          region: {
            codigo_comuna: empresa.codigo_comuna,
            nombre_comuna: empresa.nombre_comuna,
            codigo_region: empresa.codigo_region,
            nombre_region: empresa.nombre_region
          },
          documentos: documentos,
          solicitantesAutorizados: sol
        }
      }
    } catch (ex) {
      controllerLogger.info
        (ex)
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
