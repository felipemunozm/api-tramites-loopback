import { DefaultCrudRepository } from '@loopback/repository';
import { Region } from '../../models';
import { InternacionalDataSource } from '../../datasources';
import { inject } from '@loopback/core';

export class RegionRepository extends DefaultCrudRepository<
  Region,
  typeof Region.prototype.id
  > {
  constructor(
    @inject('datasources.internacional') dataSource: InternacionalDataSource,
  ) {
    super(Region, dataSource);
  }
  public obtenerRegiones(): Promise<any> {
    let query: string = "select id, codigo, nombre from region order by id asc";
    return this.dataSource.execute(query);
  }
  public obtenerRegionesByCodigo(codigo: any): Promise<any> {
    let query: string = "select id, codigo, nombre from region where codigo = $1 order by id asc"
    return this.dataSource.execute(query, [codigo]);
  }
}
