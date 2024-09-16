//New code for Post logic

// import {inject} from '@loopback/core';
// import {get, post, requestBody, response, ResponseObject} from '@loopback/rest';
// import {GraphqlService} from '../services/graphql.service';
// import {HugoContentService} from '../services/hugo-content.service';
// import path from 'path';
// import fs from 'fs-extra';
// import simpleGit from 'simple-git';
// import dotenv from 'dotenv';

// dotenv.config();

// const repoURL = `${process.env.HUGO_GIT_REPO}`;
// const localFolder = path.resolve(`${process.env.LOCALFOLDER_PATH}`);

// const ARTICLE_RESPONSE: ResponseObject = {
//   description: 'Article Response',
//   content: {
//     'application/json': {
//       schema: {
//         type: 'object',
//         title: 'ArticleResponse',
//         properties: {
//           __typename: {type: 'string'},
//           title: {type: 'string'},
//           description: {type: 'string'},
//         },
//       },
//     },
//   },
// };

// export class ArticleController {
//   constructor(
//     @inject('services.GraphqlService')
//     protected graphqlService: GraphqlService,
//     @inject('services.HugoContentService')
//     protected hugoContentService: HugoContentService,
//   ) {}

//   @get('/articles')
//   @response(200, ARTICLE_RESPONSE)
//   async getArticles(): Promise<any> {
//     const git = simpleGit(localFolder);

//     try {
//       // Check if the folder exists and is a git repository
//       if (
//         fs.existsSync(localFolder) &&
//         fs.existsSync(path.join(localFolder, '.git'))
//       ) {
//         // Pull the latest changes
//         await git.pull('origin', 'main');
//       } else {
//         // Clone the repository if the folder doesn't exist or isn't a git repository
//         await git.clone(repoURL, localFolder);
//         await git.checkout('main');
//       }

//       // Delete the existing content/post folder
//       const postFolderPath = path.join(localFolder, 'content', 'post');
//       if (fs.existsSync(postFolderPath)) {
//         await fs.remove(postFolderPath);
//         console.log('Deleted existing post folder:', postFolderPath);
//       }

//       // Generate new Markdown content for Hugo
//       await this.hugoContentService.generateContent();

//       // Add, commit, and push changes to the remote repository
//       await git.add(['--all', '.']);
//       const commitMessage = `Updated content from generateContent ${Math.floor(Math.random() * 100011)}`;
//       await git.commit(commitMessage);
//       await git.push('origin', 'main');
//       console.log('Successfully pushed changes to the main branch');
//     } catch (err) {
//       console.error(
//         'An error occurred during the Git operations:',
//         err.message,
//       );
//     }

//     // Return the fetched articles
//     return this.graphqlService.fetchArticles();
//   }

//   @post('/article')
//   @response(200, ARTICLE_RESPONSE)
//   async postArticle(
//     @requestBody({
//       content: {
//         'application/json': {
//           schema: {
//             type: 'object',
//             required: ['title', 'description'],
//             properties: {
//               title: {type: 'string'},
//               description: {type: 'string'},
//             },
//           },
//         },
//       },
//     })
//     articleData: {
//       title: string;
//       description: string;
//     },
//   ): Promise<any> {
//     const git = simpleGit(localFolder);

//     let newArticle = {};

//     try {
//       // Check if the folder exists and is a git repository
//       if (
//         fs.existsSync(localFolder) &&
//         fs.existsSync(path.join(localFolder, '.git'))
//       ) {
//         // Pull the latest changes
//         await git.pull('origin', 'main');
//       } else {
//         // Clone the repository if the folder doesn't exist or isn't a git repository
//         await git.clone(repoURL, localFolder);
//         await git.checkout('main');
//       }

//       // Create a new article in the GraphQL service first
//       newArticle = await this.graphqlService.createNewArticle(
//         articleData.title,
//         articleData.description,
//       );

