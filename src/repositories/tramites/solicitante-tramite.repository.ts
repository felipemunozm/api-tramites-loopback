import { DefaultCrudRepository } from '@loopback/repository';
import { SolicitanteTramite } from '../../models';
import { GestionTramitesDataSource } from '../../datasources';
import { inject } from '@loopback/core';

export class SolicitanteTramiteRepository extends DefaultCrudRepository<
  SolicitanteTramite,
  typeof SolicitanteTramite.prototype.id
  > {
  constructor(
    @inject('datasources.gestionTramites') dataSource: GestionTramitesDataSource,
  ) {
    super(SolicitanteTramite, dataSource);
  }
  public crearSolicitantePermiso(relacion_sujeto: any, solicitud_id: any, persona_id: any): Promise<any> {
    let query = "insert into solicitante_tramite (version, relacion_sujeto, solicitud_id, persona_id) values (0, $1, $2, $3) returning id";
    return this.dataSource.execute(query, [relacion_sujeto, solicitud_id, persona_id]);
  }
}
