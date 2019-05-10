import { DefaultCrudRepository } from '@loopback/repository';
import { DomicilioEmpresa } from '../../models';
import { InternacionalDataSource } from '../../datasources';
import { inject } from '@loopback/core';

export class DomicilioEmpresaRepository extends DefaultCrudRepository<
  DomicilioEmpresa,
  typeof DomicilioEmpresa.prototype.id
  > {
  constructor(
    @inject('datasources.internacional') dataSource: InternacionalDataSource,
  ) {
    super(DomicilioEmpresa, dataSource);
  }
}
