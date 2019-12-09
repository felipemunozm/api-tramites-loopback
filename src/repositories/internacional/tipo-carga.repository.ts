import { DefaultCrudRepository } from '@loopback/repository';
import { TipoCarga } from '../../models';
import { InternacionalDataSource } from '../../datasources';
import { inject } from '@loopback/core';

export class TipoCargaRepository extends DefaultCrudRepository<
  TipoCarga,
  typeof TipoCarga.prototype.id
  > {
  constructor(
    @inject('datasources.internacional') dataSource: InternacionalDataSource,
  ) {
    super(TipoCarga, dataSource);
  }
  public obtenerTiposCargas(): Promise<any> {
    let query: string = "select id, codigo, nombre from tipo_carga";
    return this.dataSource.execute(query);
  }
}

