import { DefaultCrudRepository } from '@loopback/repository';
import { Comuna } from '../../models';
import { InternacionalDataSource } from '../../datasources';
import { inject } from '@loopback/core';

export class ComunaRepository extends DefaultCrudRepository<
  Comuna,
  typeof Comuna.prototype.id
  > {
  constructor(
    @inject('datasources.internacional') dataSource: InternacionalDataSource,
  ) {
    super(Comuna, dataSource);
  }
}
