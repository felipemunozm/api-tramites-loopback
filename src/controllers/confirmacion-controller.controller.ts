import { post, requestBody } from "@loopback/rest";

// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/context';


export class ConfirmacionControllerController {
  constructor() { }

  @post('/tramites/internacional/chile-chile/envio/confirmacion')
  async enviarConfirmacionFirma(@requestBody() params: any): Promise<any> {
    return { resultado: false, motivo: "Metodo no implementado" }
  }
}
