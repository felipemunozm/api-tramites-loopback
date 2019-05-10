import { DefaultCrudRepository } from '@loopback/repository';
import { Recorrido } from '../../models';
import { InternacionalDataSource } from '../../datasources';
import { inject } from '@loopback/core';

export class RecorridoRepository extends DefaultCrudRepository<
  Recorrido,
  typeof Recorrido.prototype.id
  > {
  constructor(
    @inject('datasources.internacional') dataSource: InternacionalDataSource,
  ) {
    super(Recorrido, dataSource);
  }
}
