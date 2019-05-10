import { DefaultCrudRepository } from '@loopback/repository';
import { TraduccionTipoVehiculoEjesCarga } from '../../models';
import { InternacionalDataSource } from '../../datasources';
import { inject } from '@loopback/core';

export class TraduccionTipoVehiculoEjesCargaRepository extends DefaultCrudRepository<
  TraduccionTipoVehiculoEjesCarga,
  typeof TraduccionTipoVehiculoEjesCarga.prototype.id
  > {
  constructor(
    @inject('datasources.internacional') dataSource: InternacionalDataSource,
  ) {
    super(TraduccionTipoVehiculoEjesCarga, dataSource);
  }
}
