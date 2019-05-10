import {Entity, model, property} from '@loopback/repository';

@model({settings: {"idInjection":false,"postgresql":{"schema":"public","table":"solicitud_tramite"}}})
export class SolicitudTramite extends Entity {
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
    postgresql: {"columnName":"identificador_intermediario","dataType":"character varying","dataLength":255,"dataPrecision":null,"dataScale":null,"nullable":"NO"},
  })
  identificadorIntermediario: String;

  @property({
    type: String,
    required: false,
    postgresql: {"columnName":"metadata","dataType":"text","dataLength":null,"dataPrecision":null,"dataScale":null,"nullable":"YES"},
  })
  metadata?: String;

  @property({
    type: String,
    required: true,
    postgresql: {"columnName":"fecha_hora_creacion","dataType":"timestamp without time zone","dataLength":null,"dataPrecision":null,"dataScale":null,"nullable":"NO"},
  })
  fechaHoraCreacion: String;

  @property({
    type: Number,
    required: true,
    scale: 0,
    postgresql: {"columnName":"tipo_tramite_id","dataType":"bigint","dataLength":null,"dataPrecision":null,"dataScale":0,"nullable":"NO"},
  })
  tipoTramiteId: Number;

  @property({
    type: Number,
    required: true,
    scale: 0,
    postgresql: {"columnName":"intermediario_id","dataType":"bigint","dataLength":null,"dataPrecision":null,"dataScale":0,"nullable":"NO"},
  })
  intermediarioId: Number;

  // Define well-known properties here

  // Indexer property to allow additional data
  [prop: string]: any;

  constructor(data?: Partial<SolicitudTramite>) {
    super(data);
  }
}
