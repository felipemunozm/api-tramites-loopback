import { DefaultCrudRepository } from '@loopback/repository';
import { TipoTramitePolitica } from '../../models';
import { GestionTramitesDataSource } from '../../datasources';
import { inject } from '@loopback/core';

export class TipoTramitePoliticaRepository extends DefaultCrudRepository<
  TipoTramitePolitica,
  typeof TipoTramitePolitica.prototype.id
  > {
  constructor(
    @inject('datasources.gestionTramites') dataSource: GestionTramitesDataSource,
  ) {
    super(TipoTramitePolitica, dataSource);
  }
}
