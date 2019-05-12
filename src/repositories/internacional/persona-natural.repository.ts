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
}
