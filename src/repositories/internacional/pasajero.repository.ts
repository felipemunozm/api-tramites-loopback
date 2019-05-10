import { DefaultCrudRepository } from '@loopback/repository';
import { Pasajero } from '../../models';
import { InternacionalDataSource } from '../../datasources';
import { inject } from '@loopback/core';

export class PasajeroRepository extends DefaultCrudRepository<
  Pasajero,
  typeof Pasajero.prototype.id
  > {
  constructor(
    @inject('datasources.internacional') dataSource: InternacionalDataSource,
  ) {
    super(Pasajero, dataSource);
  }
}
