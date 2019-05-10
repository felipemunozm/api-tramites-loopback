import {Entity, model, property} from '@loopback/repository';

@model({settings: {"idInjection":false,"postgresql":{"schema":"public","table":"intermediario_tramite"}}})
export class IntermediarioTramite extends Entity {
  @property({
    type: Number,
    required: true,
    scale: 0,
    id: 1,
    postgresql: {"columnName":"id","dataType":"bigint","dataLength":null,"dataPrecision":null,"dataScale":0,"nullable":"NO"},
  })
  id: Number;

  @property({
    type: Number,
    required: true,
    scale: 0,
    postgresql: {"columnName":"version","dataType":"bigint","dataLength":null,"dataPrecision":null,"dataScale":0,"nullable":"NO"},
  })
  version: Number;

  @property({
    type: String,
    required: true,
    length: 255,
    postgresql: {"columnName":"authentication_key","dataType":"character varying","dataLength":255,"dataPrecision":null,"dataScale":null,"nullable":"NO"},
  })
  authenticationKey: String;

  @property({
    type: String,
    required: true,
    length: 255,
    postgresql: {"columnName":"codigo","dataType":"character varying","dataLength":255,"dataPrecision":null,"dataScale":null,"nullable":"NO"},
  })
  codigo: String;

  @property({
    type: String,
    required: true,
    length: 255,
    postgresql: {"columnName":"nombre","dataType":"character varying","dataLength":255,"dataPrecision":null,"dataScale":null,"nullable":"NO"},
  })
  nombre: String;

  // Define well-known properties here

  // Indexer property to allow additional data
  [prop: string]: any;

  constructor(data?: Partial<IntermediarioTramite>) {
    super(data);
  }
}
