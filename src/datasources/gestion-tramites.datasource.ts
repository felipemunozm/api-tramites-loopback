import {inject} from '@loopback/core';
import {juggler} from '@loopback/repository';
import * as config from './gestion-tramites.datasource.json';

export class GestionTramitesDataSource extends juggler.DataSource {
  static dataSourceName = 'gestionTramites';

  constructor(
    @inject('datasources.config.gestionTramites', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
