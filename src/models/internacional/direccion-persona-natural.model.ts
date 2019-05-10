import {Entity, model, property} from '@loopback/repository';

@model({settings: {"idInjection":false,"postgresql":{"schema":"public","table":"direccion_persona_natural"}}})
export class DireccionPersonaNatural extends Entity {
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
    postgresql: {"columnName":"codigo_region","dataType":"character varying","dataLength":255,"dataPrecision":null,"dataScale":null,"nullable":"NO"},
  })
  codigoRegion: String;

  @property({
    type: String,
    required: true,
    length: 255,
    postgresql: {"columnName":"codigo_comuna","dataType":"character varying","dataLength":255,"dataPrecision":null,"dataScale":null,"nullable":"NO"},
  })
  codigoComuna: String;

  @property({
    type: String,
    required: true,
    length: 255,
    postgresql: {"columnName":"tipo","dataType":"character varying","dataLength":255,"dataPrecision":null,"dataScale":null,"nullable":"NO"},
  })
  tipo: String;

  @property({
    type: String,
    required: true,
    length: 255,
    postgresql: {"columnName":"texto","dataType":"character varying","dataLength":255,"dataPrecision":null,"dataScale":null,"nullable":"NO"},
  })
  texto: String;

  @property({
    type: Number,
    required: true,
    scale: 0,
    postgresql: {"columnName":"persona_id","dataType":"bigint","dataLength":null,"dataPrecision":null,"dataScale":0,"nullable":"NO"},
  })
  personaId: Number;

  // Define well-known properties here

  // Indexer property to allow additional data
  [prop: string]: any;

  constructor(data?: Partial<DireccionPersonaNatural>) {
    super(data);
  }
}
