import { DefaultCrudRepository } from '@loopback/repository';
import { Tripulante } from '../../models';
import { InternacionalDataSource } from '../../datasources';
import { inject } from '@loopback/core';

export class TripulanteRepository extends DefaultCrudRepository<
  Tripulante,
  typeof Tripulante.prototype.id
  > {
  constructor(
    @inject('datasources.internacional') dataSource: InternacionalDataSource,
  ) {
    super(Tripulante, dataSource);
  }
}
