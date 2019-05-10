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
  public obtenerPermisoVigenteByRut(rut: string): Promise<PermisoVigenteResponse> {
    let query: String = "select a.id, a.sujeto_id, a.pais_id, a.tipo_carga_id, a.tipo_id, a.fecha_creacion, a.fecha_fin_vigencia "
      + "from permiso a left join sujeto b on b.id = a.sujeto_id "
      + "left join persona_natural c on c.id = b.persona_natural_id "
      + "left join persona_juridica d on d.id = b.persona_juridica_id "
      + "where c.identificador = $1 or d.identificador = $1 and a.fecha_fin_vigencia > NOW()";
    return this.dataSource.execute(query, [rut]);
  }
}
