import { DefaultCrudRepository } from '@loopback/repository';
import { Region } from '../../models';
import { InternacionalDataSource } from '../../datasources';
import { inject } from '@loopback/core';

export class RegionRepository extends DefaultCrudRepository<
  Region,
  typeof Region.prototype.id
  > {
  constructor(
    @inject('datasources.internacional') dataSource: InternacionalDataSource,
  ) {
    super(Region, dataSource);
  }
}