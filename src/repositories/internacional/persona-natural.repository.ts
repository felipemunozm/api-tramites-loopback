import { DefaultCrudRepository } from '@loopback/repository';
import { PersonaNatural } from '../../models';
import { InternacionalDataSource } from '../../datasources';
import { inject } from '@loopback/core';

export class PersonaNaturalRepository extends DefaultCrudRepository<
  PersonaNatural,
  typeof PersonaNatural.prototype.id
  > {
  constructor(
    @inject('datasources.internacional') dataSource: InternacionalDataSource,
  ) {
    super(PersonaNatural, dataSource);
  }
  public obtenerPersonaNaturalByRut(rut: any): Promise<any> {
    let query: string = "select id id, nombre_completo nombreCompleto, identificador, tipo_id_id tipoIdentificadorId from persona_natural where identificador = $1 and tipo_id_id = 1";
    return this.dataSource.execute(query, [rut]);
  }
  public actualizarPersonaNaturalByRut(nombre: any, rut: any): Promise<any> {
    let query = "update persona_natural set nombre_completo = $1 where identificador = $2";
    return this.dataSource.execute(query, [nombre, rut]);
  }
  public crearPersonaNatural(persona: any): Promise<any> {
    let query = "insert into persona_natural (version, nombre_completo, identificador, tipo_id_id, email) values (0, $1, $2, $3, $4) returning id";
    return this.dataSource.execute(query, [persona.nombreCompleto, persona.identificador, persona.tipoIdentificadorId, persona.email]);
  }

  public crearDireccionPersonaNatural(direccion: any): Promise<any> {
    let query = "insert into direccion_persona_natural (version, codigo_region, codigo_comuna, tipo, texto, persona_id, telefono_fijo, telefono_movil) values (0, $1, $2, $3, $4, $5, $6, $7) returning id";
    return this.dataSource.execute(query, [direccion.codigo_region, direccion.codigo_comuna, direccion.tipo, direccion.texto, direccion.persona_id, direccion.telefono_fijo, direccion.telefono_movil]);
  }
  public obtenerDireccionByPersonaId(id: any): Promise<any> {
    let query = "select dpa.codigo_region, dpa.codigo_comuna, dpa.texto, co.nombre as nombre_comuna, re.nombre as nombre_region from direccion_persona_natural dpa\n" +
      "left join comuna co on co.codigo = dpa.codigo_comuna\n" +
      "left join region re on re.codigo = dpa.codigo_region\n" +
      "where persona_id = $1";
    return this.dataSource.execute(query, [id]);
  }
}
