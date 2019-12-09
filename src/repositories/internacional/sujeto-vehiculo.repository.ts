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
    return this.dataSource.execute(query, [respCreacionSujeto, response]);
  }
  public actualizacionSujetoVehiculo(respConsultaPermiso: any): Promise<any> {
    let query: string = "update sujeto_vehiculo set fecha_actualizacion = now () where id = $1 returning id";
    return this.dataSource.execute(query, [respConsultaPermiso]);
  }
  public borrarSujetoVehiculo(borrarPermisoSujetoVehiculo: any): Promise<any> {
    let query: string = "delete from sujeto_vehiculo where id in (select c.id from permiso a inner join sujeto b on b.id = a.sujeto_id inner join sujeto_vehiculo c on b.id = c.sujeto_id where a.id = $1);";
    return this.dataSource.execute(query, [borrarPermisoSujetoVehiculo]);
  }
}
