import {Entity, model, property} from '@loopback/repository';

@model({settings: {"idInjection":false,"postgresql":{"schema":"public","table":"tipo_tramite_solicitante_tramite"}}})
export class TipoTramiteSolicitanteTramite extends Entity {
  @property({
    type: Number,
    required: true,
    scale: 0,
    postgresql: {"columnName":"tipo_tramite_solicitudes_id","dataType":"bigint","dataLength":null,"dataPrecision":null,"dataScale":0,"nullable":"NO"},
  })
  tipoTramiteSolicitudesId: Number;

  @property({
    type: Number,
    required: false,
    scale: 0,
    postgresql: {"columnName":"solicitante_tramite_id","dataType":"bigint","dataLength":null,"dataPrecision":null,"dataScale":0,"nullable":"YES"},
  })
  solicitanteTramiteId?: Number;

  // Define well-known properties here

  // Indexer property to allow additional data
  [prop: string]: any;

  constructor(data?: Partial<TipoTramiteSolicitanteTramite>) {
    super(data);
  }
}
