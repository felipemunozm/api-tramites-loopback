import { DefaultCrudRepository } from '@loopback/repository';
import { PermisoRecorrido } from '../../models';
import { InternacionalDataSource } from '../../datasources';
import { inject } from '@loopback/core';

export class PermisoRecorridoRepository extends DefaultCrudRepository<
  PermisoRecorrido,
  typeof PermisoRecorrido.prototype.id
  > {
  constructor(
    @inject('datasources.internacional') dataSource: InternacionalDataSource,
  ) {
    super(PermisoRecorrido, dataSource);
  }
}
