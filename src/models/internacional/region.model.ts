import {Entity, model, property} from '@loopback/repository';

@model({settings: {"idInjection":false,"postgresql":{"schema":"public","table":"region"}}})
export class Region extends Entity {
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
    required: false,
    length: 255,
    postgresql: {"columnName":"codigo","dataType":"character varying","dataLength":255,"dataPrecision":null,"dataScale":null,"nullable":"YES"},
  })
  codigo?: String;

  @property({
    type: String,
    required: false,
    length: 255,
    postgresql: {"columnName":"nombre","dataType":"character varying","dataLength":255,"dataPrecision":null,"dataScale":null,"nullable":"YES"},
  })
  nombre?: String;

  @property({
    type: Number,
    required: false,
    scale: 0,
    postgresql: {"columnName":"version","dataType":"integer","dataLength":null,"dataPrecision":null,"dataScale":0,"nullable":"YES"},
  })
  version?: Number;

  // Define well-known properties here

  // Indexer property to allow additional data
  [prop: string]: any;

  constructor(data?: Partial<Region>) {
    super(data);
  }
}
