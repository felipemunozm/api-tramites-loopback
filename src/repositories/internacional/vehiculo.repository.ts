import { DefaultCrudRepository } from '@loopback/repository';
import { Vehiculo } from '../../models';
import { InternacionalDataSource } from '../../datasources';
import { inject } from '@loopback/core';
import { controllerLogger } from '../../logger/logger-config';
import { json } from 'body-parser';

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
    let query: string = "insert into vehiculo (version, cantidad_ejes, identificador, tipo, cantidad_toneladas_carga, tipo_id_id, modelo, marca, ppu, anno_fabricacion, carroceria, nombre_propietario)"
      + ' values (0, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) returning id';
    return this.dataSource.execute(query, vehiculo);
  }
  public ObtenerPPUVehiculo(ppu: any): Promise<any> {
    let query: string = "select ppu from vehiculo where ppu=$1";
    return this.dataSource.execute(query);
  }
  public ObtenerVehiculo(ppu: any): Promise<any> {
    let query: string = "select id from vehiculo where ppu=$1";
    return this.dataSource.execute(query, [ppu]);
  }
  public ObtenerVehiculoPorPPU(ppu: any): Promise<Vehiculo> {
    let query: string = "SELECT id, version, cantidad_ejes, identificador, tipo, cantidad_toneladas_carga, tipo_id_id, modelo, marca, ppu, anno_fabricacion, carroceria, nombre_propietario, fecha_actualizacion_registro, vigencia_registro, observacion, motivo_rechazo, chasis, num_motor, limitaciones, merotenedor, rut_propietario, rut_merotenedor FROM vehiculo where ppu = '" + ppu + "'"
    controllerLogger.info("Query para getVehiculo:\n" + query)
    return this.dataSource.execute(query)
  }
  public consultaPPUPropietario(ppu: any): Promise<any> {
    let query: string = "select nombre_propietario from vehiculo where ppu = $1";
    return this.dataSource.execute(query, [ppu]);
  }
  public insertVehiculoFV(vehiculo: any): Promise<any> {
    let query: string = 'insert into vehiculo (version, cantidad_ejes, identificador, tipo, cantidad_toneladas_carga, tipo_id_id, modelo, marca, ppu, anno_fabricacion, carroceria, nombre_propietario, vigencia_registro, chasis, num_motor, limitaciones, merotenedor, rut_propietario, rut_merotenedor, motivo_rechazo)'
      + ' values (0,' + '\'' + vehiculo.ejes + '\'' + ', ' + '\'' + vehiculo.identificador + '\'' + ', ' + '\'' + vehiculo.tipo + '\'' + ', ' + '\'' + vehiculo.capacidadCargaToneladas + '\'' + ',' + '\'' + vehiculo.tipoid + '\'' + ', ' + '\'' + vehiculo.modelo + '\'' + ', ' + '\'' + vehiculo.marca + '\'' + ', ' + '\'' + vehiculo.ppu + '\'' + ', ' + '\'' + vehiculo.anno + '\'' + ',  ' + '\'' + vehiculo.carroceria + '\'' + ',  ' + '\'' + vehiculo.nombrePropietario + '\'' + ', now(), ' + '\'' + vehiculo.chasis + '\'' + ', ' + '\'' + vehiculo.numeroMotor + '\'' + ', \'' + vehiculo.limitacion + '\', \'' + vehiculo.merotenedor + '\', \'' + vehiculo.rutPropietario + '\', \'' + vehiculo.rutMerotenedor + '\', \'' + vehiculo.motivoRechazo ? vehiculo.motivoRechazo : null + '\') returning id;'
    controllerLogger.info('Query de insercion de vehículo es: ' + query)
    return this.dataSource.execute(query);
  }

  public updateVehiculoFV(vehiculo: any): Promise<any> {
    let query: string = "update vehiculo set fecha_actualizacion_registro = now() where ppu = $1";
    return this.dataSource.execute(query, [vehiculo.ppu]);
  }

  public updateVehiculo(vehiculo: any): Promise<any> {
    // let query: string = "UPDATE vehiculo SET version=0, cantidad_ejes='" + vehiculo.ejes + "', identificador='" + vehiculo.identificador + "', tipo='" + vehiculo.tipo + "', cantidad_toneladas_carga='" + vehiculo.capacidadCargaToneladas + "', tipo_id_id='" + vehiculo.tipoid + "', modelo='" + vehiculo.modelo + "', marca='" + vehiculo.marca + "', anno_fabricacion='" + vehiculo.anno + "', carroceria='" + vehiculo.carroceria + "', nombre_propietario='" + vehiculo.nombrePropietario + "', fecha_actualizacion_registro=now(), vigencia_registro=now(), observacion='" + vehiculo.observacion + "', motivo_rechazo='" + vehiculo.motivoRechazo + "', chasis='" + vehiculo.chasis + "', num_motor='" + vehiculo.numeroMotor + "', limitaciones='" + vehiculo.limitacion + "', merotenedor='" + vehiculo.merotenedor + "', rut_propietario='" + vehiculo.rutPropietario + "', rut_merotenedor='" + vehiculo.rutMerotenedor + "' WHERE ppu='" + vehiculo.ppu + "';"
    let query: string = "UPDATE vehiculo SET version=0, cantidad_ejes=$1, identificador=$2, tipo=$3, cantidad_toneladas_carga=$4, tipo_id_id=$5, modelo=$6, marca=$7, anno_fabricacion=$8, carroceria=$9, nombre_propietario=$10, fecha_actualizacion_registro=$11, vigencia_registro=$12, observacion=$13, motivo_rechazo=$14, chasis=$15, num_motor=$16, limitaciones=$17, merotenedor=$18, rut_propietario=$19, rut_merotenedor=$20 WHERE ppu=$21;"
    controllerLogger.info("Vehiculo a actualziar es: " + JSON.stringify(vehiculo))
    return this.dataSource.execute(query, [vehiculo.ejes, vehiculo.identificador, vehiculo.tipo, vehiculo.capacidadCargaToneladas, vehiculo.tipoid, vehiculo.modelo, vehiculo.marca, vehiculo.anno, vehiculo.carroceria, vehiculo.nombrePropietario, new Date(), new Date(), null, vehiculo.motivoRechazo ? vehiculo.motivoRechazo : null, vehiculo.chasis, vehiculo.numeroMotor, vehiculo.limitacion, vehiculo.merotenedor, vehiculo.rutPropietario, vehiculo.rutMerotenedor, vehiculo.ppu])
    // return this.dataSource.execute(query)
  }
}
