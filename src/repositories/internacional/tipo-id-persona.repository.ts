import { DefaultCrudRepository } from '@loopback/repository';
import { TipoIdPersona } from '../../models';
import { InternacionalDataSource } from '../../datasources';
import { inject } from '@loopback/core';

export class TipoIdPersonaRepository extends DefaultCrudRepository<
  TipoIdPersona,
  typeof TipoIdPersona.prototype.id
  > {
  constructor(
    @inject('datasources.internacional') dataSource: InternacionalDataSource,
  ) {
    super(TipoIdPersona, dataSource);
  }
  public obtenerTiposIdentificadoresPersonas(): Promise<any> {
    let query: string = "select id, codigo, pais_id, nombre from tipo_id_persona";
    return this.dataSource.execute(query);
  }

}
