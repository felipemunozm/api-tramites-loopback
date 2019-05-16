import { DefaultCrudRepository } from '@loopback/repository';
import { Sujeto } from '../../models';
import { InternacionalDataSource } from '../../datasources';
import { inject } from '@loopback/core';

export class SujetoRepository extends DefaultCrudRepository<
  Sujeto,
  typeof Sujeto.prototype.id
  > {
  constructor(
    @inject('datasources.internacional') dataSource: InternacionalDataSource,
  ) {
    super(Sujeto, dataSource);
  }
  public obtenerSujetoById(sujetoId: string): Promise<any> {
    let query = "select pn.email, a.persona_natural_id, pn.identificador identificador_pn, pn.nombre_completo, "
      + "pn.tipo_id_id tipo_id_pn, a.persona_juridica_id, pj.identificador identificador_pj, "
      + "case when a.persona_natural_id is null then 'PJ' else 'PN' end tipo_persona, "
      + "pj.razon_social, pj.tipo_id_id tipo_id_pj from sujeto a "
      + "left join persona_natural pn on a.persona_natural_id = pn.id "
      + "left join persona_juridica pj on a.persona_juridica_id = pj.id where a.id = $1"
    return this.dataSource.execute(query, [sujetoId]);
  }
  public crearSujeto(tipoPersona: any, personaId: any): Promise<any> {
    let query: string = "insert into sujeto (version, ' + (tipoPersona === 'Juridica' ? 'persona_juridica_id' : 'persona_natural_id') + ') values (0, $1) returning id";
    return this.dataSource.execute(query, [personaId]);
  }
}
