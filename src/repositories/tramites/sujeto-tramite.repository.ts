import { DefaultCrudRepository } from '@loopback/repository';
import { SujetoTramite } from '../../models';
import { GestionTramitesDataSource } from '../../datasources';
import { inject } from '@loopback/core';

export class SujetoTramiteRepository extends DefaultCrudRepository<
  SujetoTramite,
  typeof SujetoTramite.prototype.id
  > {
  constructor(
    @inject('datasources.gestionTramites') dataSource: GestionTramitesDataSource,
  ) {
    super(SujetoTramite, dataSource);
  }
}
