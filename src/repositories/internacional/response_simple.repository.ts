import { DefaultCrudRepository } from '@loopback/repository';
import { response_simple } from '../../models';
import { InternacionalDataSource } from '../../datasources';
import { inject } from '@loopback/core';
import { Permiso } from '../../models';

export class response_simpleRepository extends DefaultCrudRepository<
  response_simple,
  typeof response_simple.prototype.id
  > {
  constructor(
    @inject('datasources.internacional') dataSource: InternacionalDataSource,
  ) {
    super(response_simple, dataSource);
  }
  //public crearResponse(request_json: any, response_simple: any, modified: any, user_modified: any): Promise<any> {
  public crearResponse(response_simple: any): Promise<any> {
    let query = "insert into response_simple (request_json, response_json, modified, user_modified) values ($1, $2, $3, $4) returning id";
    return this.dataSource.execute(query, [response_simple.request_json, response_simple.response_json, response_simple.modified, response_simple.user_modified]);
  }
  public obtenerURLCallBackId(documentoId: any): Promise<any> {
    let query: string = "select url_callback from permiso per where per.certificado = $1";
    return this.dataSource.execute(query, [documentoId]);
  }
}
