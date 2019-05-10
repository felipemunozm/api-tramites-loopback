import { DefaultCrudRepository } from '@loopback/repository';
import { SolicitudTramite } from '../../models';
import { GestionTramitesDataSource } from '../../datasources';
import { inject } from '@loopback/core';

export class SolicitudTramiteRepository extends DefaultCrudRepository<
  SolicitudTramite,
  typeof SolicitudTramite.prototype.id
  > {
  constructor(
    @inject('datasources.gestionTramites') dataSource: GestionTramitesDataSource,
  ) {
    super(SolicitudTramite, dataSource);
  }
}
