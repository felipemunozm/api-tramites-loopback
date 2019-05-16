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
  public crearEstadoTramite(tramiteId: any, estapaId: any): Promise<any> {
    let query: string = "insert into estado_tramite (version, tramite_id, metadata, etapa_id, fecha_hora) values (0, $1, $2, $3, $4) returning id";
    return this.dataSource.execute(query, [tramiteId, '', estapaId, new Date()]);
  }
}
