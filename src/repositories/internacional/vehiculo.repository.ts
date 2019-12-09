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
  public obtenerVehiculosByPermisoId(id: any): Promise<any> {
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
    let query: string = "select id,ppu from vehiculo where ppu=$1";
    return this.dataSource.execute(query, [ppu]);
  }
  public ObtenerVehiculo(ppu: any): Promise<any> {
    let query: string = "select id from vehiculo where ppu=$1";
    return this.dataSource.execute(query, [ppu]);
  }
  public ObtenerVehiculoPorPPU(ppu: any): Promise<Vehiculo> {
    let query: string = "SELECT id, version, cantidad_ejes, identificador, tipo, cantidad_toneladas_carga, tipo_id_id, modelo, marca, ppu, anno_fabricacion, carroceria, nombre_propietario, fecha_actualizacion_registro, vigencia_registro, observacion, motivo_rechazo, chasis, num_motor, limitaciones, merotenedor, rut_propietario, rut_merotenedor FROM vehiculo where ppu = '" + ppu + "'"
    // controllerLogger.info("Query para getVehiculo:\n" + query)
    return this.dataSource.execute(query)
  }
  public consultaPPUPropietario(ppu: any): Promise<any> {
    let query: string = "select nombre_propietario from vehiculo where ppu = $1";
    return this.dataSource.execute(query, [ppu]);
  }
  public insertVehiculoFV(vehiculo: any): Promise<any> {
    // let query: string = 'insert into vehiculo (version, cantidad_ejes, identificador, tipo, cantidad_toneladas_carga, tipo_id_id, modelo, marca, ppu, anno_fabricacion, carroceria, nombre_propietario, vigencia_registro, chasis, num_motor, limitaciones, merotenedor, rut_propietario, rut_merotenedor, motivo_rechazo)'
    // + ' values (0,' + '\'' + vehiculo.ejes + '\'' + ', ' + '\'' + vehiculo.identificador + '\'' + ', ' + '\'' + vehiculo.tipo + '\'' + ', ' + '\'' + vehiculo.capacidadCargaToneladas + '\'' + ',' + '\'' + vehiculo.tipoid + '\'' + ', ' + '\'' + vehiculo.modelo + '\'' + ', ' + '\'' + vehiculo.marca + '\'' + ', ' + '\'' +vehiculo.ppu + '\'' + ', ' + '\'' + vehiculo.anno + '\'' + ',  ' + '\'' + vehiculo.carroceria + '\'' + ',  ' + '\'' + vehiculo.nombrePropietario + '\'' + ', now(), ' + '\'' + vehiculo.chasis + '\'' + ', ' + '\'' + vehiculo.numeroMotor + '\'' + ', \'' + vehiculo.limitacion + '\', \'' + vehiculo.merotenedor + '\', \'' + vehiculo.rutPropietario + '\', \'' + vehiculo.rutMerotenedor + '\', \'' + vehiculo.motivoRechazo ? vehiculo.motivoRechazo : null + '\') returning id;'
    let query: string = 'insert into vehiculo (version, cantidad_ejes, identificador, tipo, cantidad_toneladas_carga, tipo_id_id, modelo, marca, ppu, anno_fabricacion, carroceria, nombre_propietario, vigencia_registro, chasis, num_motor, limitaciones, merotenedor, rut_propietario, rut_merotenedor, motivo_rechazo)'
      + ' values (0,$1 ,$2 , $3, $4, $5, $6, $7, $8, $9, $10, $11, now(), $12, $13, $14, $15, $16, $17, $18) returning id;'
    // controllerLogger.info('Query de insercion de vehículo es: ' + query)
    return this.dataSource.execute(query, [vehiculo.ejes, vehiculo.identificador, vehiculo.tipo, vehiculo.capacidadCargaToneladas, vehiculo.tipoid, vehiculo.modelo, vehiculo.marca, vehiculo.ppu, vehiculo.anno, vehiculo.carroceria, vehiculo.nombrePropietario, vehiculo.chasis, vehiculo.numeroMotor, vehiculo.limitacion, vehiculo.merotenedor, vehiculo.rutPropietario, vehiculo.rutMerotenedor, vehiculo.motivoRechazo,]);
  }

  public updateVehiculoFV(vehiculo: any): Promise<any> {
    let query: string = "update vehiculo set fecha_actualizacion_registro = now() where ppu = $1";
    return this.dataSource.execute(query, [vehiculo.ppu]);
  }

  public updateVehiculo(vehiculo: any): Promise<any> {
    // let query: string = "UPDATE vehiculo SET version=0, cantidad_ejes='" + vehiculo.ejes + "', identificador='" + vehiculo.identificador + "', tipo='" + vehiculo.tipo + "', cantidad_toneladas_carga='" + vehiculo.capacidadCargaToneladas + "', tipo_id_id='" + vehiculo.tipoid + "', modelo='" + vehiculo.modelo + "', marca='" + vehiculo.marca + "', anno_fabricacion='" + vehiculo.anno + "', carroceria='" + vehiculo.carroceria + "', nombre_propietario='" + vehiculo.nombrePropietario + "', fecha_actualizacion_registro=now(), vigencia_registro=now(), observacion='" + vehiculo.observacion + "', motivo_rechazo='" + vehiculo.motivoRechazo + "', chasis='" + vehiculo.chasis + "', num_motor='" + vehiculo.numeroMotor + "', limitaciones='" + vehiculo.limitacion + "', merotenedor='" + vehiculo.merotenedor + "', rut_propietario='" + vehiculo.rutPropietario + "', rut_merotenedor='" + vehiculo.rutMerotenedor + "' WHERE ppu='" + vehiculo.ppu + "';"
    let query: string = "UPDATE vehiculo SET version=0, cantidad_ejes=$1, identificador=$2, tipo=$3, cantidad_toneladas_carga=$4, tipo_id_id=$5, modelo=$6, marca=$7, anno_fabricacion=$8, carroceria=$9, nombre_propietario=$10, fecha_actualizacion_registro=$11, vigencia_registro=$12, observacion=$13, motivo_rechazo=$14, chasis=$15, num_motor=$16, limitaciones=$17, merotenedor=$18, rut_propietario=$19, rut_merotenedor=$20 WHERE ppu=$21;"
    return this.dataSource.execute(query, [vehiculo.ejes, vehiculo.identificador, vehiculo.tipo, vehiculo.capacidadCargaToneladas, vehiculo.tipoid, vehiculo.modelo, vehiculo.marca, vehiculo.anno, vehiculo.carroceria, vehiculo.nombrePropietario, new Date(), new Date(), null, vehiculo.motivoRechazo ? vehiculo.motivoRechazo : null, vehiculo.chasis, vehiculo.numeroMotor, vehiculo.limitacion, vehiculo.merotenedor, vehiculo.rutPropietario, vehiculo.rutMerotenedor, vehiculo.ppu])
    // return this.dataSource.execute(query)
  }
  public obtenerEmpresaByRut(rut: any): Promise<any> {
    let query: string = "select a.id, pj.id as persona_juridica_id, pj.identificador, pj.razon_social, pj.nombre_fantasia, te.nombre as tipo_empresa,\n" +
      "de.codigo_comuna, co.nombre as nombre_comuna, de.codigo_region, re.nombre as nombre_region, de.texto, de.telefono_fijo, de.telefono_movil, de.email,\n" +
      "pn.id as id_representante_legal, pn.identificador as identificador_representante_legal, pn.nombre_completo as nombre_representante_legal, pn.email as email_representante_legal,\n" +
      "dpn.codigo_comuna as codigo_comuna_rl, dpn.codigo_region as codigo_region_rl, dpn.telefono_fijo as telefono_fijo_rl,dpn.telefono_movil as telefono_movil_rl, dpn.texto as texto_rl, r.nombre as nombre_region_rl, c.nombre as nombre_comuna_rl\n" +
      "from empresa a\n" +
      "right join persona_juridica pj on a.persona_juridica_id = pj.id\n" +
      "left join domicilio_empresa de on a.id = de.empresa_id\n" +
      "left join tipo_empresa te on a.tipo_empresa_id = te.id\n" +
      "left join comuna co on de.codigo_comuna = co.codigo\n" +
      "left join region re on de.codigo_region = re.codigo\n" +
      "left join persona_natural pn on pj.representante_legal_id = pn.id\n" +
      "left join direccion_persona_natural dpn on pj.id = dpn.persona_juridica_id and pj.representante_legal_id = dpn.persona_id\n" +
      "left join region r on dpn.codigo_region = r.codigo\n" +
      "left join comuna c on dpn.codigo_comuna = c.codigo\n" +
      "where pj.identificador = $1" +
      "order by de.id desc";
    let aux: number;
    aux = rut;
    try {
      console.log("RUT: " + rut);
    } catch (e) {
      console.log(e)
    }
    return this.dataSource.execute(query, [rut]);
  }
}
