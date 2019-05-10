import { DefaultCrudRepository } from '@loopback/repository';
import { RecorridoLocalidad } from '../../models';
import { InternacionalDataSource } from '../../datasources';
import { inject } from '@loopback/core';

export class RecorridoLocalidadRepository extends DefaultCrudRepository<
  RecorridoLocalidad,
  typeof RecorridoLocalidad.prototype.id
  > {
  constructor(
    @inject('datasources.internacional') dataSource: InternacionalDataSource,
  ) {
    super(RecorridoLocalidad, dataSource);
  }
}
