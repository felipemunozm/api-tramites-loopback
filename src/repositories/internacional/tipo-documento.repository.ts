import { DefaultCrudRepository } from '@loopback/repository';
import { TipoDocumento } from '../../models';
import { InternacionalDataSource } from '../../datasources';
import { inject } from '@loopback/core';

export class TipoDocumentoRepository extends DefaultCrudRepository<
  TipoDocumento,
  typeof TipoDocumento.prototype.id
  > {
  constructor(
    @inject('datasources.internacional') dataSource: InternacionalDataSource,
  ) {
    super(TipoDocumento, dataSource);
  }
  public obtenerTipoDocumentoByCodigo(codigo: any): Promise<any> {
    let query: string = "select id from tipo_documento where codigo = $1";
    return this.dataSource.execute(query, [codigo]);
  }
}
