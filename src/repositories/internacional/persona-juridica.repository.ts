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
}
