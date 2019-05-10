import {Entity, model, property} from '@loopback/repository';

@model({settings: {"idInjection":false,"postgresql":{"schema":"public","table":"tipo_tramite_politica"}}})
export class TipoTramitePolitica extends Entity {
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
    postgresql: {"columnName":"metadata","dataType":"text","dataLength":null,"dataPrecision":null,"dataScale":null,"nullable":"NO"},
  })
  metadata: String;

  @property({
    type: String,
    required: false,
    postgresql: {"columnName":"fecha_fin_vigencia","dataType":"timestamp without time zone","dataLength":null,"dataPrecision":null,"dataScale":null,"nullable":"YES"},
  })
  fechaFinVigencia?: String;

  @property({
    type: String,
    required: true,
    postgresql: {"columnName":"fecha_inicio_vigencia","dataType":"timestamp without time zone","dataLength":null,"dataPrecision":null,"dataScale":null,"nullable":"NO"},
  })
  fechaInicioVigencia: String;

  @property({
    type: Number,
    required: true,
    scale: 0,
    postgresql: {"columnName":"tipo_tramite_id","dataType":"bigint","dataLength":null,"dataPrecision":null,"dataScale":0,"nullable":"NO"},
  })
  tipoTramiteId: Number;

  @property({
    type: String,
    required: true,
    length: 255,
    postgresql: {"columnName":"nombre_version","dataType":"character varying","dataLength":255,"dataPrecision":null,"dataScale":null,"nullable":"NO"},
  })
  nombreVersion: String;

  // Define well-known properties here

  // Indexer property to allow additional data
  [prop: string]: any;

  constructor(data?: Partial<TipoTramitePolitica>) {
    super(data);
  }
}