//       // Delete the existing content/post folder
//       const postFolderPath = path.join(localFolder, 'content', 'post');
//       if (fs.existsSync(postFolderPath)) {
//         await fs.remove(postFolderPath);
//         console.log('Deleted existing post folder:', postFolderPath);
//       }

//       // Generate new Markdown content for Hugo, now including the new article
//       await this.hugoContentService.generateContent();

//       // Add, commit, and push changes to the remote repository
//       await git.add(['--all', '.']);

//       const commitMessage = `Updated content from generateContent ${Math.floor(Math.random() * 100011)}`;
//       await git.commit(commitMessage);

//       await git.push('origin', 'main');
//       console.log('Successfully pushed changes to the main branch');
//     } catch (err) {
//       console.error(
//         'An error occurred during the Git operations:',
//         err.message,
//       );
//     }

//     return newArticle; // Return the newly created article
//   }
// }

import {inject} from '@loopback/core';
import {get, post, requestBody, response, ResponseObject} from '@loopback/rest';
import {GraphqlService} from '../services/graphql.service';
import {HugoContentService} from '../services/hugo-content.service';
import {GitHubService} from '../services/github.service';
import {authenticate} from '@loopback/authentication';

const ARTICLE_RESPONSE: ResponseObject = {
  description: 'Article Response',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        title: 'ArticleResponse',
        properties: {
          __typename: {type: 'string'},
          title: {type: 'string'},
          description: {type: 'string'},
        },
      },
    },
  },
};

export class ArticleController {
  constructor(
    @inject('services.GraphqlService')
    protected graphqlService: GraphqlService,
    @inject('services.HugoContentService')
    protected hugoContentService: HugoContentService,
    @inject('services.GitHubService')
    protected gitHubService: GitHubService,
  ) {}

  @get('/articles')
  @response(200, ARTICLE_RESPONSE)
  async getArticles(): Promise<any> {
    try {
      // await this.gitHubService.initializeRepository();
      await this.gitHubService.cleanPostFolder();
      await this.hugoContentService.generateContent();
      // await this.gitHubService.commitAndPushChanges(
      //   `Updated content from generateContent ${Math.floor(Math.random() * 100011)}`,
      // );
    } catch (err) {
      console.error(
        'An error occurred during the article fetching process:',
        err.message,
      );
    }

    return this.graphqlService.fetchArticles();
  }
  @authenticate('jwt')
  @post('/article')
  @response(200, ARTICLE_RESPONSE)
  async postArticle(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            // required: ['title', 'description'],
            properties: {
              title: {type: 'string'},
              description: {type: 'string'},
            },
          },
        },
      },
    })
    articleData: {
      title: string;
      description: string;
    },
  ): Promise<any> {
    let newArticle = {};

    try {
      // await this.gitHubService.initializeRepository();

      if (articleData.title && articleData.description) {
        newArticle = await this.graphqlService.createNewArticle(
          articleData.title,
          articleData.description,
        );
      }

      await this.gitHubService.cleanPostFolder();
      await this.hugoContentService.generateContent();
      // await this.gitHubService.commitAndPushChanges(
      //   `Updated content from generateContent ${Math.floor(Math.random() * 100011)}`,
      // );
    } catch (err) {
      console.error(
        'An error occurred during the article posting process:',
        err.message,
      );
    }

    return newArticle;
  }

  @authenticate('jwt')
  @post('/update_github')
  @response(200, ARTICLE_RESPONSE)
  async updateGithub(@requestBody() body: any): Promise<any> {
    //  // Clear any existing timer
    // console.log('body', body);
    let newArticle = {};

    try {
      // await this.gitHubService.initializeRepository();

      await this.gitHubService.cleanPostFolder();
      await this.hugoContentService.generateContent();
      // await this.gitHubService.commitAndPushChanges(
      //   `Updated content from generateContent ${Math.floor(Math.random() * 100011)}`,
      // );
    } catch (err) {
      console.error(
        'An error occurred during the article posting process:',
        err.message,
      );
    }
    return newArticle;
  }
}
