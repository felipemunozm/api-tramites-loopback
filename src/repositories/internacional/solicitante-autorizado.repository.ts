import { DefaultCrudRepository } from '@loopback/repository';
import { SolicitanteAutorizado } from '../../models';
import { InternacionalDataSource } from '../../datasources';
import { inject } from '@loopback/core';

export class SolicitanteAutorizadoRepository extends DefaultCrudRepository<
  SolicitanteAutorizado,
  typeof SolicitanteAutorizado.prototype.id
  > {
  constructor(
    @inject('datasources.internacional') dataSource: InternacionalDataSource,
  ) {
    super(SolicitanteAutorizado, dataSource);
  }
}
