import { DefaultCrudRepository } from '@loopback/repository';
import { Tramite } from '../../models';
import { GestionTramitesDataSource } from '../../datasources';
import { inject } from '@loopback/core';

export class TramiteRepository extends DefaultCrudRepository<
  Tramite,
  typeof Tramite.prototype.id
  > {
  constructor(
    @inject('datasources.gestionTramites') dataSource: GestionTramitesDataSource,
  ) {
    super(Tramite, dataSource);
  }
  public obtenerTramiteBySolicitudId(solicitudId: any): Promise<any> {
    let query: string = "select id, identificador_intermediario, analista_aprobacion_id, solicitud_id, metadata, codigo, fecha_hora_creacion, tipo_tramite_id, intermediario_id from tramite where solicitud_id = $1";
    return this.dataSource.execute(query, [solicitudId]);
  }
  public crearTramite(tramite: any): Promise<any> {
    let query = 'insert into tramite (version, identificador_intermediario, analista_aprobacion_id, solicitud_id, metadata, codigo, fecha_hora_creacion, tipo_tramite_id, intermediario_id) '
      + 'values (0, $1, $2, $3, $4, $5, $6, $7, $8) returning id';
    return this.dataSource.execute(query, [tramite.identificadorIntermediario, tramite.analistaId, tramite.solicitudId, tramite.metadata, tramite.codigo, tramite.fechaHoraCreacion, tramite.tipoTramiteId, tramite.intermediarioId]);
  }
}
