import { DefaultCrudRepository } from '@loopback/repository';
import { EstadoPermiso } from '../../models';
import { InternacionalDataSource } from '../../datasources';
import { inject } from '@loopback/core';

export class EstadoPermisoRepository extends DefaultCrudRepository<
  EstadoPermiso,
  typeof EstadoPermiso.prototype.id
  > {
  constructor(
    @inject('datasources.internacional') dataSource: InternacionalDataSource,
  ) {
    super(EstadoPermiso, dataSource);
  }
}
