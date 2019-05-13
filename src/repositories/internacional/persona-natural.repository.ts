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
    let query: string = "select id, nombre_completo nombreCompleto, identificador, tipo_id_id tipoIdentificadorId from persona_natural where identificador = $1 and tipo_id_id = 1";
    return this.dataSource.execute(query);
  }

  public crearPersonaNatural(persona: any): Promise<any> {
    let query = "insert into persona_natural (version, nombre_completo, identificador, tipo_id_id, email) values (0, $1, $2, $3, $4) returning id";
    return this.dataSource.execute(query, [persona.nombreCompleto, persona.identificador, persona.tipoIdentificadorId, persona.email]);
  }
  public crearDireccionPersonaNatural(direccion: any): Promise<any> {
    let query = "insert into direccion_persona_natural (version, codigo_region, codigo_comuna, tipo, texto, persona_id) values (0, $1, $2, $3, $4, $5) returning id";
    return this.dataSource.execute(query, [direccion.codigo_region, direccion.codigo_comuna, direccion.tipo, direccion.texto, direccion.persona_id]);
  }
}
