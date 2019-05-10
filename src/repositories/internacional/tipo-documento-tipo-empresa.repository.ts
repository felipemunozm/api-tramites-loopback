import { DefaultCrudRepository } from '@loopback/repository';
import { TipoDocumentoTipoEmpresa } from '../../models';
import { InternacionalDataSource } from '../../datasources';
import { inject } from '@loopback/core';

export class TipoDocumentoTipoEmpresaRepository extends DefaultCrudRepository<
  TipoDocumentoTipoEmpresa,
  typeof TipoDocumentoTipoEmpresa.prototype.id
  > {
  constructor(
    @inject('datasources.internacional') dataSource: InternacionalDataSource,
  ) {
    super(TipoDocumentoTipoEmpresa, dataSource);
  }
}
