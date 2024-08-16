import {inject} from '@loopback/core';
import {get, response, ResponseObject} from '@loopback/rest';
import {GraphqlService} from '../services/graphql.service';

/**
 * OpenAPI response for article()
 */
const HEADER_RESPONSE: ResponseObject = {
  description: 'Header Response',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        title: 'HeaderResponse',
        properties: {
          __typename: {type: 'string'},
          title: {type: 'string'},
        },
      },
    },
  },
};

export class HeaderController {
  constructor(
    @inject('services.GraphqlService')
    protected graphqlService: GraphqlService,
  ) {}

  @get('/header')
  @response(200, HEADER_RESPONSE)
  async getHeader(): Promise<any> {
    return this.graphqlService.fetchHeader();
  }
}
