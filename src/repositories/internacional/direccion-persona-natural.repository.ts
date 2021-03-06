import { DefaultCrudRepository } from '@loopback/repository';
import { DireccionPersonaNatural } from '../../models';
import { InternacionalDataSource } from '../../datasources';
import { inject } from '@loopback/core';

export class DireccionPersonaNaturalRepository extends DefaultCrudRepository<
  DireccionPersonaNatural,
  typeof DireccionPersonaNatural.prototype.id
  > {
  constructor(
    @inject('datasources.internacional') dataSource: InternacionalDataSource,
  ) {
    super(DireccionPersonaNatural, dataSource);
  }
  public obtenerDireccionByPersonaId(id: any, persona_juridica_id: any): Promise<any> {
    let query = "select dpa.codigo_region, dpa.codigo_comuna, dpa.texto, co.nombre as nombre_comuna, re.nombre as nombre_region, dpa.telefono_fijo, dpa.telefono_movil, pn.email from direccion_persona_natural dpa\n" +
      "left join comuna co on co.codigo = dpa.codigo_comuna\n" +
      "left join region re on re.codigo = dpa.codigo_region\n" +
      "left join persona_natural pn on pn.id = dpa.persona_id\n" +
      "where dpa.persona_id = $1 and dpa.persona_juridica_id = $2";
    return this.dataSource.execute(query, [id, persona_juridica_id]);
  }
  public crearDireccionPersonaNatural(direccion: any, persona_juridica_id: any): Promise<any> {
    let query = "insert into direccion_persona_natural (version, codigo_region, codigo_comuna, tipo, texto, persona_id, telefono_fijo, telefono_movil, persona_juridica_id) values (0, $1, $2, $3, $4, $5, $6, $7, $8) returning id";
    return this.dataSource.execute(query, [direccion.codigo_region, direccion.codigo_comuna, 'particular', direccion.texto, direccion.persona_id, direccion.telefono_fijo, direccion.telefono_movil, persona_juridica_id]);
  }
  public crearDireccionPersonaNaturalsinEmpresa(direccion: any): Promise<any> {
    let query = "insert into direccion_persona_natural (version, codigo_region, codigo_comuna, tipo, texto, persona_id, telefono_fijo, telefono_movil) values (0, $1, $2, $3, $4, $5, $6, $7) returning id";
    return this.dataSource.execute(query, [direccion.codigo_region, direccion.codigo_comuna, 'particular', direccion.texto, direccion.persona_id, direccion.telefono_fijo, direccion.telefono_movil]);
  }
}
