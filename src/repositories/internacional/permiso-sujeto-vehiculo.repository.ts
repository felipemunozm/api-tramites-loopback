import { DefaultCrudRepository } from '@loopback/repository';
import { PermisoSujetoVehiculo } from '../../models';
import { InternacionalDataSource } from '../../datasources';
import { inject } from '@loopback/core';

export class PermisoSujetoVehiculoRepository extends DefaultCrudRepository<
  PermisoSujetoVehiculo,
  typeof PermisoSujetoVehiculo.prototype.id
  > {
  constructor(
    @inject('datasources.internacional') dataSource: InternacionalDataSource,
  ) {
    super(PermisoSujetoVehiculo, dataSource);
  }
}
