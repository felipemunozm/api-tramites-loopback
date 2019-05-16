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
  public obtenerTipoPermisoById(tipoId: any): Promise<any> {
    let query: string = "select codigo, nombre, meses_vigencia from tipo_permiso where id = $1";
    return this.dataSource.execute(query, [tipoId]);
  }
  public obtenerTipoPermisoByCodigo(codigo: any): Promise<any> {
    let query: string = "select id, codigo, nombre, meses_vigencia from tipo_permiso where codigo = $1";
    return this.dataSource.execute(query, [codigo])
  }
}
