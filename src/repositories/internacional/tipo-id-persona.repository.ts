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
}
