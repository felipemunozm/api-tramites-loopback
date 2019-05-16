import { DefaultCrudRepository } from '@loopback/repository';
import { Pais } from '../../models';
import { InternacionalDataSource } from '../../datasources';
import { inject } from '@loopback/core';

export class PaisRepository extends DefaultCrudRepository<
  Pais,
  typeof Pais.prototype.id
  > {
  constructor(
    @inject('datasources.internacional') dataSource: InternacionalDataSource,
  ) {
    super(Pais, dataSource);
  }
  public obtenerPaisByCodigo(codigo: any): Promise<any> {
    let query: string = "select id, codigo, nombre from pais where codigo = $1";
    return this.dataSource.execute(query, [codigo]);
  }
}
