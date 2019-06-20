import { DefaultCrudRepository } from '@loopback/repository';
import { EstadoPermiso } from '../../models';
import { InternacionalDataSource } from '../../datasources';
import { inject } from '@loopback/core';

export class EstadoPermisoRepository extends DefaultCrudRepository<
  EstadoPermiso,
  typeof EstadoPermiso.prototype.id
  > {
  constructor(
    @inject('datasources.internacional') dataSource: InternacionalDataSource,
  ) {
    super(EstadoPermiso, dataSource);
  }
  public crearEstadoPermiso(estadoPermiso: any): Promise<any> {
    let query: string = "INSERT INTO public.estado_permiso (version, fecha_hora_cambio, permiso_id, tipo_estado_permiso_id) VALUES(1, $1, $2, $3) returning id";
    return this.dataSource.execute(query, [estadoPermiso.fecha_hora_cambio, estadoPermiso.permiso_id, estadoPermiso.tipo_estado_permiso_id]);
  }
}
