import { DefaultCrudRepository } from '@loopback/repository';
import { SolicitanteTramite } from '../../models';
import { GestionTramitesDataSource } from '../../datasources';
import { inject } from '@loopback/core';

export class SolicitanteTramiteRepository extends DefaultCrudRepository<
  SolicitanteTramite,
  typeof SolicitanteTramite.prototype.id
  > {
  constructor(
    @inject('datasources.gestionTramites') dataSource: GestionTramitesDataSource,
  ) {
    super(SolicitanteTramite, dataSource);
  }
}
