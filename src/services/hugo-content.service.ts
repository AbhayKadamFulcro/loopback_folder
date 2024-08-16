import fs from 'fs';
import path from 'path';
import {injectable, inject} from '@loopback/core';
import {GraphqlService} from './graphql.service';

interface Article {
  attributes: {
    title: string;
    description: string;
  };
}

@injectable()
export class HugoContentService {
  constructor(
    @inject('services.GraphqlService')
    protected graphqlService: GraphqlService,
  ) {}

  async generateContent(): Promise<void> {
    const articles: Article[] = await this.graphqlService.fetchArticles();

    // Construct the absolute path to the `hugo` directory
    const hugoPath = path.resolve(__dirname, '../../../hugo/content/post');

    // Ensure the directory exists
    if (!fs.existsSync(hugoPath)) {
      fs.mkdirSync(hugoPath, {recursive: true});
    }

    articles.forEach((article: Article, index: number) => {
      const filePath = path.join(
        hugoPath,
        `article-${index + 1}.md`, // Ensure unique filenames
      );

      // Check if the file already exists
      if (!fs.existsSync(filePath)) {
        const content = `+++
title = "${article.attributes.title}"
date = "${new Date().toISOString()}"
draft = false
+++

  ${article.attributes.description}
        `;
        fs.writeFileSync(filePath, content);
      }
    });
  }
}
