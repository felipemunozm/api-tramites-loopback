import { DefaultCrudRepository } from '@loopback/repository';
import { SolicitanteAutorizado } from '../../models';
import { InternacionalDataSource } from '../../datasources';
import { inject } from '@loopback/core';

export class SolicitanteAutorizadoRepository extends DefaultCrudRepository<
  SolicitanteAutorizado,
  typeof SolicitanteAutorizado.prototype.id
  > {
  constructor(
    @inject('datasources.internacional') dataSource: InternacionalDataSource,
  ) {
    super(SolicitanteAutorizado, dataSource);
  }

  public obtenerSolicitantesAutorizadosByEmpresaId(empresaId: any): Promise<any> {
    let query = "select sa.id, sa.persona_natural_id, pn.identificador, pn.nombre_completo, pn.email, sa.relacion, dpn.codigo_comuna, dpn.codigo_region, dpn.telefono_fijo, dpn.telefono_movil, dpn.texto , r.nombre as nombre_region, c.nombre as nombre_comuna\n" +
      "from solicitante_autorizado sa\n" +
      "left join empresa e on sa.empresa_id = e.id \n" +
      "left join persona_natural pn on sa.persona_natural_id = pn.id\n" +
      "left join direccion_persona_natural dpn on pn.id = dpn.persona_id and dpn.persona_juridica_id = e.persona_juridica_id\n" +
      "left join region r on dpn.codigo_region = r.codigo\n" +
      "left join comuna c on dpn.codigo_comuna = c.codigo\n" +
      "where e.id = $1 and sa.habilitado = true and sa.relacion ='Mandatario'";
    return this.dataSource.execute(query, [empresaId]);
  }
  public crearSolicitanteAutorizado(empresaId: any, personaId: any, relacion: any): Promise<any> {
    let query: string = "insert into solicitante_autorizado (version, habilitado, empresa_id, persona_natural_id, fecha_creacion, relacion) values (0, true, $1, $2, NOW(), $3) returning id";
    return this.dataSource.execute(query, [empresaId, personaId, relacion]);
  }
  public borrarSolicitanteAutorizadoExistente(empresaId: any): Promise<any> {
    let query: string = "delete from solicitante_autorizado where empresa_id = $1";
    return this.dataSource.execute(query, [empresaId]);
  }
  public borrarDireccionAutorizadoExistente(empresaPersonaJuridicaId: any): Promise<any> {
    let query: string = "delete from direccion_persona_natural where persona_juridica_id = $1";
    return this.dataSource.execute(query, [empresaPersonaJuridicaId]);
  }
}
