import fs from 'fs';
import path from 'path';
import {injectable, inject} from '@loopback/core';
import {GraphqlService} from './graphql.service';

interface Article {
  attributes: {
    DisplayName: string;
    description: string;
  };
}

function createArticleContent(article: any) {
  const {
    DisplayName,
    url,
    layout,
    aliases,
    EnableAMP,
    Title,
    ShortText,
    Icon,
    SEO,
    PageContent,
    CreatedDate,
    ThumbnailDesktop,
    ThumbnailMobile,
    ArticleSchema,
    ExcludeFromSitemap,
    PageType,
    OCEID,
    UpdatedDate,
  } = article.attributes;

  const SEOContent = {
    ...SEO,
    OGImage: SEO?.OGImage.data.attributes.url,
    TwitterImage: SEO.TwitterImage.data.attributes.url,
  };

  const PageContetdata = {
    ...PageContent,
    ArticleImageDesktop: {
      URL: PageContent?.ArticleImageDesktop?.URL?.data?.attributes.url || null,
      ALTTag: PageContent?.ArticleImageDesktop?.ALTTag,
    },
    ArticleImageMobile: {
      URL: PageContent?.ArticleImageMobile?.URL?.data?.attributes.url || null,
      ALTTag: article.attributes.ArticleImageMobile?.ALTTag || '',
    },
  };

  const contentObject = {
    DisplayName,
    ExcludeFromSitemap,
    PageType,
    OCEID,
    UpdatedDate,
    url,
    layout,
    aliases: aliases?.map((item: any) => item.url),
    Title,
    ShortText,
    CreatedDate,
    ThumbnailDesktop: {
      URL: ThumbnailDesktop?.URL.data.attributes.url,
      ALTTag: ThumbnailDesktop?.ALTTag,
    },
    ThumbnailMobile: {
      URL: ThumbnailMobile?.URL.data.attributes.url,
      ALTTag: ThumbnailMobile?.ALTTag,
    },
    ...SEOContent,
    ...PageContetdata,
    FAQs: PageContent?.FAQs.data,
    RelatedProducts: PageContent?.RelatedProducts.data,
    Brochure: PageContent?.Brochure?.data[0] || '',
    Icon: Icon?.data?.attributes?.url || '',
    EnableAMP: EnableAMP === false ? 'False' : 'True',
    tags: PageContetdata?.tags.map((item: any) => item.title),
    ArticleSchema,
  };

  //   const contentObject = {
  //     SEOTitle: SEO?.SEOTitle,
  //     SEODescription: SEO?.SEODescription,
  //     SEOKeywords: SEO?.SEOKeywords, // Update with actual value if available
  //     SEOCanonical: SEO?.SEOCanonical,
  //     SEORobots: SEO?.SEORobots,
  //     OGTitle: SEO?.OGTitle,
  //     OGUrl: SEO?.OGUrl,
  //     OGImage: SEO?.OGImage.data.attributes.url,
  //     OGType: SEO?.OGType,
  //     OGDescription: SEO?.OGDescription,
  //     OGLocale: SEO?.OGLocale,
  //     TwitterTitle: article.attributes.DisplayName || '',
  //     TwitterDescription: article.attributes.ShortText || '',
  //     TwitterImage: article.attributes.ThumbnailDesktop?.URL || '',
  //     ExcludeFromSitemap: null,
  //     PageType: 'tw-page-blog-article',
  //     OCEID: article.attributes.Icon?.id || '',
  //     url: article.attributes.permalink || '',
  //     aliases: article.attributes.aliases || null,
  //     CreatedDate: article.attributes.CreatedDate || new Date().toISOString(),
  //     UpdatedDate: article.attributes.UpdatedDate || new Date().toISOString(),
  //     EnableAMP: article.attributes.EnableAMP !== null ? 'True' : 'False',
  //     layout: 'articledetail_v2',
  //     DisplayName: article.attributes.DisplayName || '',
  //     Title: article.attributes.Title || '',
  //     ShortText: article.attributes.ShortText || null,
  //     Icon: article.attributes.Icon?.URL || '',
  //     ThumbnailDesktop: {
  //       URL: article.attributes.ThumbnailDesktop?.URL || '',
  //       ALTTag: article.attributes.ThumbnailDesktop?.ALTTag || '',
  //     },
  //     ThumbnailMobile: {
  //       URL: article.attributes.ThumbnailMobile?.URL || '',
  //       ALTTag: article.attributes.ThumbnailMobile?.ALTTag || '',
  //     },
  //     ArticleImageDesktop: {
  //       URL: article.attributes.ThumbnailDesktop?.URL || '',
  //       ALTTag: article.attributes.ThumbnailDesktop?.ALTTag || '',
  //     },
  //     ArticleImageMobile: {
  //       URL: article.attributes.ThumbnailMobile?.URL || '',
  //       ALTTag: article.attributes.ThumbnailMobile?.ALTTag || '',
  //     },
  //     Author: null, // Add if available
  //     SummaryText: null, // Add if available
  //     ArticleContent: article.attributes.PageContent || '',
  //     Brochure: '',
  //     DemoLink: ' ',
  //     SubBlogTitle: null, // Add if available
  //     SubBlogPublished_Date: null, // Add if available
  //     SubBlogReadingTime: null, // Add if available
  //     SubBlogDescription: null, // Add if available
  //     tags: null, // Add if available
  //     RelatedProducts: [], // Add if available
  //     FAQs: [], // Add if available
  //     FAQsSchema: null, // Add if available
  //     ArticleSchema: `
  // <script type="application/ld+json">{
  //   "@context": "https://schema.org/",
  //   "@type": "Article",
  //   "mainEntityOfPage": {
  //     "@type": "WebPage",
  //     "@id": "${article.attributes.permalink}"
  //   },
  //   "headline": "${article.attributes.DisplayName}",
  //   "description": "${article.attributes.ShortText}",
  //   "image": {
  //     "@type": "ImageObject",
  //     "url": "${article.attributes.ThumbnailDesktop?.URL || ''}",
  //     "width": "683",
  //     "height": "384"
  //   },
  //   "author": {
  //     "@type": "Organization",
  //     "name": "Tata Tele Business Services Ltd."
  //   },
  //   "publisher": {
  //     "@type": "Organization",
  //     "name": "Tata Tele Business Services Ltd.",
  //     "logo": {
  //       "@type": "ImageObject",
  //       "url": "https://www.tatatelebusiness.com/images/logo-black.svg",
  //       "width": "287",
  //       "height": "56"
  //     }
  //   },
  //   "datePublished": "${article.attributes.CreatedDate || new Date().toISOString()}",
  //   "dateModified": "${article.attributes.UpdatedDate || new Date().toISOString()}"
  // }</script>`,
  //   };

  return JSON.stringify(contentObject, null, 2); // Pretty print JSON
}

