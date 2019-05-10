import { DefaultCrudRepository } from '@loopback/repository';
import { TipoTramiteSolicitanteTramite } from '../../models';
import { GestionTramitesDataSource } from '../../datasources';
import { inject } from '@loopback/core';

export class TipoTramiteSolicitanteTramiteRepository extends DefaultCrudRepository<
  TipoTramiteSolicitanteTramite,
  typeof TipoTramiteSolicitanteTramite.prototype.id
  > {
  constructor(
    @inject('datasources.gestionTramites') dataSource: GestionTramitesDataSource,
  ) {
    super(TipoTramiteSolicitanteTramite, dataSource);
  }
}
