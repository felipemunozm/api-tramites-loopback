import { DefaultCrudRepository } from '@loopback/repository';
import { TipoTramiteEtapaSolicitud } from '../../models';
import { GestionTramitesDataSource } from '../../datasources';
import { inject } from '@loopback/core';

export class TipoTramiteEtapaSolicitudRepository extends DefaultCrudRepository<
  TipoTramiteEtapaSolicitud,
  typeof TipoTramiteEtapaSolicitud.prototype.id
  > {
  constructor(
    @inject('datasources.gestionTramites') dataSource: GestionTramitesDataSource,
  ) {
    super(TipoTramiteEtapaSolicitud, dataSource);
  }
  public obtenerEtapasSolicitudes(): Promise<any> {
    let query: string = "select id, codigo, nombre from tipo_tramite_etapa_solicitud";
    return this.dataSource.execute(query);
  }
}
