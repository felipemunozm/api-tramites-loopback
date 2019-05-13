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
  public obtenerSolicitudByIdentificadorIntermediario(identificadorIntermediario: any): Promise<any> {
    let query: string = "select id, identificador_intermediario, metadata, fecha_hora_creacion, tipo_tramite_id, intermediario_id from solicitud_tramite where identificador_intermediario = $1";
    return this.dataSource.execute(query, [identificadorIntermediario]);
  }
  public crearSolicitudPermiso(permiso: any): Promise<any> {
    let query: string = "insert into solicitud_tramite (version, identificador_intermediario, metadata, fecha_hora_creacion, tipo_tramite_id, intermediario_id) values (0, $1, $2, $3, $4, $5) returning id";
    return this.dataSource.execute(query, [permiso.identificadorIntermediario, permiso.metadata, permiso.fechaHoraCreacion, permiso.tipoTramiteId, permiso.intermediarioId]);
  }
}
