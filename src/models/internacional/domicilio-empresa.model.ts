import {Entity, model, property} from '@loopback/repository';

@model({settings: {"idInjection":false,"postgresql":{"schema":"public","table":"domicilio_empresa"}}})
export class DomicilioEmpresa extends Entity {
  @property({
    type: Number,
    required: true,
    scale: 0,
    id: 1,
    postgresql: {"columnName":"id","dataType":"bigint","dataLength":null,"dataPrecision":null,"dataScale":0,"nullable":"NO"},
  })
  id: Number;

  @property({
    type: String,
    required: true,
    length: 50,
    postgresql: {"columnName":"codigo_region","dataType":"character varying","dataLength":50,"dataPrecision":null,"dataScale":null,"nullable":"NO"},
  })
  codigoRegion: String;

  @property({
    type: String,
    required: true,
    length: 50,
    postgresql: {"columnName":"codigo_comuna","dataType":"character varying","dataLength":50,"dataPrecision":null,"dataScale":null,"nullable":"NO"},
  })
  codigoComuna: String;

  @property({
    type: String,
    required: true,
    length: 255,
    postgresql: {"columnName":"texto","dataType":"character varying","dataLength":255,"dataPrecision":null,"dataScale":null,"nullable":"NO"},
  })
  texto: String;

  @property({
    type: String,
    required: false,
    length: 50,
    postgresql: {"columnName":"telefono_fijo","dataType":"character varying","dataLength":50,"dataPrecision":null,"dataScale":null,"nullable":"YES"},
  })
  telefonoFijo?: String;

  @property({
    type: String,
    required: false,
    length: 50,
    postgresql: {"columnName":"telefono_movil","dataType":"character varying","dataLength":50,"dataPrecision":null,"dataScale":null,"nullable":"YES"},
  })
  telefonoMovil?: String;

  @property({
    type: String,
    required: true,
    length: 100,
    postgresql: {"columnName":"email","dataType":"character varying","dataLength":100,"dataPrecision":null,"dataScale":null,"nullable":"NO"},
  })
  email: String;

  @property({
    type: Number,
    required: true,
    scale: 0,
    postgresql: {"columnName":"empresa_id","dataType":"integer","dataLength":null,"dataPrecision":null,"dataScale":0,"nullable":"NO"},
  })
  empresaId: Number;

  @property({
    type: Number,
    required: true,
    scale: 0,
    postgresql: {"columnName":"version","dataType":"integer","dataLength":null,"dataPrecision":null,"dataScale":0,"nullable":"NO"},
  })
  version: Number;

  // Define well-known properties here

  // Indexer property to allow additional data
  [prop: string]: any;

  constructor(data?: Partial<DomicilioEmpresa>) {
    super(data);
  }
}
