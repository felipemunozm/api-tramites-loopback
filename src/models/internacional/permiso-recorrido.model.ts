import {Entity, model, property} from '@loopback/repository';

@model({settings: {"idInjection":false,"postgresql":{"schema":"public","table":"permiso_recorrido"}}})
export class PermisoRecorrido extends Entity {
  @property({
    type: Number,
    required: true,
    scale: 0,
    postgresql: {"columnName":"permiso_recorridos_id","dataType":"bigint","dataLength":null,"dataPrecision":null,"dataScale":0,"nullable":"NO"},
  })
  permisoRecorridosId: Number;

  @property({
    type: Number,
    required: false,
    scale: 0,
    postgresql: {"columnName":"recorrido_id","dataType":"bigint","dataLength":null,"dataPrecision":null,"dataScale":0,"nullable":"YES"},
  })
  recorridoId?: Number;

  // Define well-known properties here

  // Indexer property to allow additional data
  [prop: string]: any;

  constructor(data?: Partial<PermisoRecorrido>) {
    super(data);
  }
}
