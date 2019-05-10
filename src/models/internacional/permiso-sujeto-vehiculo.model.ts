import {Entity, model, property} from '@loopback/repository';

@model({settings: {"idInjection":false,"postgresql":{"schema":"public","table":"permiso_sujeto_vehiculo"}}})
export class PermisoSujetoVehiculo extends Entity {
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
    postgresql: {"columnName":"sujeto_vehiculo_id","dataType":"bigint","dataLength":null,"dataPrecision":null,"dataScale":0,"nullable":"NO"},
  })
  sujetoVehiculoId: Number;

  @property({
    type: Number,
    required: true,
    scale: 0,
    postgresql: {"columnName":"permiso_id","dataType":"bigint","dataLength":null,"dataPrecision":null,"dataScale":0,"nullable":"NO"},
  })
  permisoId: Number;

  @property({
    type: Number,
    required: false,
    scale: 0,
    postgresql: {"columnName":"ejes","dataType":"integer","dataLength":null,"dataPrecision":null,"dataScale":0,"nullable":"YES"},
  })
  ejes?: Number;

  @property({
    type: Date,
    required: false,
    postgresql: {"columnName":"fecha_vencimiento_ls","dataType":"date","dataLength":null,"dataPrecision":null,"dataScale":null,"nullable":"YES"},
  })
  fechaVencimientoLs?: Date;

  @property({
    type: String,
    required: false,
    length: 2000,
    postgresql: {"columnName":"observacion","dataType":"character varying","dataLength":2000,"dataPrecision":null,"dataScale":null,"nullable":"YES"},
  })
  observacion?: String;

  @property({
    type: String,
    required: false,
    length: 8,
    postgresql: {"columnName":"ppu","dataType":"character varying","dataLength":8,"dataPrecision":null,"dataScale":null,"nullable":"YES"},
  })
  ppu?: String;

  @property({
    type: String,
    required: false,
    postgresql: {"columnName":"tipo_vehiculo","dataType":"character varying","dataLength":null,"dataPrecision":null,"dataScale":null,"nullable":"YES"},
  })
  tipoVehiculo?: String;

  @property({
    type: String,
    required: false,
    postgresql: {"columnName":"marca","dataType":"character varying","dataLength":null,"dataPrecision":null,"dataScale":null,"nullable":"YES"},
  })
  marca?: String;

  @property({
    type: String,
    required: false,
    postgresql: {"columnName":"modelo","dataType":"character varying","dataLength":null,"dataPrecision":null,"dataScale":null,"nullable":"YES"},
  })
  modelo?: String;

  @property({
    type: Number,
    required: false,
    scale: 0,
    postgresql: {"columnName":"anno","dataType":"bigint","dataLength":null,"dataPrecision":null,"dataScale":0,"nullable":"YES"},
  })
  anno?: Number;

  @property({
    type: String,
    required: false,
    postgresql: {"columnName":"carroceria","dataType":"character varying","dataLength":null,"dataPrecision":null,"dataScale":null,"nullable":"YES"},
  })
  carroceria?: String;

  @property({
    type: String,
    required: false,
    postgresql: {"columnName":"chasis","dataType":"character varying","dataLength":null,"dataPrecision":null,"dataScale":null,"nullable":"YES"},
  })
  chasis?: String;

  @property({
    type: String,
    required: false,
    postgresql: {"columnName":"numero_motor","dataType":"character varying","dataLength":null,"dataPrecision":null,"dataScale":null,"nullable":"YES"},
  })
  numeroMotor?: String;

  @property({
    type: Date,
    required: false,
    postgresql: {"columnName":"fechavencimientort","dataType":"date","dataLength":null,"dataPrecision":null,"dataScale":null,"nullable":"YES"},
  })
  fechavencimientort?: Date;

  @property({
    type: String,
    required: false,
    postgresql: {"columnName":"estadort","dataType":"character varying","dataLength":null,"dataPrecision":null,"dataScale":null,"nullable":"YES"},
  })
  estadort?: String;

  @property({
    type: String,
    required: false,
    postgresql: {"columnName":"propietario","dataType":"character varying","dataLength":null,"dataPrecision":null,"dataScale":null,"nullable":"YES"},
  })
  propietario?: String;

  @property({
    type: String,
    required: false,
    postgresql: {"columnName":"toneladas","dataType":"character varying","dataLength":null,"dataPrecision":null,"dataScale":null,"nullable":"YES"},
  })
  toneladas?: String;

  // Define well-known properties here

  // Indexer property to allow additional data
  [prop: string]: any;

  constructor(data?: Partial<PermisoSujetoVehiculo>) {
    super(data);
  }
}
