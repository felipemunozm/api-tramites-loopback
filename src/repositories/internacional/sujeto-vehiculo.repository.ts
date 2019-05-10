import { DefaultCrudRepository } from '@loopback/repository';
import { SujetoVehiculo } from '../../models';
import { InternacionalDataSource } from '../../datasources';
import { inject } from '@loopback/core';

export class SujetoVehiculoRepository extends DefaultCrudRepository<
  SujetoVehiculo,
  typeof SujetoVehiculo.prototype.id
  > {
  constructor(
    @inject('datasources.internacional') dataSource: InternacionalDataSource,
  ) {
    super(SujetoVehiculo, dataSource);
  }
}
