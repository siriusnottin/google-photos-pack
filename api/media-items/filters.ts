import { DateFilter } from "../common/date-filter";
import { MediaTypeFilter } from "./media-type-filter";
import { ContentFilter } from "./content-filter";
import { MediaItemsFilter } from "types/api-types";

export class Filters {
  public dateFilter: DateFilter;
  public mediaTypeFilter: MediaTypeFilter;
  public contentFilter: ContentFilter;

  constructor(public includeArchivedMedia = false) { }

  setDateFilter(dateFilter: DateFilter) {
    this.dateFilter = dateFilter;
  }

  setMediaTypeFilter(mediaTypeFilter: MediaTypeFilter) {
    this.mediaTypeFilter = mediaTypeFilter;
  }

  setContentFilter(contentFilter: ContentFilter) {
    this.contentFilter = contentFilter;
  }

  setIncludeArchivedMedia(includeArchivedMedia: boolean) {
    this.includeArchivedMedia = includeArchivedMedia;
  }

  toJSON(): MediaItemsFilter {
    return {
      dateFilter: this.dateFilter,
      mediaTypeFilter: this.mediaTypeFilter,
      contentFilter: this.contentFilter,
      includeArchivedMedia: this.includeArchivedMedia,
    }
  }
}
