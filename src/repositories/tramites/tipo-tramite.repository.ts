import { DefaultCrudRepository } from '@loopback/repository';
import { TipoTramite } from '../../models';
import { GestionTramitesDataSource } from '../../datasources';
import { inject } from '@loopback/core';

export class TipoTramiteRepository extends DefaultCrudRepository<
  TipoTramite,
  typeof TipoTramite.prototype.id
  > {
  constructor(
    @inject('datasources.gestionTramites') dataSource: GestionTramitesDataSource,
  ) {
    super(TipoTramite, dataSource);
  }
}
