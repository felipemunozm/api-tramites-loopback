import { DefaultCrudRepository } from '@loopback/repository';
import { Vehiculo } from '../../models';
import { InternacionalDataSource } from '../../datasources';
import { inject } from '@loopback/core';

export class VehiculoRepository extends DefaultCrudRepository<
  Vehiculo,
  typeof Vehiculo.prototype.id
  > {
  constructor(
    @inject('datasources.internacional') dataSource: InternacionalDataSource,
  ) {
    super(Vehiculo, dataSource);
  }
  public obtenerVehiculosByPermisoId(id: string): Promise<any> {
    let query = "select distinct v.ppu, a.habilitado, v.cantidad_ejes, v.tipo, v.cantidad_toneladas_carga, v.modelo, v.marca, v.chasis, v.num_motor, \n" +
      "v.anno_fabricacion, v.carroceria, v.nombre_propietario\n" +
      "from permiso_sujeto_vehiculo a inner join sujeto_vehiculo sv on sv.id = a.sujeto_vehiculo_id\n" +
      "inner join vehiculo v on v.id = sv.vehiculo_id where a.permiso_id =$1";
    return this.dataSource.execute(query, [id]);
  }
  public crearVehiculo(vehiculo: any): Promise<any> {
    let query: string = "insert into vehiculo (version, cantidad_ejes, identificador, tipo, cantidad_toneladas_carga, tipo_id_id, modelo, marca, ppu, anno_fabricacion, carroceria, nombre_propietario)'
      + ' values (0, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) returning id";
    return this.dataSource.execute(query, vehiculo);
  }
}
