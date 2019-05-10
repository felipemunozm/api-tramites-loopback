import { DefaultCrudRepository } from '@loopback/repository';
import { SujetoSolicitud } from '../../models';
import { GestionTramitesDataSource } from '../../datasources';
import { inject } from '@loopback/core';

export class SujetoSolicitudRepository extends DefaultCrudRepository<
  SujetoSolicitud,
  typeof SujetoSolicitud.prototype.id
  > {
  constructor(
    @inject('datasources.gestionTramites') dataSource: GestionTramitesDataSource,
  ) {
    super(SujetoSolicitud, dataSource);
  }
}
