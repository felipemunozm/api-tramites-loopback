import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getFilterSchemaFor,
  getWhereSchemaFor,
  patch,
  put,
  del,
  requestBody,
} from '@loopback/rest';
import { Tramite } from '../models';
import { TramiteRepository } from '../repositories';

export class ExampleController {
  constructor(
    @repository(TramiteRepository)
    public tramiteRepository: TramiteRepository,
  ) { }

  @post('/tramites', {
    responses: {
      '200': {
        description: 'Tramite model instance',
        content: { 'application/json': { schema: { 'x-ts-type': Tramite } } },
      },
    },
  })
  async create(@requestBody() tramite: Tramite): Promise<Tramite> {
    return await this.tramiteRepository.create(tramite);
  }

  @get('/tramites/count', {
    responses: {
      '200': {
        description: 'Tramite model count',
        content: { 'application/json': { schema: CountSchema } },
      },
    },
  })
  async count(
    @param.query.object('where', getWhereSchemaFor(Tramite)) where?: Where,
  ): Promise<Count> {
    return await this.tramiteRepository.count(where);
  }

  @get('/tramites', {
    responses: {
      '200': {
        description: 'Array of Tramite model instances',
        content: {
          'application/json': {
            schema: { type: 'array', items: { 'x-ts-type': Tramite } },
          },
        },
      },
    },
  })
  async find(
    @param.query.object('filter', getFilterSchemaFor(Tramite)) filter?: Filter<Tramite>,
  ): Promise<Tramite[]> {
    return await this.tramiteRepository.find(filter);
  }

  @patch('/tramites', {
    responses: {
      '200': {
        description: 'Tramite PATCH success count',
        content: { 'application/json': { schema: CountSchema } },
      },
    },
  })
  async updateAll(
    @requestBody() tramite: Tramite,
    @param.query.object('where', getWhereSchemaFor(Tramite)) where?: Where,
  ): Promise<Count> {
    return await this.tramiteRepository.updateAll(tramite, where);
  }

  @get('/tramites/{id}', {
    responses: {
      '200': {
        description: 'Tramite model instance',
        content: { 'application/json': { schema: { 'x-ts-type': Tramite } } },
      },
    },
  })
  async findById(@param.path.number('id') id: number): Promise<Tramite> {
    return await this.tramiteRepository.findById(id);
  }

  @patch('/tramites/{id}', {
    responses: {
      '204': {
        description: 'Tramite PATCH success',
      },
    },
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody() tramite: Tramite,
  ): Promise<void> {
    await this.tramiteRepository.updateById(id, tramite);
  }

  @put('/tramites/{id}', {
    responses: {
      '204': {
        description: 'Tramite PUT success',
      },
    },
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() tramite: Tramite,
  ): Promise<void> {
    await this.tramiteRepository.replaceById(id, tramite);
  }

  @del('/tramites/{id}', {
    responses: {
      '204': {
        description: 'Tramite DELETE success',
      },
    },
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.tramiteRepository.deleteById(id);
  }
}
