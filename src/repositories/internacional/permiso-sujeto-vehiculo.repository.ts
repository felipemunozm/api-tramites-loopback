import { DefaultCrudRepository } from '@loopback/repository';
import { PermisoSujetoVehiculo } from '../../models';
import { InternacionalDataSource } from '../../datasources';
import { inject } from '@loopback/core';

export class PermisoSujetoVehiculoRepository extends DefaultCrudRepository<
  PermisoSujetoVehiculo,
  typeof PermisoSujetoVehiculo.prototype.id
  > {
  constructor(
    @inject('datasources.internacional') dataSource: InternacionalDataSource,
  ) {
    super(PermisoSujetoVehiculo, dataSource);
  }
  public obtenerVehiculosByPermisoId(id: any): Promise<any> {
    let query: string = "select distinct v.ppu, a.habilitado, v.cantidad_ejes, v.tipo, v.cantidad_toneladas_carga, v.modelo, v.marca, v.chasis, v.num_motor, \n" +
      "v.anno_fabricacion, v.carroceria, v.nombre_propietario\n" +
      "from permiso_sujeto_vehiculo a inner join sujeto_vehiculo sv on sv.id = a.sujeto_vehiculo_id\n" +
      "inner join vehiculo v on v.id = sv.vehiculo_id where a.permiso_id =$1";
    return this.dataSource.execute(query, [id]);
  }
  public crearPermisoSujetoVehiculo(b: any): Promise<any> {
    let query: string = "insert into permiso_sujeto_vehiculo (version, habilitado, permiso_id, sujeto_vehiculo_id) select 0, true, a.id, c.id from permiso a inner join sujeto b on b.id = a.sujeto_id inner join sujeto_vehiculo c on b.id = c.sujeto_id where a.id = $1 returning id;";
    return this.dataSource.execute(b);
  }
  public borrarPermisoSujetoVehiculo(respCreacionPermiso: any): Promise<any> {
    let query: string = "Delete from permiso_sujeto_vehiculo where permiso_id = $1 returning *;";
    return this.dataSource.execute(respCreacionPermiso);
  }
  public borrarPermiso(borrarPermisoSujetoVehiculo: any): Promise<any> {
    let query: string = "Delete from permiso where id = $1 returning id;";
    return this.dataSource.execute(borrarPermisoSujetoVehiculo);
  }
  public insertPermisoSujetoVehiculoFV(vehiculoFlota: any, respCreacionPermiso: any): Promise<any> {
    let query: string = 'insert into permiso_sujeto_vehiculo (version, habilitado, sujeto_vehiculo_id, permiso_id, ejes, fecha_vencimiento_ls, observacion, ppu, tipo_vehiculo, marca, modelo, anno, carroceria, chasis, numero_motor, fechavencimientort, estadort, propietario, toneladas) select 0, true, c.id, a.id, ' + '\'' + vehiculoFlota.ejes + '\'' + ',' + '\'' + vehiculoFlota.fechaVigenciaLS + '\'' + ',' + '\'' + vehiculoFlota.observacion + '\'' + ',' + '\'' + vehiculoFlota.ppu + '\'' + ',' + '\'' + vehiculoFlota.tipo + '\'' + ',' + '\'' + vehiculoFlota.marca + '\'' + ',' + '\'' + vehiculoFlota.modelo + '\'' + ',' + '\'' + vehiculoFlota.anno + '\'' + ',' + '\'' + vehiculoFlota.carroceria + '\'' + ',' + '\'' + vehiculoFlota.chasis + '\'' + ',' + '\'' + vehiculoFlota.numeroMotor + '\'' + ',' + '\'' + vehiculoFlota.fechaVencimientoRT + '\'' + ',' + '\'' + vehiculoFlota.estadoRT + '\'' + ',' + '\'' + vehiculoFlota.propietario + '\'' + ',' + '\'' + vehiculoFlota.toneladas + '\'' + ' from permiso a inner join sujeto b on b.id = a.sujeto_id inner join sujeto_vehiculo c on b.id = c.sujeto_id where a.id =' + respCreacionPermiso.id + ' returning id;';
    return this.dataSource.execute(query);
  }
}
