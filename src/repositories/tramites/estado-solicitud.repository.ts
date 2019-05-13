import { DefaultCrudRepository } from '@loopback/repository';
import { EstadoSolicitud } from '../../models';
import { GestionTramitesDataSource } from '../../datasources';
import { inject } from '@loopback/core';

export class EstadoSolicitudRepository extends DefaultCrudRepository<
  EstadoSolicitud,
  typeof EstadoSolicitud.prototype.id
  > {
  constructor(
    @inject('datasources.gestionTramites') dataSource: GestionTramitesDataSource,
  ) {
    super(EstadoSolicitud, dataSource);
  }
  public crearEstadoSolicitudPermiso(estado: any): Promise<any> {
    let query: string = "";
    return this.dataSource.execute(query, [estado.analistaId, estado.metadata, estado.etapaId, estado.solicitudId, estado.fechaHora]);
  }
}
