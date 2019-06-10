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
        !params.codigoAnalista || !params.nombreAnalista || !params.codigoRegion) {
        throw {
          error: {
            statusCode: 502,
            message: 'Parámetros incorrectos'
          }
        };
      }
      //console.log('Paso 1')
      let tiposTramite: any = await this.tipoTramiteRepository.obtenerTipoTramites();
      let tipoTramite = tiposTramite.find((tipo: any) => tipo.codigo === 'creacion-empresa')
      if (tipoTramite.id == undefined) console.error('Debe crear un Tipo de Trámite con código creacion-empresa.')
      let intermediarios: any = await this.intermediarioTramiteRepository.obtenerIntermediarios();
      let region = (await this.regionRepository.obtenerRegionesByCodigo(params.codigoRegion))[0]
      // console.log('Paso 2')
      // console.log(region)
      if (region.id == undefined) {
        return {
          codigoResultado: 3,
          descripcionResultado: "No existe una región con el código " + params.codigoRegion + "."
        }
      }
      let analistas: any = await this.analistaRepository.obtenerAnalistas();
      let analista = analistas.find((analista: any) => analista.codigo === params.codigoAnalista)
      //console.log('Paso 3')
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
      //console.log('Paso 4')
      try {
        let empresa: any = (await this.empresaRepository.obtenerEmpresaByRut(params.empresa.rut))[0];
        if (empresa != undefined) {
          return {
            codigoResultado: 4,
            descripcionResultado: "Ya existe una empresa registrada con el rut " + params.empresa.rut + "."
          }
        }
      } catch (ex) {
        //console.log(ex);
        controllerLogger.error(ex, ex);
        throw new HttpErrors.InternalServerError(ex.toString());
      }
      //console.log('Paso 5')
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
      //console.log('Paso 6')
      //console.log(tramite)
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
          //console.log('Paso 7')
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
            let direccionParticularRepresentante = {
              codigo_region: params.empresa.representanteLegal.direccion.codigoRegionIntermediario,
              codigo_comuna: params.empresa.representanteLegal.direccion.codigoComunaIntermediario,
              texto: params.empresa.representanteLegal.direccion.textoDireccion,
              tipo: 'particular',
              persona_id: respuestaCreacionPersonaNatural.id
            }
            await this.personaNaturalrepsitory.crearDireccionPersonaNatural(direccionParticularRepresentante);
          }
          //  console.log('Paso 8')
          let personaJuridica = {
            razonSocial: params.empresa.razonSocial,
            identificador: params.empresa.rut,
            tipoIdentificadorId: tipoIdRut.id,
            nombreFantasia: params.empresa.nombreFantasia,
            representanteLegalId: persona.id
          }
          let respuestaCreacionPersonaJuridica = (await this.personaJuridicaRepository.crearPersonaJuridica(personaJuridica))[0];
          //  console.log('Paso 9')
          let tipoEmpresa = (await this.tipoEmpresaRepository.obtenerTipoEmpresaByCodigo(params.empresa.tipoEmpresa))[0];
          let empresaCreada: any = (await this.empresaRepository.crearEmpresa(respuestaCreacionPersonaJuridica.id, tipoEmpresa.id))[0];
          //   console.log('Paso 10')
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
          //  console.log('Paso 11')
          let solicitante: any = (await this.personaNaturalrepsitory.obtenerPersonaNaturalByRut(params.solicitante.rut))[0];
          //  console.log('Paso 12')
          if (solicitante == undefined) {
            let personaSolicitante: any = {}
            personaSolicitante.nombreCompleto = params.solicitante.nombre
            personaSolicitante.identificador = params.solicitante.rut
            personaSolicitante.tipoIdentificadorId = 1
            personaSolicitante.email = params.solicitante.email
            let solicitanteCreado: any = (await this.personaNaturalrepsitory.crearPersonaNatural(personaSolicitante))[0];
            await this.solicitanteAutorizadoRepository.crearSolicitanteAutorizado(empresaCreada.id, solicitanteCreado.id, params.relacionSolicitanteEmpresa);
          } else {
            await this.solicitanteAutorizadoRepository.crearSolicitanteAutorizado(empresaCreada.id, solicitante.id, params.relacionSolicitanteEmpresa);
          }
          //console.log('Paso 13')
          await params.documentosAdjuntos.forEach(async (documento: any) => {
            let tipoDocumento = (await this.tipoDocumentoRepository.obtenerTipoDocumentoByCodigo(documento.codigoTipoDocumento));
            await this.documentoEmpresaRepository.crearDocumentoEmpresa(tipoDocumento[0].id, empresaCreada.id, documento.urlDescargaDocumento);
          })
          //console.log('Paso 14 Final')
          let estadoTramite: any = (await this.estadoTramiteRepository.crearEstadoTramite(resultadoCrearTramite.id, 7))[0]
          //  console.log(resp[0])
          if (estadoTramite != undefined) {
            return {
              codigoResultado: 1,
              descripcionResultado: "Trámite de Creación de empresa éxitosa"
            }
          }
        }
      } catch (error) {
        //console.log(error);
        controllerLogger.error(error, error);
        throw new HttpErrors.InternalServerError(error.toString());
      }
    } catch (ex) {
      //console.log(ex);
      controllerLogger.error(ex, ex);
      throw new HttpErrors.InternalServerError(ex.toString());
    }
  }
  @put('/tramites/internacional/chile-chile/empresa')
  public async modificarTramiteEmpresa(@requestBody() params: any): Promise<any> {
    try {
      // let params = ctx.request.body
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
      // let tiposTramite = await gestionTramitesGateway.obtenerTiposTramites()l
      let tiposTramite: any = await this.tipoTramiteRepository.obtenerTipoTramites();
      let tipoTramite = tiposTramite.find((tipo: any) => tipo.codigo === 'modifica-empresa')
      if (!tipoTramite) console.error('Debe crear un Tipo de Trámite con código modificacion-empresa.')
      // let intermediarios = await gestionTramitesGateway.obtenerIntermediarios()
      let intermediarios: any = await this.intermediarioTramiteRepository.obtenerIntermediarios();
      // let regiones = await internacionalGateway.obtenerRegiones()
      let regiones: any = await this.regionRepository.obtenerRegiones();
      let region = regiones.find((r: any) => r.codigo === params.analista.codigoRegion)
      if (region == undefined) {
        return {
          codigoResultado: 3,
          descripcionResultado: "No existe una región con el código " + params.analista.codigoRegion + "."
        }
      }
      console.log('Modificacion 1')
      // let analistas = await gestionTramitesGateway.obtenerAnalistas()
      let analistas: any = await this.analistaRepository.obtenerAnalistas();
      let analista = analistas.find((analista: any) => analista.codigo === params.analista.codigo)
      if (analista == undefined) {
        analista = {
          codigo: params.analista.codigo,
          nombre_completo: params.analista.nombre,
          region_id: region.id
        }
        // let resultadoCreacionAnalista = await gestionTramitesGateway.crearAnalista(analista)
        let resultadoCreacionAnalista: any = (await this.analistaRepository.crearAnalista(analista))[0];
        analista.id = resultadoCreacionAnalista.id;
      } else {
        //if (analista.nombre_completo !== params.analista.nombre || analista.region_id.toString() !== params.analista.codigoRegion) {
        // await gestionTramitesGateway.actualizarAnalista(analista)
        await this.analistaRepository.actualizarAnalista(params.analista.nombre, params.analista.codigoRegion, params.analista.codigo);
        // }
      }
      console.log('Modificacion 2')
      // let empresa = await internacionalGateway.obtenerEmpresaByRut(params.rutEmpresa)
      let empresa: any = (await this.empresaRepository.obtenerEmpresaByRut(params.rutEmpresa))[0];
      try {
        // let empresa: any = (await this.empresaRepository.obtenerEmpresaByRut(params.rutEmpresa))[0];
        if (empresa == undefined) {
          return {
            descripcionResultado: 'Empresa con rut ' + params.rutEmpresa + ' no existe.'
          }
        }
      } catch (ex) {
        //console.log(ex);
        controllerLogger.error(ex, ex);
        throw new HttpErrors.InternalServerError(ex.toString());
      }
      console.log('Modificacion 3')
      //let empresa: any = await this.empresaRepository.obtenerEmpresaByRut(params.rutEmpresa);
      //if (empresa == undefined) throw new Error('Empresa con rut ' + params.rutEmpresa + ' no existe.')
      // let tiposIdentificadores = await internacionalGateway.obtenerTiposIdentificadoresPersonas()lll
      let tiposIdentificadores: any = await this.tipoIdPersonaRepository.obtenerTiposIdentificadoresPersonas();
      let tipoIdRut = tiposIdentificadores.find((tipo: any) => tipo.codigo === 'RUT')
      if (tipoIdRut == undefined) throw new Error('Debe crear el tipo de identificador con código RUT')
      let modificaciones = params.modificaciones;
      let mensajes: any = [];
      await modificaciones.forEach(async (modificacion: any) => {
        if (modificacion.tipo == undefined || modificacion.descripcion == undefined) {
          throw new Error('Modificación no contiene los parámetros esperados. ' + JSON.stringify(modificacion))
        }
        switch (modificacion.tipo) {
          case 1:
            if (modificacion.solicitantes.length === 0) throw new Error('Falta datos del o los solicitantes.')
            modificacion.solicitantes.forEach(async (solicitante: any) => {
              if (['Representante Legal', 'Mandatario'].indexOf(modificacion.solicitante.relacionEmpresa) === -1) {
                throw new Error('Relación ' + modificacion.solicitante.relacionEmpresa + ' desconocida.')
              }
              // let persona = await internacionalGateway.obtenerPersonaNaturalByRut(solicitante.rut)
              let persona: any = (await this.personaNaturalrepsitory.obtenerPersonaNaturalByRut(solicitante.rut))[0];
              if (persona == undefined) {
                persona = {
                  nombreCompleto: solicitante.nombre,
                  identificador: solicitante.rut,
                  tipoIdentificadorId: tipoIdRut.id
                }
                // let respuestaCreacionPersonaNatural = await internacionalGateway.crearPersonaNatural(persona)
                let respuestaCreacionPersonaNatural: any = (await this.personaNaturalrepsitory.crearPersonaNatural(persona))[0];
                persona.id = respuestaCreacionPersonaNatural.id;
              }
              console.log('Modificacion 4')
              // await internacionalGateway.crearSolicitanteAutorizado(empresa.id, persona.id, solicitante.relacionEmpresa)
              await this.solicitanteAutorizadoRepository.crearSolicitanteAutorizado(empresa.id, persona.id, solicitante.relacionEmpresa);
              mensajes.push('Nuevo solicitante autorizado creado: ' + solicitante.nombre)
            })
            break
          case 2:
            console.log('Modificacion 5')
            if (!modificacion.domicilio || !modificacion.domicilio.codigoRegionIntermediario || !modificacion.domicilio.codigoComunaIntermediario ||
              !modificacion.domicilio.textoDireccion || !modificacion.domicilio.telefonoFijo || !modificacion.domicilio.telefonoMovil || !modificacion.domicilio.email) {
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
            // let resultadoCreacionDomicilio = await internacionalGateway.crearDomicilioEmpresa(domicilio)
            let resultadoCreacionDomicilio: any = await this.domicilioEmpresaRepository.crearDomicilioEmpresa(domicilio);
            domicilio.id = resultadoCreacionDomicilio.id;
            mensajes.push('Nuevo domicilio de empresa creado: ' + domicilio.texto)
            break
          case 3:
            console.log('Modificacion 6')
            if (modificacion.razonSocial == undefined) throw new Error('No viene la Razón Social a cambiar.')
            // await internacionalGateway.actualizarRazonSocialPersonaJuridica(empresa.persona_juridica_id, modificacion.razonSocial)
            await this.personaJuridicaRepository.actualizarRazonSocialPersonaJuridica(empresa.persona_juridica_id, modificacion.razonSocial);
            mensajes.push('Razón Social modificada a "' + modificacion.razonSocial + '"')
            break
          case 4:
            console.log('Modificacion 7')
            if (modificacion.representanteLegal == undefined || modificacion.representanteLegal.rut == undefined || modificacion.representanteLegal.nombre == undefined) throw new Error('Parámetros de Representante Legal incorrectos.')
            // let persona = await internacionalGateway.obtenerPersonaNaturalByRut(modificacion.representanteLegal.rut)
            //let persona: any = await this.personaNaturalrepsitory.obtenerPersonaNaturalByRut(modificacion.representanteLegal.rut);
            let persona: any = (await this.personaNaturalrepsitory.obtenerPersonaNaturalByRut(modificacion.representanteLegal.rut))[0];
            if (persona == undefined) {
              persona = {
                nombreCompleto: modificacion.representanteLegal.nombre,
                identificador: modificacion.representanteLegal.rut,
                tipoIdentificadorId: tipoIdRut.id
              }
              // let respuestaCreacionPersonaNatural = await internacionalGateway.crearPersonaNatural(persona)
              let respuestaCreacionPersonaNatural: any = (await this.personaNaturalrepsitory.crearPersonaNatural(persona))[0];
              persona.id = respuestaCreacionPersonaNatural.id;
            }

            // await internacionalGateway.actualizarRepresentanteLegalEmpresa(empresa.persona_juridica_id, persona.id)
            await this.personaJuridicaRepository.actualizarRepresentanteLegalEmpresa(empresa.persona_juridica_id, persona.id);
            mensajes.push('Representante Legal cambiado a: ' + persona.nombreCompleto)
            break
          default:
            throw new Error('Tipo ' + modificacion.tipo + ' desconocido.')
        }
      })
      console.log('Modificacion 8')
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
      console.log('Modificacion 9')
      // await gestionTramitesGateway.crearTramite(tramite)
      await this.tramiteRepository.crearTramite(tramite)
        .then(async (resp: any) => {
          return {
            codigoResultado: 1,
            descripcionResultado: "Trámite de Modificación de Empresa registrado exitosamente. Modificaciones realizadas: " + mensajes.join('; ')
          }
        })
        .catch((error) => {
          console.log(error)
          throw new HttpErrors.InternalServerError('No fue posible crear el trámite.');
        })
      console.log('Modificacion 10')
    } catch (ex) {
      console.log(ex)
      throw new HttpErrors.InternalServerError(ex.toString());
    }
  }
  @get('/tramites/internacional/chile-chile/empresa')
  async getEmpresa(@param.query.string('rutEmpresa') rutEmpresa: any, @param.query.string('rutSolicitante') rutSolicitante: any): Promise<any> {
    try {
      // let rutEmpresa = ctx.query.rutEmpresa
      // let rutSolicitante = ctx.query.rutSolicitante
      // let empresa = await internacionalGateway.obtenerEmpresaByRut(rutEmpresa)
      let empresa: any = (await this.empresaRepository.obtenerEmpresaByRut(rutEmpresa))[0];
      let solicitantes: any = [],
        sol: any = [],
        documentos = [],
        direccionRepresentanteLegal = {}
      if (empresa == undefined) {
        return {
          codigoResultado: 2,
          descripcionResultado: "No hay una empresa registrada con el rut " + rutEmpresa + "."
        }
        // return
      }
      // solicitantes = await internacionalGateway.obtenerSolicitantesAutorizadosByEmpresaId(empresa.id)
      solicitantes = await this.solicitanteAutorizadoRepository.obtenerSolicitantesAutorizadosByEmpresaId(empresa.id);
      if (rutSolicitante !== empresa.identificador_representante_legal) {

        if (!solicitantes || solicitantes.length === 0) {
          return {
            codigoResultado: 4,
            descripcionResultado: "No hay solicitantes autorizados para esta empresa."
          }
          // return
        }
        let solicitante = solicitantes.find((s: any) => s.identificador === rutSolicitante)
        if (solicitante.id == undefined) {
          return {
            codigoResultado: 3,
            descripcionResultado: "No hay un solicitante autorizado con el rut " + rutSolicitante + "."
          }
          // return
        }

      }
      // direccionRepresentanteLegal = await internacionalGateway.obtenerDireccionByPersonaId(empresa.id_representante_legal)
      direccionRepresentanteLegal = (await this.direccionPersonaNaturalRepository.obtenerDireccionByPersonaId(empresa.id_representante_legal))[0];
      // documentos = await internacionalGateway.obtenerDocumentosEmpresaById(empresa.id)
      documentos = await this.documentoEmpresaRepository.obtenerDocumentosEmpresaById(empresa.id);
      solicitantes.forEach((s: any) => {
        console.log('sol')
        console.log(s)
        sol.push({
          rut: s.identificador,
          nombre: s.nombre_completo
        })
      })
      return {
        codigoResultado: 1,
        descripcionResultado: "Exitoso.",
        empresa: {
          id: empresa.id,
          rut: empresa.identificador,
          razonSocial: empresa.razon_social,
          tipoEmpresa: empresa.tipo_empresa,
          representanteLegal: {
            rut: empresa.identificador_representante_legal,
            nombre: empresa.nombre_representante_legal,
            direccion: direccionRepresentanteLegal
          },
          direccion: {
            codigo_comuna: empresa.codigo_comuna,
            nombre_comuna: empresa.nombre_comuna,
            codigo_region: empresa.codigo_region,
            nombre_region: empresa.nombre_region,
            texto: empresa.texto,
            telefono_fijo: empresa.telefono_fijo,
            telefono_movil: empresa.telefono_movil,
            email: empresa.email
          },
          documentos: documentos,
          solicitantesAutorizados: sol
        }
      }
    } catch (ex) {
      console.log(ex)
      throw ex.toString()
    }
  }
}
