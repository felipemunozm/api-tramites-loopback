import { DefaultCrudRepository, repository } from '@loopback/repository';
import { TipoPermiso } from '../../models';
import { inject } from '@loopback/core';
import { InternacionalDataSource } from '../../datasources';
import { TramiteRepository } from '../tramites/tramite.repository';

export class TipoPermisoRepository extends DefaultCrudRepository<
  TipoPermiso,
  typeof TipoPermiso.prototype.id
  > {
  constructor(
    @inject('datasources.internacional') dataSource: InternacionalDataSource,
  ) {
    super(TipoPermiso, dataSource);
  }
}
