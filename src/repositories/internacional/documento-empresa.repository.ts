import { DefaultCrudRepository } from '@loopback/repository';
import { DocumentoEmpresa } from '../../models';
import { InternacionalDataSource } from '../../datasources';
import { inject } from '@loopback/core';

export class DocumentoEmpresaRepository extends DefaultCrudRepository<
  DocumentoEmpresa,
  typeof DocumentoEmpresa.prototype.id
  > {
  constructor(
    @inject('datasources.internacional') dataSource: InternacionalDataSource,
  ) {
    super(DocumentoEmpresa, dataSource);
  }
}
