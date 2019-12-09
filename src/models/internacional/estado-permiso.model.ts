import { Entity, model, property } from '@loopback/repository';

@model({ settings: { "idInjection": false, "postgresql": { "schema": "public", "table": "estado_permiso" } } })
export class EstadoPermiso extends Entity {
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
    postgresql: { "columnName": "fecha_hora_cambio", "dataType": "timestamp without time zone", "dataLength": null, "dataPrecision": null, "dataScale": null, "nullable": "NO" },
  })
  fechaHoraCambio: String;

  @property({
    type: Number,
    required: true,
    scale: 0,
    postgresql: { "columnName": "permiso_id", "dataType": "bigint", "dataLength": null, "dataPrecision": null, "dataScale": 0, "nullable": "NO" },
  })
  permisoId: Number;

  @property({
    type: Number,
    required: true,
    scale: 0,
    postgresql: { "columnName": "tipo_estado_permiso_id", "dataType": "bigint", "dataLength": null, "dataPrecision": null, "dataScale": 0, "nullable": "NO" },
  })
  tipo_estado_permiso_id: Number;

  @property({
    type: Number,
    required: true,
    scale: 0,
    postgresql: { "columnName": "folio_documento", "dataType": "bigint", "dataLength": null, "dataPrecision": null, "dataScale": 0, "nullable": "NO" },
  })
  folio_documento: Number;

  @property({
    type: String,
    required: true,
    postgresql: { "columnName": "fecha_estado_doc", "dataType": "timestamp without time zone", "dataLength": null, "dataPrecision": null, "dataScale": null, "nullable": "NO" },
  })
  fecha_estado_doc: String;

  // Define well-known properties here

  // Indexer property to allow additional data
  [prop: string]: any;

  constructor(data?: Partial<EstadoPermiso>) {
    super(data);
  }
}
