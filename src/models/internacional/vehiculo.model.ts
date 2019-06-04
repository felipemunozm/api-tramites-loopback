import { Entity, model, property } from '@loopback/repository';

@model({ settings: { "idInjection": false, "postgresql": { "schema": "public", "table": "vehiculo" } } })
export class Vehiculo extends Entity {
  @property({
    type: Number,
    required: true,
    scale: 0,
    id: 1,
    postgresql: { "columnName": "id", "dataType": "bigint", "dataLength": null, "dataPrecision": null, "dataScale": 0, "nullable": "NO" },
  })
  id: Number;

  @property({
    type: Number,
    required: true,
    scale: 0,
    postgresql: { "columnName": "version", "dataType": "bigint", "dataLength": null, "dataPrecision": null, "dataScale": 0, "nullable": "NO" },
  })
  version: Number;

  @property({
    type: String,
    required: true,
    postgresql: { "columnName": "cantidad_ejes", "dataType": "character varying", "dataLength": null, "dataPrecision": null, "dataScale": null, "nullable": "NO" },
  })
  cantidadEjes: String;

  @property({
    type: String,
    required: true,
    length: 255,
    postgresql: { "columnName": "identificador", "dataType": "character varying", "dataLength": 255, "dataPrecision": null, "dataScale": null, "nullable": "NO" },
  })
  identificador: String;

  @property({
    type: String,
    required: true,
    length: 255,
    postgresql: { "columnName": "tipo", "dataType": "character varying", "dataLength": 255, "dataPrecision": null, "dataScale": null, "nullable": "NO" },
  })
  tipo: String;

  @property({
    type: String,
    required: true,
    postgresql: { "columnName": "cantidad_toneladas_carga", "dataType": "character varying", "dataLength": null, "dataPrecision": null, "dataScale": null, "nullable": "NO" },
  })
  cantidadToneladasCarga: String;

  @property({
    type: Number,
    required: true,
    scale: 0,
    postgresql: { "columnName": "tipo_id_id", "dataType": "bigint", "dataLength": null, "dataPrecision": null, "dataScale": 0, "nullable": "NO" },
  })
  tipoIdId: Number;

  @property({
    type: String,
    required: true,
    length: 255,
    postgresql: { "columnName": "modelo", "dataType": "character varying", "dataLength": 255, "dataPrecision": null, "dataScale": null, "nullable": "NO" },
  })
  modelo: String;

  @property({
    type: String,
    required: true,
    length: 255,
    postgresql: { "columnName": "marca", "dataType": "character varying", "dataLength": 255, "dataPrecision": null, "dataScale": null, "nullable": "NO" },
  })
  marca: String;

  @property({
    type: String,
    required: true,
    length: 255,
    postgresql: { "columnName": "ppu", "dataType": "character varying", "dataLength": 255, "dataPrecision": null, "dataScale": null, "nullable": "NO" },
  })
  ppu: String;

  @property({
    type: Number,
    required: false,
    scale: 0,
    postgresql: { "columnName": "anno_fabricacion", "dataType": "integer", "dataLength": null, "dataPrecision": null, "dataScale": 0, "nullable": "YES" },
  })
  annoFabricacion?: Number;

  @property({
    type: String,
    required: false,
    length: 100,
    postgresql: { "columnName": "carroceria", "dataType": "character varying", "dataLength": 100, "dataPrecision": null, "dataScale": null, "nullable": "YES" },
  })
  carroceria?: String;

  @property({
    type: String,
    required: false,
    length: 100,
    postgresql: { "columnName": "nombre_propietario", "dataType": "character varying", "dataLength": 100, "dataPrecision": null, "dataScale": null, "nullable": "YES" },
  })
  nombrePropietario?: String;

  @property({
    type: String,
    required: false,
    postgresql: { "columnName": "fecha_actualizacion_registro", "dataType": "timestamp without time zone", "dataLength": null, "dataPrecision": null, "dataScale": null, "nullable": "YES" },
  })
  fechaActualizacionRegistro?: String;

  @property({
    type: String,
    required: false,
    postgresql: { "columnName": "vigencia_registro", "dataType": "timestamp without time zone", "dataLength": null, "dataPrecision": null, "dataScale": null, "nullable": "YES" },
  })
  vigenciaRegistro?: String;

  @property({
    type: String,
    required: false,
    length: 255,
    postgresql: { "columnName": "observacion", "dataType": "character varying", "dataLength": 255, "dataPrecision": null, "dataScale": null, "nullable": "YES" },
  })
  observacion?: String;

  @property({
    type: String,
    required: false,
    length: 255,
    postgresql: { "columnName": "motivo_rechazo", "dataType": "character varying", "dataLength": 255, "dataPrecision": null, "dataScale": null, "nullable": "YES" },
  })
  motivoRechazo?: String;

  @property({
    type: String,
    required: false,
    length: 255,
    postgresql: { "columnName": "chasis", "dataType": "character varying", "dataLength": 255, "dataPrecision": null, "dataScale": null, "nullable": "YES" },
  })
  chasis?: String;

  @property({
    type: String,
    required: false,
    length: 255,
    postgresql: { "columnName": "num_motor", "dataType": "character varying", "dataLength": 255, "dataPrecision": null, "dataScale": null, "nullable": "YES" },
  })
  numMotor?: String;

  @property({
    type: String,
    required: false,
    length: 255,
    postgresql: { "columnName": "num_motor", "dataType": "text", "dataLength": 255, "dataPrecision": null, "dataScale": null, "nullable": "YES" },
  })
  limitaciones?: String;

  @property({
    type: String,
    required: false,
    length: 255,
    postgresql: { "columnName": "num_motor", "dataType": "character varying", "dataLength": 500, "dataPrecision": null, "dataScale": null, "nullable": "YES" },
  })
  merotenedor?: String

  @property({
    type: String,
    required: false,
    length: 255,
    postgresql: { "columnName": "rut_propietario", "dataType": "character varying", "dataLength": 10, "dataPrecision": null, "dataScale": null, "nullable": "YES" },
  })
  rutPropietario?: String

  @property({
    type: String,
    required: false,
    length: 255,
    postgresql: { "columnName": "rut_merotenedor", "dataType": "character varying", "dataLength": 10, "dataPrecision": null, "dataScale": null, "nullable": "YES" },
  })
  rutMerotenedor?: String
  // Define well-known properties here

  // Indexer property to allow additional data
  [prop: string]: any;

  constructor(data?: Partial<Vehiculo>) {
    super(data);
  }
}
