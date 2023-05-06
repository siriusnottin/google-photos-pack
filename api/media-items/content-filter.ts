import { MediasContentCategories } from './api-types';

export class ContentFilter {

  public includedContentCategories: MediasContentCategories[] = []
  public excludedContentCategories: MediasContentCategories[] = []

  addIncludedCategory(category: MediasContentCategories) {
    this.includedContentCategories.push(category);
  }

  addExcludedCategory(category: MediasContentCategories) {
    this.excludedContentCategories.push(category);
  }

  toJSON() {
    return {
      includedContentCategories: this.includedContentCategories,
      excludedContentCategories: this.excludedContentCategories,
    }
  }
}
