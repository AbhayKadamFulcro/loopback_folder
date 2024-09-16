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

  async removeLockFile(): Promise<void> {
    const lockFilePath = path.join(this.localFolder, '.git', 'index.lock');
    if (fs.existsSync(lockFilePath)) {
      await fs.remove(lockFilePath);
      console.log('Removed Git lock file:', lockFilePath);
    }
  }

  async initializeRepository(): Promise<void> {
    try {
      await this.removeLockFile();

      if (
        fs.existsSync(this.localFolder) &&
        fs.existsSync(path.join(this.localFolder, '.git'))
      ) {
        await this.git.pull('origin', process.env.GIT_BRANCH);
      } else {
        await this.git.clone(this.repoURL, this.localFolder);
        await this.git.checkout(`${process.env.GIT_BRANCH}`);
      }
    } catch (err) {
      console.error('Failed to initialize the repository:', err.message);
      throw err;
    }
  }

  // async cleanPostFolder(): Promise<void> {
  //   const postFolderPath = path.join(this.localFolder, 'content');
  //   if (fs.existsSync(postFolderPath)) {
  //     await fs.remove(postFolderPath);
  //     console.log('Deleted existing post folder:', postFolderPath);
  //   }
  // }

  async cleanPostFolder(): Promise<void> {
    const postFolderPath = path.join(this.localFolder, 'content');
    if (fs.existsSync(postFolderPath)) {
      // Read the contents of the folder
      const files = await fs.readdir(postFolderPath);
  
      // Process each file and folder
      for (const file of files) {
        const filePath = path.join(postFolderPath, file);
  
        // Skip the _index.md file
        if (file !== '_index.md') {
          const stats = await fs.stat(filePath);
  
          if (stats.isDirectory()) {
            // If it's a directory, remove it recursively
            await fs.remove(filePath);
          } else {
            // If it's a file, remove it
            await fs.remove(filePath);
          }
        }
      }
  
      console.log('Deleted non-_index.md files and folders in:', postFolderPath);
    }
  }

  async commitAndPushChanges(commitMessage: string): Promise<void> {
    try {
      await this.git.add(['--all', '.']);
      await this.git.commit(commitMessage);
      await this.git.push('origin', `${process.env.GIT_BRANCH}`);
      console.log('Successfully pushed changes to the main branch');
    } catch (err) {
      console.error('Failed to commit and push changes:', err.message);
      throw err;
    }
  }
}
