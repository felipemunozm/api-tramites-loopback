import { DefaultCrudRepository } from '@loopback/repository';
import { IntermediarioTramite } from '../../models';
import { GestionTramitesDataSource } from '../../datasources';
import { inject } from '@loopback/core';

export class IntermediarioTramiteRepository extends DefaultCrudRepository<
  IntermediarioTramite,
  typeof IntermediarioTramite.prototype.id
  > {
  constructor(
    @inject('datasources.gestionTramites') dataSource: GestionTramitesDataSource,
  ) {
    super(IntermediarioTramite, dataSource);
  }
  public obtenerIntermediarios(): Promise<any> {
    let query: string = "select id, codigo, nombre, authentication_key from intermediario_tramite";
    return this.dataSource.execute(query);
  }
}
