import { MediaTypes, MediaItemsFilter } from 'types/api-types';

export class MediaTypeFilter {
  public mediaTypes: MediaTypes[];

  constructor(type = MediaTypes.All) {
    this.mediaTypes = [type];
  }

  setType(type: MediaTypes) {
    this.mediaTypes = [type];
  }

  toJSON(): MediaItemsFilter['mediaTypeFilter'] {
    return {
      mediaTypes: this.mediaTypes
    }
  }
}
