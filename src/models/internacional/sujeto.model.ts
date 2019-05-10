import {Entity, model, property} from '@loopback/repository';

@model({settings: {"idInjection":false,"postgresql":{"schema":"public","table":"sujeto"}}})
export class Sujeto extends Entity {
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
    required: false,
    scale: 0,
    postgresql: {"columnName":"persona_natural_id","dataType":"bigint","dataLength":null,"dataPrecision":null,"dataScale":0,"nullable":"YES"},
  })
  personaNaturalId?: Number;

  @property({
    type: Number,
    required: false,
    scale: 0,
    postgresql: {"columnName":"persona_juridica_id","dataType":"bigint","dataLength":null,"dataPrecision":null,"dataScale":0,"nullable":"YES"},
  })
  personaJuridicaId?: Number;

  // Define well-known properties here

  // Indexer property to allow additional data
  [prop: string]: any;

  constructor(data?: Partial<Sujeto>) {
    super(data);
  }
}
