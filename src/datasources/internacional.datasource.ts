import {inject} from '@loopback/core';
import {juggler} from '@loopback/repository';
import * as config from './internacional.datasource.json';

export class InternacionalDataSource extends juggler.DataSource {
  static dataSourceName = 'internacional';

  constructor(
    @inject('datasources.config.internacional', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
