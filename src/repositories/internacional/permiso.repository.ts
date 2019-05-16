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
    let query: String = "select a.id, a.sujeto_id, a.pais_id, a.tipo_carga_id, a.tipo_id, a.fecha_creacion, a.fecha_fin_vigencia "
      + "from permiso a left join sujeto b on b.id = a.sujeto_id "
      + "left join persona_natural c on c.id = b.persona_natural_id "
      + "left join persona_juridica d on d.id = b.persona_juridica_id "
      + "where c.identificador = $1 or d.identificador = $1 and a.fecha_fin_vigencia > NOW()";
    return this.dataSource.execute(query, [rut]);
  }
  public crearTramite(tramite: any): Promise<any> {
    let query: string = "insert into tramite (version, identificador_intermediario, analista_aprobacion_id, solicitud_id, metadata, codigo, fecha_hora_creacion, tipo_tramite_id, intermediario_id) ";
    return this.dataSource.execute(query, [tramite.identificadorIntermediario, tramite.analistaId, tramite.solicitudId, tramite.metadata, tramite.codigo, tramite.fechaHoraCreacion, tramite.tipoTramiteId, tramite.intermediarioId]);
  }
  public crearPermiso(permiso: any): Promise<any> {
    let query: string = "insert into permiso (version, sujeto_id, pais_id, tipo_carga_id, tipo_id, fecha_creacion, fecha_fin_vigencia, url_callback) values (0, $1, $2, $3, $4, $5, $6, $7) returning id";
    return this.dataSource.execute(permiso);
  }
}
