import {injectable, BindingScope} from '@loopback/core';
import path from 'path';
import simpleGit, {SimpleGit} from 'simple-git';
import fs from 'fs-extra';
import dotenv from 'dotenv';

dotenv.config();

@injectable({scope: BindingScope.SINGLETON})
export class GitHubService {
  private git: SimpleGit;
  private localFolder: string;
  private repoURL: string;

  constructor() {
    this.repoURL = process.env.HUGO_GIT_REPO || '';
    this.localFolder = path.resolve(process.env.LOCALFOLDER_PATH || '');
    this.git = simpleGit(this.localFolder);
  }

  async initializeRepository(): Promise<void> {
    try {
      if (
        fs.existsSync(this.localFolder) &&
        fs.existsSync(path.join(this.localFolder, '.git'))
      ) {
        await this.git.pull('origin', 'main');
      } else {
        await this.git.clone(this.repoURL, this.localFolder);
        await this.git.checkout('main');
      }
    } catch (err) {
      console.error('Failed to initialize the repository:', err.message);
      throw err;
    }
  }

  async cleanPostFolder(): Promise<void> {
    const postFolderPath = path.join(this.localFolder, 'content', 'post');
    if (fs.existsSync(postFolderPath)) {
      await fs.remove(postFolderPath);
      console.log('Deleted existing post folder:', postFolderPath);
    }
  }

  async commitAndPushChanges(commitMessage: string): Promise<void> {
    try {
      await this.git.add(['--all', '.']);
      await this.git.commit(commitMessage);
      await this.git.push('origin', 'main');
      console.log('Successfully pushed changes to the main branch');
    } catch (err) {
      console.error('Failed to commit and push changes:', err.message);
      throw err;
    }
  }
}
