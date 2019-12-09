import { DefaultCrudRepository } from '@loopback/repository';
import { TipoDocumentoTipoEmpresa } from '../../models';
import { InternacionalDataSource } from '../../datasources';
import { inject } from '@loopback/core';

export class TipoDocumentoTipoEmpresaRepository extends DefaultCrudRepository<
  TipoDocumentoTipoEmpresa,
  typeof TipoDocumentoTipoEmpresa.prototype.id
  > {
  constructor(
    @inject('datasources.internacional') dataSource: InternacionalDataSource,
  ) {
    super(TipoDocumentoTipoEmpresa, dataSource);
  }
  public obtenerTiposDocumentosByCodigoTipoEmpresa(codigo: any): Promise<any> {
    let query: string = "select c.codigo, c.nombre from tipo_documento_tipo_empresa a left join tipo_empresa b on b.id = a.tipo_empresa_id left join tipo_documento c on a.tipo_documento_id = c.id where b.codigo = $1";
    return this.dataSource.execute(query, [codigo])
  }
}
