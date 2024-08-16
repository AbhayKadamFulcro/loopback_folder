import {juggler} from '@loopback/repository';
import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {ApolloClient, InMemoryCache, gql, HttpLink} from '@apollo/client';
import fetch from 'cross-fetch';
import dotenv from 'dotenv';

dotenv.config();

const GRAPHQL_URL = process.env.GRAPHQL_URL;

@lifeCycleObserver('datasource')
export class GraphqlDataSource
  extends juggler.DataSource
  implements LifeCycleObserver
{
  static dataSourceName = 'graphql';
  static readonly defaultConfig = {
    name: 'graphql',
    connector: 'memory',
  };

  client: ApolloClient<any>;

  constructor(
    @inject('datasources.config.graphql', {optional: true})
    dsConfig: object = GraphqlDataSource.defaultConfig,
  ) {
    super(dsConfig);
    const link = new HttpLink({uri: GRAPHQL_URL, fetch});
    this.client = new ApolloClient({
      link,
      cache: new InMemoryCache(),
    });
  }

  //get article
  async fetchArticles() {
    const query = gql`
      query {
        articles(pagination: {limit: 60}) {
          data {
            attributes {
              title
              description
            }
          }
        }
      }
    `;
    try {
      const response = await this.client.query({
        query: query,
        fetchPolicy: 'network-only',
        context: {fetchOptions: {next: 5}},
      });
      return response.data.articles.data;
    } catch (error) {
      console.error('GraphQL query error:', error);
      throw error;
    }
  }

  //post article
  async createNewArticle(title: String, description: String) {
    const mutation = gql`
      mutation createArticle($title: String, $description: String) {
        createArticle(data: {title: $title, description: $description}) {
          data {
            attributes {
              title
              description
            }
          }
        }
      }
    `;

    try {
      const response = await this.client.mutate({
        mutation: mutation,
        variables: {
          title: title,
          description: description,
        },
        fetchPolicy: 'network-only',
        context: {fetchOptions: {next: 5}},
      });
      return response.data.createArticle.data.attributes;
    } catch (error) {
      console.error('GraphQL query error:', error);
      throw error;
    }
  }

  async fetchHeader() {
    const query = gql`
      query {
        header {
          data {
            attributes {
              title
            }
          }
        }
      }
    `;

    try {
      const response = await this.client.query({
        query: query,
        fetchPolicy: 'network-only',
        context: {fetchOptions: {next: 5}},
      });

      return response.data.header.data.attributes;
    } catch (error) {
      throw error;
    }
  }
}
