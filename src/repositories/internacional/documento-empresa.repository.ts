import { DefaultCrudRepository } from '@loopback/repository';
import { DocumentoEmpresa } from '../../models';
import { InternacionalDataSource } from '../../datasources';
import { inject } from '@loopback/core';

export class DocumentoEmpresaRepository extends DefaultCrudRepository<
  DocumentoEmpresa,
  typeof DocumentoEmpresa.prototype.id
  > {
  constructor(
    @inject('datasources.internacional') dataSource: InternacionalDataSource,
  ) {
    super(DocumentoEmpresa, dataSource);
  }
  public crearDocumentoEmpresa(tipoDocumentoId: any, empresaId: any, url: any) {
    let query: string = "insert into documento_empresa (version, tipo_id, empresa_id, url, hashing, algoritmo) values (0, $1, $2, $3, $4, $5) returning id";
    return this.dataSource.execute(query, [tipoDocumentoId, empresaId, url, '', '']);
  }
  public obtenerDocumentosEmpresaById(id: string): Promise<any> {
    let query: string = "select td.nombre, td.codigo, doc.url from documento_empresa as doc join tipo_documento td on doc.tipo_id = td.id where empresa_id = $1";
    return this.dataSource.execute(query, [id]);
  }
}
