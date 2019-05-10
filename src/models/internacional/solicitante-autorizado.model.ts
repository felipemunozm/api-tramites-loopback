import {Entity, model, property} from '@loopback/repository';

@model({settings: {"idInjection":false,"postgresql":{"schema":"public","table":"solicitante_autorizado"}}})
export class SolicitanteAutorizado extends Entity {
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
    type: Boolean,
    required: true,
    postgresql: {"columnName":"habilitado","dataType":"boolean","dataLength":null,"dataPrecision":null,"dataScale":null,"nullable":"NO"},
  })
  habilitado: Boolean;

  @property({
    type: Number,
    required: true,
    scale: 0,
    postgresql: {"columnName":"empresa_id","dataType":"bigint","dataLength":null,"dataPrecision":null,"dataScale":0,"nullable":"NO"},
  })
  empresaId: Number;

  @property({
    type: Number,
    required: true,
    scale: 0,
    postgresql: {"columnName":"persona_natural_id","dataType":"bigint","dataLength":null,"dataPrecision":null,"dataScale":0,"nullable":"NO"},
  })
  personaNaturalId: Number;

  @property({
    type: String,
    required: true,
    postgresql: {"columnName":"fecha_creacion","dataType":"timestamp without time zone","dataLength":null,"dataPrecision":null,"dataScale":null,"nullable":"NO"},
  })
  fechaCreacion: String;

  @property({
    type: String,
    required: false,
    length: 50,
    postgresql: {"columnName":"relacion","dataType":"character varying","dataLength":50,"dataPrecision":null,"dataScale":null,"nullable":"YES"},
  })
  relacion?: String;

  // Define well-known properties here

  // Indexer property to allow additional data
  [prop: string]: any;

  constructor(data?: Partial<SolicitanteAutorizado>) {
    super(data);
  }
}
