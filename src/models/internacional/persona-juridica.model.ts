import {Entity, model, property} from '@loopback/repository';

@model({settings: {"idInjection":false,"postgresql":{"schema":"public","table":"persona_juridica"}}})
export class PersonaJuridica extends Entity {
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
    postgresql: {"columnName":"razon_social","dataType":"character varying","dataLength":255,"dataPrecision":null,"dataScale":null,"nullable":"NO"},
  })
  razonSocial: String;

  @property({
    type: String,
    required: true,
    length: 255,
    postgresql: {"columnName":"identificador","dataType":"character varying","dataLength":255,"dataPrecision":null,"dataScale":null,"nullable":"NO"},
  })
  identificador: String;

  @property({
    type: Number,
    required: true,
    scale: 0,
    postgresql: {"columnName":"tipo_id_id","dataType":"bigint","dataLength":null,"dataPrecision":null,"dataScale":0,"nullable":"NO"},
  })
  tipoIdId: Number;

  @property({
    type: String,
    required: true,
    length: 255,
    postgresql: {"columnName":"nombre_fantasia","dataType":"character varying","dataLength":255,"dataPrecision":null,"dataScale":null,"nullable":"NO"},
  })
  nombreFantasia: String;

  @property({
    type: Number,
    required: true,
    scale: 0,
    postgresql: {"columnName":"representante_legal_id","dataType":"bigint","dataLength":null,"dataPrecision":null,"dataScale":0,"nullable":"NO"},
  })
  representanteLegalId: Number;

  // Define well-known properties here

  // Indexer property to allow additional data
  [prop: string]: any;

  constructor(data?: Partial<PersonaJuridica>) {
    super(data);
  }
}
