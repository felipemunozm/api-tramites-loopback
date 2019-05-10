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
}
