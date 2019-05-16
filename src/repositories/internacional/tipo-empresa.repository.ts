import { DefaultCrudRepository } from '@loopback/repository';
import { TipoEmpresa } from '../../models';
import { InternacionalDataSource } from '../../datasources';
import { inject } from '@loopback/core';

export class TipoEmpresaRepository extends DefaultCrudRepository<
  TipoEmpresa,
  typeof TipoEmpresa.prototype.id
  > {
  constructor(
    @inject('datasources.internacional') dataSource: InternacionalDataSource,
  ) {
    super(TipoEmpresa, dataSource);
  }
  public obtenerTipoEmpresaByCodigo(codigo: any): Promise<any> {
    let query: string = "select * from tipo_empresa where codigo = $1";
    return this.dataSource.execute(query, [codigo]);
  }
}
