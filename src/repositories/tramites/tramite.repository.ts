import { DefaultCrudRepository } from '@loopback/repository';
import { Tramite } from '../../models';
import { GestionTramitesDataSource } from '../../datasources';
import { inject } from '@loopback/core';

export class TramiteRepository extends DefaultCrudRepository<
  Tramite,
  typeof Tramite.prototype.id
  > {
  constructor(
    @inject('datasources.gestionTramites') dataSource: GestionTramitesDataSource,
  ) {
    super(Tramite, dataSource);
  }
}
