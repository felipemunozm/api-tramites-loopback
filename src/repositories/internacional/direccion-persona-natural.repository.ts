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
  public obtenerDireccionByPersonaId(id: string): Promise<any> {
    let query = "select dpa.codigo_region, dpa.codigo_comuna, dpa.texto, co.nombre as nombre_comuna, re.nombre as nombre_region from direccion_persona_natural dpa\n" +
      "left join comuna co on co.codigo = dpa.codigo_comuna\n" +
      "left join region re on re.codigo = dpa.codigo_region\n" +
      "where persona_id = $1";
    return this.dataSource.execute(query, { id });
  }
}
