import {Entity, model, property} from '@loopback/repository';

@model({settings: {"idInjection":false,"postgresql":{"schema":"public","table":"tipo_empresa"}}})
export class TipoEmpresa extends Entity {
  @property({
    type: Number,
    required: true,
    scale: 0,
    id: 1,
    postgresql: {"columnName":"id","dataType":"integer","dataLength":null,"dataPrecision":null,"dataScale":0,"nullable":"NO"},
  })
  id: Number;

  @property({
    type: String,
    required: true,
    length: 100,
    postgresql: {"columnName":"nombre","dataType":"character varying","dataLength":100,"dataPrecision":null,"dataScale":null,"nullable":"NO"},
  })
  nombre: String;

  @property({
    type: Number,
    required: true,
    scale: 0,
    postgresql: {"columnName":"version","dataType":"integer","dataLength":null,"dataPrecision":null,"dataScale":0,"nullable":"NO"},
  })
  version: Number;

  @property({
    type: String,
    required: false,
    length: 50,
    postgresql: {"columnName":"codigo","dataType":"character varying","dataLength":50,"dataPrecision":null,"dataScale":null,"nullable":"YES"},
  })
  codigo?: String;

  // Define well-known properties here

  // Indexer property to allow additional data
  [prop: string]: any;

  constructor(data?: Partial<TipoEmpresa>) {
    super(data);
  }
}
