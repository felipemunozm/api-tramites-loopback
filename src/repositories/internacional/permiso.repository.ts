import { DefaultCrudRepository, DataSource } from '@loopback/repository';
import { Permiso } from '../../models';
import { InternacionalDataSource, GestionTramitesDataSource } from '../../datasources';
import { inject } from '@loopback/core';


export class PermisoVigenteResponse {
  public id: string
  public sujeto_id: string;
  public pais_id: string;
  public tipo_carga_id: string;
  public tipo_id: string;
  public fecha_creacion: string;
  public fecha_fin_vigencia: string;
}
export class PermisoRepository extends DefaultCrudRepository<
  Permiso,
  typeof Permiso.prototype.id
  > {
  constructor(
    @inject('datasources.internacional') dataSource: InternacionalDataSource,
  ) {
    super(Permiso, dataSource);
  }
  public obtenerPermisoVigenteByRut(rut: string): Promise<any> {
    let query: String = "select a.id, a.sujeto_id, a.pais_id, a.tipo_carga_id, a.tipo_id, a.fecha_creacion, a.fecha_fin_vigencia, a.tipo_estado_permiso_id \r\n"
      + "from permiso a left join sujeto b on b.id = a.sujeto_id \r\n"
      + "left join persona_natural c on c.id = b.persona_natural_id \r\n"
      + "left join persona_juridica d on d.id = b.persona_juridica_id \r\n"
      + "where (c.identificador = $1 or d.identificador = $1) and a.fecha_fin_vigencia > NOW() \r\n"
      + "order by a.id desc";
    return this.dataSource.execute(query, [rut]);
  }
  public obtenerPermisoByCertificado(certificado: any): Promise<any> {
    let query: string = "select id, url_callback from permiso where certificado = $1";
    return this.dataSource.execute(query, [certificado]);
  }
  public crearPermiso(permiso: any): Promise<any> {
    let query: string = "insert into permiso (version, sujeto_id, pais_id, tipo_carga_id, tipo_id, fecha_creacion, fecha_fin_vigencia, url_callback, id_anterior, ciudad_origen, ciudad_destino) values (0, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10) returning id";
    return this.dataSource.execute(query, [permiso.sujetoId, permiso.paisId, permiso.tipoCargaId, permiso.tipoId, permiso.fechaHoraCreacion, permiso.fechaFinVigencia, permiso.urlCallback, permiso.id_anterior, permiso.ciudadOrigen, permiso.ciudadDestino]);
  }
  public actualizarCertificadoEnPermisoById(permisoId: any, certificadoId: any, tipoEstadoPermisoId: any): Promise<any> {
    let query: string = "update permiso set certificado = $2, tipo_estado_permiso_id = $3 where id = $1 returning id";
    return this.dataSource.execute(query, [permisoId, certificadoId, tipoEstadoPermisoId]);
  }
  public actualizarEstadoPermisoEnPermisoById(permisoId: any, tipoEstadoPermisoId: any): Promise<any> {
    let query: string = "update permiso set tipo_estado_permiso_id = $2 where id = $1 returning id";
    return this.dataSource.execute(query, [permisoId, tipoEstadoPermisoId]);
  }
  public borrarPermiso(borrarPermisoSujetoVehiculo: any): Promise<any> {
    let query: string = "Delete from permiso where id = $1 returning id;";
    return this.dataSource.execute(query, [borrarPermisoSujetoVehiculo]);
  }
  public obtenerPermisoVigenteFirmadoByRut(rut: string): Promise<any> {
    let query: String = "select a.id, a.sujeto_id, a.pais_id, a.tipo_carga_id, a.tipo_id, a.fecha_creacion, a.fecha_fin_vigencia, a.tipo_estado_permiso_id \r\n"
      + "from permiso a left join sujeto b on b.id = a.sujeto_id \r\n"
      + "left join persona_natural c on c.id = b.persona_natural_id \r\n"
      + "left join persona_juridica d on d.id = b.persona_juridica_id \r\n"
      + "where (c.identificador = $1 or d.identificador = $1) and a.fecha_fin_vigencia > NOW() and tipo_estado_permiso_id = 3 \r\n"
      + "order by a.id desc";
    return this.dataSource.execute(query, [rut]);
  }
  public obtenerPermisoById(permisoId: any): Promise<any> {
    let query: String = "SELECT fecha_fin_vigencia FROM permiso where id = $1";
    return this.dataSource.execute(query, [permisoId]);
  }
}
