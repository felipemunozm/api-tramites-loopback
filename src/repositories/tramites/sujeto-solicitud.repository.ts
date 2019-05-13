import { DefaultCrudRepository } from '@loopback/repository';
import { SujetoSolicitud } from '../../models';
import { GestionTramitesDataSource } from '../../datasources';
import { inject } from '@loopback/core';

export class SujetoSolicitudRepository extends DefaultCrudRepository<
  SujetoSolicitud,
  typeof SujetoSolicitud.prototype.id
  > {
  constructor(
    @inject('datasources.gestionTramites') dataSource: GestionTramitesDataSource,
  ) {
    super(SujetoSolicitud, dataSource);
  }
  public crearSujetoPersonaJuridicaPermiso(permisoId: any, personaId: any): Promise<any> {
    let query = "insert into sujeto_solicitud (version, persona_juridica_id, solicitud_id) values (0, $1, $2) returning id";
    return this.dataSource.execute(query, [personaId, permisoId]);
  }
  public crearSujetoPersonaNaturalPermiso(permisoId: any, personaId: any): Promise<any> {
    let query = "insert into sujeto_solicitud (version, persona_natural_id, solicitud_id) values (0, $1, $2) returning id";
    return this.dataSource.execute(query, [personaId, permisoId]);
  }
}
