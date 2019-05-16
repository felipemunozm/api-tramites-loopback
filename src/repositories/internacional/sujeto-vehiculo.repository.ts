import { DefaultCrudRepository } from '@loopback/repository';
import { SujetoVehiculo } from '../../models';
import { InternacionalDataSource } from '../../datasources';
import { inject } from '@loopback/core';

export class SujetoVehiculoRepository extends DefaultCrudRepository<
  SujetoVehiculo,
  typeof SujetoVehiculo.prototype.id
  > {
  constructor(
    @inject('datasources.internacional') dataSource: InternacionalDataSource,
  ) {
    super(SujetoVehiculo, dataSource);
  }
  public crearSujetoVehiculo(respCreacionSujeto: any, response: any): Promise<any> {
    let query: string = "insert into sujeto_vehiculo (version, habilitado, sujeto_id, vehiculo_id, fecha_actualizacion) values (0, true, $1, $2, now()) returning id";
    return this.dataSource.execute(query, respCreacionSujeto, response);
  }
}
