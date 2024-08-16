import {injectable, BindingScope, inject} from '@loopback/core';
import {GraphqlDataSource} from '../datasources/graphql.datasource';

@injectable({scope: BindingScope.TRANSIENT})
export class GraphqlService {
  constructor(
    @inject('datasources.graphql')
    protected graphqlDataSource: GraphqlDataSource,
  ) {}

  async fetchArticles(): Promise<any> {
    return this.graphqlDataSource.fetchArticles();
  }

  async createNewArticle(title: String, description: String): Promise<any> {
    return this.graphqlDataSource.createNewArticle(title, description);
  }

  async fetchHeader(): Promise<any> {
    return this.graphqlDataSource.fetchHeader();
  }
}
