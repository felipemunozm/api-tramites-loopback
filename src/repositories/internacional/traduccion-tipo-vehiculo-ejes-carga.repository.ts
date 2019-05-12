import { DefaultCrudRepository } from '@loopback/repository';
import { TraduccionTipoVehiculoEjesCarga } from '../../models';
import { InternacionalDataSource } from '../../datasources';
import { inject } from '@loopback/core';

export class TraduccionTipoVehiculoEjesCargaRepository extends DefaultCrudRepository<
  TraduccionTipoVehiculoEjesCarga,
  typeof TraduccionTipoVehiculoEjesCarga.prototype.id
  > {
  constructor(
    @inject('datasources.internacional') dataSource: InternacionalDataSource,
  ) {
    super(TraduccionTipoVehiculoEjesCarga, dataSource);
  }
  public obtenerCapacidadesCargas(): any {
    let query: string = "select id, tipo_vehiculo, cantidad_ejes, capacidad_carga from traduccion_tipo_vehiculo_ejes_carga";
    return this.dataSource.execute(query);
  }
}
