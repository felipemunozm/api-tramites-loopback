import { DefaultCrudRepository } from '@loopback/repository';
import { TipoTramiteEtapaSolicitud } from '../../models';
import { GestionTramitesDataSource } from '../../datasources';
import { inject } from '@loopback/core';

export class TipoTramiteEtapaSolicitudRepository extends DefaultCrudRepository<
  TipoTramiteEtapaSolicitud,
  typeof TipoTramiteEtapaSolicitud.prototype.id
  > {
  constructor(
    @inject('datasources.gestionTramites') dataSource: GestionTramitesDataSource,
  ) {
    super(TipoTramiteEtapaSolicitud, dataSource);
  }
}
