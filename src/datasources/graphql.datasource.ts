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
    // const query = gql`
    //   query {
    //     articles(pagination: {limit: 60}) {
    //       data {
    //         attributes {
    //           title
    //           description
    //         }
    //       }
    //     }
    //   }
    // `;

    const query = gql`
      query {
        articles {
          data {
            id
            attributes {
              layout
              ArticleSchema
              ExcludeFromSitemap
              PageType
              OCEID
              DisplayName
              url
              aliases {
                url
              }
              EnableAMP
              Title
              ShortText
              Icon {
                data {
                  attributes {
                    url
                  }
                }
              }
              ThumbnailDesktop {
                URL {
                  data {
                    attributes {
                      url
                    }
                  }
                }
                ALTTag
              }
              ThumbnailMobile {
                URL {
                  data {
                    attributes {
                      url
                    }
                  }
                }
                ALTTag
              }
              CreatedDate
              UpdatedDate
              SEO {
                SEOTitle
                SEODescription
                SEOCanonical
                SEORobots
                SEOKeywords
                OGTitle
                OGUrl
                OGImage {
                  data {
                    attributes {
                      url
                    }
                  }
                }
                OGType
                OGDescription
                OGLocale
                TwitterTitle
                TwitterDescription
                TwitterImage {
                  data {
                    attributes {
                      url
                    }
                  }
                }
              }
              PageContent {
                ArticleImageDesktop {
                  URL {
                    data {
                      attributes {
                        url
                      }
                    }
                  }
                  ALTTag
                }
                ArticleImageMobile {
                  URL {
                    data {
                      attributes {
                        url
                      }
                    }
                  }
                  ALTTag
                }
                Author
                SummaryText
                ArticleContent
                tags {
                  title
                }
                DemoLink
                Brochure {
                  data {
                    attributes {
                      url
                    }
                  }
                }
                RelatedProducts {
                  data {
                    attributes {
                      url
                    }
                  }
                }
                SubBlogTitle
                SubBlogPublished_Date
                SubBlogReadingTime
                SubBlogDescription
                FAQsSchema
                FAQs {
                  data {
                    attributes {
                      url
                    }
                  }
                }
              }
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

  async fetchAllContentTypes() {
    const query = gql`
      query {
        __schema {
          queryType {
            fields {
              name
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
      return response['data']['__schema']['queryType']['fields'];
    } catch (error) {
      console.error('GraphQL query error:', error);
      throw error;
    }
  }

  async fethHomePageData() {
    const query = gql`
      query {
        homepage {
          data {
            attributes {
              DisplayName
              url
              aliases {
                url
              }
              EnableAMP
              OCEID
              UpdatedDate
              CreatedDate
              PageType
              layout
              seo {
                SEOTitle
                SEODescription
                SEOCanonical
                SEORobots
                SEOKeywords
                OGTitle
                OGUrl
                OGImage {
                  data {
                    attributes {
                      url
                    }
                  }
                }
                OGType
                OGDescription
                OGLocale
                TwitterTitle
                TwitterDescription
                TwitterImage {
                  data {
                    attributes {
                      url
                    }
                  }
                }
              }
              HeroBanners {
                ShortDescription
                ShortDescriptionAlignment
                LongDescription
                CTAText
                CTALink
                ShowWhatsappBtn
                VideoLink
                DesktopImage {
                  URL {
                    data {
                      attributes {
                        url
                      }
                    }
                  }
                  ALTTag
                  Link
                }
                MobileImage {
                  URL {
                    data {
                      attributes {
                        url
                      }
                    }
                  }
                  Link
                  ALTTag
                }
              }
              Overviews {
                OverviewTitle
                OverviewDescription
                ThumbnailAlignment
                ShowBrochureCTA
                EmbededVideo
                Thumbnail {
                  data {
                    attributes {
                      url
                    }
                  }
                }
                Media {
                  data {
                    attributes {
                      url
                    }
                  }
                }
                ProductBrochure {
                  data {
                    attributes {
                      url
                    }
                  }
                }
                BrochureLink {
                  data {
                    attributes {
                      url
                    }
                  }
                }
              }
              OurClients {
                Logo {
                  URL {
                    data {
                      attributes {
                        url
                      }
                    }
                  }
                  Link
                  ALTTag
                }
              }
              SolutionItems {
                Icon {
                  data {
                    attributes {
                      url
                    }
                  }
                }
                Type
                Text
                Link
              }
              SuccessStories {
                VideoThumbDesktop {
                  data {
                    attributes {
                      url
                    }
                  }
                }
                ClientLogo {
                  data {
                    attributes {
                      url
                    }
                  }
                }
                VideoEmbededLink
                Title
                ShortIntro
                Link
              }
              Products {
                Thumbnail {
                  data {
                    attributes {
                      url
                    }
                  }
                }
                ProductName
                ShortIntro
                ProductLink
              }
              RelatedContents {
                Title
                Icon {
                  data {
                    attributes {
                      url
                    }
                  }
                }
                ThumbDesktop {
                  data {
                    attributes {
                      url
                    }
                  }
                }
                ThumbMobile {
                  data {
                    attributes {
                      url
                    }
                  }
                }
                Link
                CT
              }
              FAQs {
                Question
                ShortAnswer
                LongAnser
                DestinationUrl {
                  data {
                    attributes {
                      url
                    }
                  }
                }
              }
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
      return response?.data?.homepage?.data?.attributes;
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
