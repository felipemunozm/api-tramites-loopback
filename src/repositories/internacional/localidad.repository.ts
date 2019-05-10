import { DefaultCrudRepository } from '@loopback/repository';
import { Localidad } from '../../models';
import { InternacionalDataSource } from '../../datasources';
import { inject } from '@loopback/core';

export class LocalidadRepository extends DefaultCrudRepository<
  Localidad,
  typeof Localidad.prototype.id
  > {
  constructor(
    @inject('datasources.internacional') dataSource: InternacionalDataSource,
  ) {
    super(Localidad, dataSource);
  }
}
