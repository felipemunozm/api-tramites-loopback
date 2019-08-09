import { DefaultCrudRepository } from '@loopback/repository';
import { Empresa } from '../../models';
import { InternacionalDataSource } from '../../datasources';
import { inject } from '@loopback/core';

export class EmpresaRepository extends DefaultCrudRepository<
  Empresa,
  typeof Empresa.prototype.id
  > {
  constructor(
    @inject('datasources.internacional') dataSource: InternacionalDataSource,
  ) {
    super(Empresa, dataSource);
  }

  public obtenerEmpresaByRut(rut: any): Promise<any> {
    let query = "select a.id, pj.id persona_juridica_id, pj.identificador, pj.razon_social, pj.nombre_fantasia, te.nombre as tipo_empresa,\n" +
      "de.codigo_comuna, co.nombre as nombre_comuna, de.codigo_region, re.nombre as nombre_region, de.texto, de.telefono_fijo, de.telefono_movil, de.email,\n" +
      "pn.id as id_representante_legal, pn.identificador identificador_representante_legal, pn.nombre_completo nombre_representante_legal from empresa a\n" +
      "right join persona_juridica pj on a.persona_juridica_id = pj.id\n" +
      "left join domicilio_empresa de on a.id = de.empresa_id\n" +
      "left join tipo_empresa te on a.tipo_empresa_id = te.id\n" +
      "left join comuna co on de.codigo_comuna = co.codigo\n" +
      "left join region re on de.codigo_region = re.codigo\n" +
      "left join persona_natural pn on pj.representante_legal_id = pn.id where pj.identificador = $1\n" +
      "order by de.id desc";
    return this.dataSource.execute(query, [rut]);
  }
  public crearEmpresa(personaJuridicaId: any, tipoEmpresa: any): Promise<any> {
    let query: string = "insert into empresa (version, persona_juridica_id,tipo_empresa_id) values (0, $1, $2) returning id";
    return this.dataSource.execute(query, [personaJuridicaId, tipoEmpresa]);
  }
}

