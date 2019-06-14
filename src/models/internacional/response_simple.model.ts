import { Entity, model, property } from '@loopback/repository';


@model({ settings: { "idInjection": false, "postgresql": { "schema": "public", "table": "response_simple" } } })
export class response_simple extends Entity {

  @property({
    type: Number,
    required: true,
    scale: 0,
    id: 1,
    postgresql: { "columnName": "id", "dataType": "bigint", "dataLength": null, "dataPrecision": null, "dataScale": 0, "nullable": "NO" },
  })
  id: Number;


  @property({
    type: JSON,
    required: false,
    scale: 0,
    postgresql: { "columnName": "request_json", "dataType": "test", "dataLength": null, "dataPrecision": null, "dataScale": 0, "nullable": "NO" },
  })
  request_json: String;

  @property({
    type: JSON,
    required: false,
    scale: 0,
    postgresql: { "columnName": "response_json", "dataType": "test", "dataLength": null, "dataPrecision": null, "dataScale": 0, "nullable": "NO" },
  })
  response_json: String;

  @property({
    type: String,
    required: false,
    length: 255,
    postgresql: { "columnName": "modified", "dataType": "timestamp", "dataLength": null, "dataPrecision": 29, "dataScale": null, "nullable": "NO" },
  })
  modified: String;

  @property({
    type: String,
    required: false,
    length: 255,
    postgresql: { "columnName": "user_modified", "dataType": "character varying", "dataLength": 255, "dataPrecision": null, "dataScale": null, "nullable": "YES" },
  })
  user_modified?: String;

  // Define well-known properties here

  // Indexer property to allow additional data
  [prop: string]: any;

  constructor(data?: Partial<response_simple>) {
    super(data);
  }
}
