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
    let query: string = "INSERT INTO public.estado_permiso (version, fecha_hora_cambio, permiso_id, tipo_estado_permiso_id, folio_documento, fecha_estado_doc) VALUES(1, $1, $2, $3, $4, $5) returning id";
    return this.dataSource.execute(query, [estadoPermiso.fecha_hora_cambio, estadoPermiso.permiso_id, estadoPermiso.tipo_estado_permiso_id, estadoPermiso.folio_documento, estadoPermiso.fecha_estado_doc]);
  }
  public ActualizarEstadoPermiso(estadoPermiso: any): Promise<any> {
    let query: string = "UPDATE public.estado_permiso SET fecha_hora_cambio=$2, tipo_estado_permiso_id=$3, folio_documento=$4, fecha_estado_doc=$5 WHERE id=$1 returning id";
    return this.dataSource.execute(query, [estadoPermiso.id, estadoPermiso.fecha_hora_cambio, estadoPermiso.tipo_estado_permiso_id, estadoPermiso.folio_documento, estadoPermiso.fecha_estado_doc]);
  }
  public ObtenerEstadoPermisoByPermisoId(permisoId: any, tipoEstadoPermisoId: any): Promise<any> {
    let query: string = "SELECT id, folio_documento FROM public.estado_permiso where permiso_id =$1 and tipo_estado_permiso_id =$2 order by id desc";
    return this.dataSource.execute(query, [permisoId, tipoEstadoPermisoId]);
  }
}
