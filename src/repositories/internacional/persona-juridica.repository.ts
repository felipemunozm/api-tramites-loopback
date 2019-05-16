import { DefaultCrudRepository } from '@loopback/repository';
import { PersonaJuridica } from '../../models';
import { InternacionalDataSource } from '../../datasources';
import { inject } from '@loopback/core';

export class PersonaJuridicaRepository extends DefaultCrudRepository<
  PersonaJuridica,
  typeof PersonaJuridica.prototype.id
  > {
  constructor(
    @inject('datasources.internacional') dataSource: InternacionalDataSource,
  ) {
    super(PersonaJuridica, dataSource);
  }
  public crearPersonaJuridica(persona: any): Promise<any> {
    let query: string = "insert into persona_juridica (version, razon_social, identificador, tipo_id_id, nombre_fantasia, representante_legal_id) values (0, $1, $2, $3, $4, $5) returning id";
    return this.dataSource.execute(query, [persona.razonSocial, persona.identificador, persona.tipoIdentificadorId, persona.nombreFantasia, persona.representanteLegalId]);
  }
  public actualizarRazonSocialPersonaJuridica(personaJuridicaId: any, razonSocial: any): Promise<any> {
    let query: string = "update persona_juridica set razon_social = $1 where id = $2 returning id";
    return this.dataSource.execute(query, [razonSocial, personaJuridicaId]);
  }
}
