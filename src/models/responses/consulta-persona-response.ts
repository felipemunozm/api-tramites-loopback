import { JsonObject, JsonProperty } from "json2typescript";

@JsonObject('ConsultaPersonaResponse')
export class ConsultaPersonaResponse {
  @JsonProperty('rutSolicitante', String)
  rutSolicitante: string;
  @JsonProperty('codigoResultado', Number)
  codigoResultado: number;
  @JsonProperty('descripcionResultado', String)
  descripcionResultado: string;

  test(i: number): void {

  }
}
