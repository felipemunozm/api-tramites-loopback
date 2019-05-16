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

  public obtenerSolicitantesAutorizadosByEmpresaId(empresaId: string): Promise<any> {
    let query = "select sa.id, sa.persona_natural_id, pn.identificador, pn.nombre_completo, pn.email from solicitante_autorizado sa "
      + "left join empresa e on sa.empresa_id = e.id left join persona_natural pn on sa.persona_natural_id = pn.id "
      + "where e.id = $1 and sa.habilitado = true"
    return this.dataSource.execute(query, [empresaId]);
  }
  public crearSolicitanteAutorizado(empresaId: any, personaId: any, relacion: any): Promise<any> {
    let query: string = "insert into solicitante_autorizado (version, habilitado, empresa_id, persona_natural_id, fecha_creacion, relacion) values (0, true, $1, $2, NOW(), $3) returning id";
    return this.dataSource.execute(query, [empresaId, personaId, relacion]);
  }
}
