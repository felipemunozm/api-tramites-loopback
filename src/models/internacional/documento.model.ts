import {Entity, model, property} from '@loopback/repository';

@model({settings: {"idInjection":false,"postgresql":{"schema":"public","table":"documento"}}})
export class Documento extends Entity {
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
    type: Number,
    required: true,
    scale: 0,
    postgresql: {"columnName":"tipo_id","dataType":"bigint","dataLength":null,"dataPrecision":null,"dataScale":0,"nullable":"NO"},
  })
  tipoId: Number;

  @property({
    type: String,
    required: false,
    length: 255,
    postgresql: {"columnName":"hashing","dataType":"character varying","dataLength":255,"dataPrecision":null,"dataScale":null,"nullable":"YES"},
  })
  hashing?: String;

  @property({
    type: String,
    required: true,
    postgresql: {"columnName":"url","dataType":"text","dataLength":null,"dataPrecision":null,"dataScale":null,"nullable":"NO"},
  })
  url: String;

  @property({
    type: String,
    required: false,
    length: 255,
    postgresql: {"columnName":"algoritmo","dataType":"character varying","dataLength":255,"dataPrecision":null,"dataScale":null,"nullable":"YES"},
  })
  algoritmo?: String;

  @property({
    type: Number,
    required: true,
    scale: 0,
    postgresql: {"columnName":"permiso_id","dataType":"bigint","dataLength":null,"dataPrecision":null,"dataScale":0,"nullable":"NO"},
  })
  permisoId: Number;

  // Define well-known properties here

  // Indexer property to allow additional data
  [prop: string]: any;

  constructor(data?: Partial<Documento>) {
    super(data);
  }
}
