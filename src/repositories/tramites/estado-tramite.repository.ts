import { DefaultCrudRepository } from '@loopback/repository';
import { EstadoTramite } from '../../models';
import { GestionTramitesDataSource } from '../../datasources';
import { inject } from '@loopback/core';

export class EstadoTramiteRepository extends DefaultCrudRepository<
  EstadoTramite,
  typeof EstadoTramite.prototype.id
  > {
  constructor(
    @inject('datasources.gestionTramites') dataSource: GestionTramitesDataSource,
  ) {
    super(EstadoTramite, dataSource);
  }
}
