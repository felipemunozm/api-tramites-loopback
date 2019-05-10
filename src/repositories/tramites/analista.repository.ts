import { DefaultCrudRepository } from '@loopback/repository';
import { Analista } from '../../models';
import { GestionTramitesDataSource } from '../../datasources';
import { inject } from '@loopback/core';

export class AnalistaRepository extends DefaultCrudRepository<
  Analista,
  typeof Analista.prototype.id
  > {
  constructor(
    @inject('datasources.gestionTramites') dataSource: GestionTramitesDataSource,
  ) {
    super(Analista, dataSource);
  }
}