@injectable()
export class HugoContentService {
  constructor(
    @inject('services.GraphqlService')
    protected graphqlService: GraphqlService,
  ) {}

  async generateContent(): Promise<void> {
    //fetch all the content types from strapi
    const AllContentTypes: any =
      await this.graphqlService.fetchAllContentTypes();

    //get different content types data
    const articles: Article[] = await this.graphqlService.fetchArticles();
    const homepageData: any = await this.graphqlService.fethHomePageData();

    // console.log(articles);
    console.log(homepageData)

    // Construct the absolute path to the `hugo` directory
    const hugoPath = path.resolve(__dirname, '../../../frontend/content');

    // Ensure the directory exists
    if (!fs.existsSync(hugoPath)) {
      fs.mkdirSync(hugoPath, {recursive: true});
    }
    // Create function to generate article files
    const generateArticleFiles = () => {
      const postPath = path.join(hugoPath, 'articles');

      // Ensure the post directory exists
      if (!fs.existsSync(postPath)) {
        fs.mkdirSync(postPath, {recursive: true});
      }

      articles.forEach((article: Article, index: number) => {
        const filePath = path.join(
          postPath,
          `article-${index + 1}.md`, // Ensure unique filenames
        );
        // Check if the file already exists
        if (!fs.existsSync(filePath)) {
          const content: any = createArticleContent(article);
          fs.writeFileSync(filePath, content);
        }
      });
    };
    // Check for content types and generate corresponding files
    const contentTypes = AllContentTypes.map((type: any) => type.name);

    contentTypes.forEach((contentType: any) => {
      switch (contentType) {
        case 'articles':
          generateArticleFiles();
          break;
        default:
          // console.log(`No action defined for content type: ${contentType}`);
          break;
      }
    });
  }
}
