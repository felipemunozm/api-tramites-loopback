import { DefaultCrudRepository } from '@loopback/repository';
import { TipoTramiteEtapa } from '../../models';
import { GestionTramitesDataSource } from '../../datasources';
import { inject } from '@loopback/core';

export class TipoTramiteEtapaRepository extends DefaultCrudRepository<
  TipoTramiteEtapa,
  typeof TipoTramiteEtapa.prototype.id
  > {
  constructor(
    @inject('datasources.gestionTramites') dataSource: GestionTramitesDataSource,
  ) {
    super(TipoTramiteEtapa, dataSource);
  }
}
