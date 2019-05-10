import { DefaultCrudRepository } from '@loopback/repository';
import { Parametros } from '../../models';
import { GestionTramitesDataSource } from '../../datasources';
import { inject } from '@loopback/core';

export class ParametrosRepository extends DefaultCrudRepository<
  Parametros,
  typeof Parametros.prototype.id
  > {
  constructor(
    @inject('datasources.gestionTramites') dataSource: GestionTramitesDataSource,
  ) {
    super(Parametros, dataSource);
  }
}
