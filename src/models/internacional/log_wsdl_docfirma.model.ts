import { Entity, model, property } from '@loopback/repository';

@model({ settings: { "idInjection": false, "postgresql": { "schema": "public", "table": "log_wsdl_docfirma" } } })
export class Log_wsdl_docfirma extends Entity {
  @property({
    type: Number,
    required: true,
    scale: 0,
    id: 1,
    postgresql: { "columnName": "id", "dataType": "bigint", "dataLength": null, "dataPrecision": null, "dataScale": 0, "nullable": "NO" },
  })
  id: Number;

  @property({
    type: String,
    required: false,
    postgresql: { "columnName": "fecha_log", "dataType": "timestamp without time zone", "dataLength": null, "dataPrecision": null, "dataScale": null, "nullable": "YES" },
  })
  fecha_log: String;

  @property({
    type: Number,
    required: true,
    scale: 0,
    postgresql: { "columnName": "id_permiso", "dataType": "bigint", "dataLength": null, "dataPrecision": null, "dataScale": 0, "nullable": "NO" },
  })
  id_permiso: Number;

  @property({
    type: Number,
    required: true,
    scale: 0,
    postgresql: { "columnName": "id_estado_log", "dataType": "bigint", "dataLength": null, "dataPrecision": null, "dataScale": 0, "nullable": "NO" },
  })
  id_estado_log: Number;

  // Define well-known properties here

  // Indexer property to allow additional data
  [prop: string]: any;

  constructor(data?: Partial<Log_wsdl_docfirma>) {
    super(data);
  }
}
