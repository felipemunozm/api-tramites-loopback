import {Entity, model, property} from '@loopback/repository';

@model({settings: {"idInjection":false,"postgresql":{"schema":"public","table":"comuna"}}})
export class Comuna extends Entity {
  @property({
    type: Number,
    required: false,
    scale: 0,
    postgresql: {"columnName":"id","dataType":"integer","dataLength":null,"dataPrecision":null,"dataScale":0,"nullable":"YES"},
  })
  id?: Number;

  @property({
    type: Number,
    required: false,
    scale: 0,
    postgresql: {"columnName":"version","dataType":"integer","dataLength":null,"dataPrecision":null,"dataScale":0,"nullable":"YES"},
  })
  version?: Number;

  @property({
    type: Number,
    required: false,
    scale: 0,
    postgresql: {"columnName":"region_id","dataType":"integer","dataLength":null,"dataPrecision":null,"dataScale":0,"nullable":"YES"},
  })
  regionId?: Number;

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

  // Define well-known properties here

  // Indexer property to allow additional data
  [prop: string]: any;

  constructor(data?: Partial<Comuna>) {
    super(data);
  }
}
