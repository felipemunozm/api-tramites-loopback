import { DefaultCrudRepository } from '@loopback/repository';
import { DomicilioEmpresa } from '../../models';
import { InternacionalDataSource } from '../../datasources';
import { inject } from '@loopback/core';

export class DomicilioEmpresaRepository extends DefaultCrudRepository<
  DomicilioEmpresa,
  typeof DomicilioEmpresa.prototype.id
  > {
  constructor(
    @inject('datasources.internacional') dataSource: InternacionalDataSource,
  ) {
    super(DomicilioEmpresa, dataSource);
  }
  public crearDomicilioEmpresa(domicilio: any): Promise<any> {
    let query: string = "insert into domicilio_empresa (version, codigo_region, codigo_comuna, texto, telefono_fijo, telefono_movil, email, empresa_id) values (0, $1, $2, $3, $4, $5, $6, $7) returning id";
    return this.dataSource.execute(query, [domicilio.codigoRegion, domicilio.codigoComuna, domicilio.texto, domicilio.telefonoFijo, domicilio.telefonoMovil, domicilio.email, domicilio.empresaId]);
  }
  public actualizarDomicilioEmpresalById(domicilio: any): Promise<any> {
    let query = "update domicilio_empresa set codigo_region = $1 , codigo_comuna = $2,texto = $3, telefono_fijo = $4 , telefono_movil = $5 , email = $6 where empresa_id = $7";
    return this.dataSource.execute(query, [domicilio.codigoRegion, domicilio.codigoComuna, domicilio.texto, domicilio.telefonoFijo, domicilio.telefonoMovil, domicilio.email, domicilio.empresaId]);
  }
}
