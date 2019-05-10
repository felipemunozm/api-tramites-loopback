import {Entity, model, property} from '@loopback/repository';

@model({settings: {"idInjection":false,"postgresql":{"schema":"public","table":"estado_permiso"}}})
export class EstadoPermiso extends Entity {
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
    postgresql: {"columnName":"fecha_hora_cambio","dataType":"timestamp without time zone","dataLength":null,"dataPrecision":null,"dataScale":null,"nullable":"NO"},
  })
  fechaHoraCambio: String;

  @property({
    type: String,
    required: true,
    length: 255,
    postgresql: {"columnName":"estado","dataType":"character varying","dataLength":255,"dataPrecision":null,"dataScale":null,"nullable":"NO"},
  })
  estado: String;

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

  constructor(data?: Partial<EstadoPermiso>) {
    super(data);
  }
}
