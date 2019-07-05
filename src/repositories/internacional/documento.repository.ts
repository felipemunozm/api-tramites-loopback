import { DefaultCrudRepository } from '@loopback/repository';
import { Documento } from '../../models';
import { InternacionalDataSource } from '../../datasources';
import { inject } from '@loopback/core';
import { controllerLogger } from '../../logger/logger-config';

export class DocumentoRepository extends DefaultCrudRepository<
  Documento,
  typeof Documento.prototype.id
  > {
  constructor(
    @inject('datasources.internacional') dataSource: InternacionalDataSource,
  ) {
    super(Documento, dataSource);
  }
  public insertarDocumento(urlDescargaDocumento: any, codigoTipoDocumento: any, permisoId: any): Promise<any> {
    let query: string = "insert into documento (version, tipo_id, hashing, url, algoritmo, permiso_id) select 0, id, null, $1, null, $3 from tipo_documento where codigo = $2 returning id";
    return this.dataSource.execute(query, [urlDescargaDocumento, codigoTipoDocumento, permisoId]);
  }

  public insertDocumentoFV(doc: any, respCreacionPermiso: any): Promise<any> {
    let query: string = 'insert into documento (version, tipo_id, hashing, url, algoritmo, permiso_id) select 0, id, null, ' + '\'' + doc.urlDescargaDocumento + '\'' + ', null, ' + respCreacionPermiso.id + ' from tipo_documento where codigo = ' + '\'' + doc.codigoTipoDocumento + '\'' + ';';
    return this.dataSource.execute(query);
  }

  public borrarDocumento(permisoId: any): Promise<any> {
    let query: string = 'DELETE FROM public.documento WHERE permiso_id = $1';
    return this.dataSource.execute(query, [permisoId]);
  }
}
