import { DefaultCrudRepository } from '@loopback/repository';
import { Log_wsdl_docfirma } from '../../models';
import { InternacionalDataSource } from '../../datasources';
import { inject } from '@loopback/core';

export class Log_wsdl_docfirmaRepository extends DefaultCrudRepository<
  Log_wsdl_docfirma,
  typeof Log_wsdl_docfirma.prototype.id
  > {
  constructor(
    @inject('datasources.internacional') dataSource: InternacionalDataSource,
  ) {
    super(Log_wsdl_docfirma, dataSource);
  }
  public crearLog_wsdl_docfirma(id_permiso: any, id_estado_log: any): Promise<any> {
    let query: string = "INSERT INTO public.log_wsdl_docfirma (fecha_log, id_permiso, id_estado_log) VALUES(NOW(), $1, $2) returning id";
    return this.dataSource.execute(query, [id_permiso, id_estado_log]);
  }
}

