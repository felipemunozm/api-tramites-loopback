import {Entity, model, property} from '@loopback/repository';

@model({settings: {"idInjection":false,"postgresql":{"schema":"public","table":"analista"}}})
export class Analista extends Entity {
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
    postgresql: {"columnName":"nombre_completo","dataType":"character varying","dataLength":255,"dataPrecision":null,"dataScale":null,"nullable":"NO"},
  })
  nombreCompleto: String;

  @property({
    type: Number,
    required: true,
    scale: 0,
    postgresql: {"columnName":"region_id","dataType":"bigint","dataLength":null,"dataPrecision":null,"dataScale":0,"nullable":"NO"},
  })
  regionId: Number;

  @property({
    type: String,
    required: false,
    length: 255,
    postgresql: {"columnName":"rut","dataType":"character varying","dataLength":255,"dataPrecision":null,"dataScale":null,"nullable":"YES"},
  })
  rut?: String;

  @property({
    type: String,
    required: true,
    length: 100,
    postgresql: {"columnName":"codigo","dataType":"character varying","dataLength":100,"dataPrecision":null,"dataScale":null,"nullable":"NO"},
  })
  codigo: String;

  // Define well-known properties here

  // Indexer property to allow additional data
  [prop: string]: any;

  constructor(data?: Partial<Analista>) {
    super(data);
  }
}
