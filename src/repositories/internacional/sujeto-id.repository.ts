import { DefaultCrudRepository } from '@loopback/repository';
import { SujetoId } from '../../models';
import { InternacionalDataSource } from '../../datasources';
import { inject } from '@loopback/core';

export class SujetoIdRepository extends DefaultCrudRepository<
  SujetoId,
  typeof SujetoId.prototype.id
  > {
  constructor(
    @inject('datasources.internacional') dataSource: InternacionalDataSource,
  ) {
    super(SujetoId, dataSource);
  }
}
