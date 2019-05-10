import {Entity, model, property} from '@loopback/repository';

@model({settings: {"idInjection":false,"postgresql":{"schema":"public","table":"parametros"}}})
export class Parametros extends Entity {
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
    required: false,
    length: 255,
    postgresql: {"columnName":"concepto","dataType":"character varying","dataLength":255,"dataPrecision":null,"dataScale":null,"nullable":"YES"},
  })
  concepto?: String;

  @property({
    type: String,
    required: false,
    length: 255,
    postgresql: {"columnName":"valor","dataType":"character varying","dataLength":255,"dataPrecision":null,"dataScale":null,"nullable":"YES"},
  })
  valor?: String;

  // Define well-known properties here

  // Indexer property to allow additional data
  [prop: string]: any;

  constructor(data?: Partial<Parametros>) {
    super(data);
  }
}
