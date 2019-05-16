import { DefaultCrudRepository } from '@loopback/repository';
import { Analista } from '../../models';
import { GestionTramitesDataSource } from '../../datasources';
import { inject } from '@loopback/core';

export class AnalistaRepository extends DefaultCrudRepository<
  Analista,
  typeof Analista.prototype.id
  > {
  constructor(
    @inject('datasources.gestionTramites') dataSource: GestionTramitesDataSource,
  ) {
    super(Analista, dataSource);
  }
  public obtenerAnalistas(): Promise<any> {
    let query = "select id, codigo, nombre_completo, region_id, rut from analista";
    return this.dataSource.execute(query);
  }
  public crearAnalista(analista: any): Promise<any> {
    let query = "insert into analista (version, nombre_completo, region_id, codigo) values (0, $1, $2, $3) returning id";
    return this.dataSource.execute(query, [analista.nombre_completo, analista.region_id, analista.codigo]);
  }
  public actualizarAnalista(analista: any): Promise<any> {
    let query = "update analista set version = version + 1, nombre_completo = $1, region_id = $2 where codigo = $3";
    return this.dataSource.execute(query, [analista.nombre_completo, analista.region_id, analista.codigo]);
  }
}
