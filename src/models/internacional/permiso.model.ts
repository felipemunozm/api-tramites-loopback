import { Entity, model, property } from '@loopback/repository';

@model({ settings: { "idInjection": false, "postgresql": { "schema": "public", "table": "permiso" } } })
export class Permiso extends Entity {
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
    type: Number,
    required: true,
    scale: 0,
    postgresql: { "columnName": "sujeto_id", "dataType": "bigint", "dataLength": null, "dataPrecision": null, "dataScale": 0, "nullable": "NO" },
  })
  sujetoId: Number;

  @property({
    type: Number,
    required: true,
    scale: 0,
    postgresql: { "columnName": "pais_id", "dataType": "bigint", "dataLength": null, "dataPrecision": null, "dataScale": 0, "nullable": "NO" },
  })
  paisId: Number;

  @property({
    type: Number,
    required: true,
    scale: 0,
    postgresql: { "columnName": "tipo_carga_id", "dataType": "bigint", "dataLength": null, "dataPrecision": null, "dataScale": 0, "nullable": "NO" },
  })
  tipoCargaId: Number;

  @property({
    type: Number,
    required: true,
    scale: 0,
    postgresql: { "columnName": "tipo_id", "dataType": "bigint", "dataLength": null, "dataPrecision": null, "dataScale": 0, "nullable": "NO" },
  })
  tipoId: Number;

  @property({
    type: String,
    required: true,
    postgresql: { "columnName": "fecha_creacion", "dataType": "timestamp without time zone", "dataLength": null, "dataPrecision": null, "dataScale": null, "nullable": "NO" },
  })
  fechaCreacion: String;

  @property({
    type: String,
    required: false,
    postgresql: { "columnName": "fecha_fin_vigencia", "dataType": "timestamp without time zone", "dataLength": null, "dataPrecision": null, "dataScale": null, "nullable": "YES" },
  })
  fechaFinVigencia?: String;

  @property({
    type: Number,
    required: false,
    scale: 0,
    postgresql: { "columnName": "certificado", "dataType": "bigint", "dataLength": null, "dataPrecision": null, "dataScale": 0, "nullable": "YES" },
  })
  certificado?: Number;

  @property({
    type: String,
    required: false,
    length: 255,
    postgresql: { "columnName": "url_callback", "dataType": "character varying", "dataLength": 255, "dataPrecision": null, "dataScale": null, "nullable": "YES" },
  })
  urlCallback?: String;

  @property({
    type: Number,
    required: false,
    scale: 0,
    postgresql: { "columnName": "tipo_estado_permiso_id", "dataType": "bigint", "dataLength": null, "dataPrecision": null, "dataScale": 0, "nullable": "YES" },
  })
  tipo_estado_permiso_id?: Number;
  @property({
    type: Number,
    required: false,
    scale: 0,
    postgresql: { "columnName": "id_anterior", "dataType": "bigint", "dataLength": null, "dataPrecision": null, "dataScale": 0, "nullable": "YES" },
  })
  id_anterior?: Number;

  // Define well-known properties here

  // Indexer property to allow additional data
  [prop: string]: any;

  constructor(data?: Partial<Permiso>) {
    super(data);
  }
}
