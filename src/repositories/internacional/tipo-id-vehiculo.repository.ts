import { DefaultCrudRepository } from '@loopback/repository';
import { TipoIdVehiculo } from '../../models';
import { InternacionalDataSource } from '../../datasources';
import { inject } from '@loopback/core';

export class TipoIdVehiculoRepository extends DefaultCrudRepository<
  TipoIdVehiculo,
  typeof TipoIdVehiculo.prototype.id
  > {
  constructor(
    @inject('datasources.internacional') dataSource: InternacionalDataSource,
  ) {
    super(TipoIdVehiculo, dataSource);
  }
}
