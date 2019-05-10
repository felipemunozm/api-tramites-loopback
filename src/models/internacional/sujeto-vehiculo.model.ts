import {Entity, model, property} from '@loopback/repository';

@model({settings: {"idInjection":false,"postgresql":{"schema":"public","table":"sujeto_vehiculo"}}})
export class SujetoVehiculo extends Entity {
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
    postgresql: {"columnName":"sujeto_id","dataType":"bigint","dataLength":null,"dataPrecision":null,"dataScale":0,"nullable":"NO"},
  })
  sujetoId: Number;

  @property({
    type: Number,
    required: true,
    scale: 0,
    postgresql: {"columnName":"vehiculo_id","dataType":"bigint","dataLength":null,"dataPrecision":null,"dataScale":0,"nullable":"NO"},
  })
  vehiculoId: Number;

  @property({
    type: String,
    required: false,
    postgresql: {"columnName":"fecha_actualizacion","dataType":"time without time zone","dataLength":null,"dataPrecision":null,"dataScale":null,"nullable":"YES"},
  })
  fechaActualizacion?: String;

  // Define well-known properties here

  // Indexer property to allow additional data
  [prop: string]: any;

  constructor(data?: Partial<SujetoVehiculo>) {
    super(data);
  }
}
