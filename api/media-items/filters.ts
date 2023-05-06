import { DateFilter } from "api/common/date-filter";
import { MediaTypeFilter } from "./media-type-filter";
import { ContentFilter } from "./content-filter";
import { MediaItemsFilter } from "types/api-types";

export class Filters {
  public dateFilter: DateFilter;
  public mediaTypeFilter: MediaTypeFilter;
  public contentFilter: ContentFilter;

  constructor(public includeArchiveMedia = false) { }

  setDateFilter(dateFilter: DateFilter) {
    this.dateFilter = dateFilter;
  }

  setMediaTypeFilter(mediaTypeFilter: MediaTypeFilter) {
    this.mediaTypeFilter = mediaTypeFilter;
  }

  setContentFilter(contentFilter: ContentFilter) {
    this.contentFilter = contentFilter;
  }

  setIncludeArchiveMedia(includeArchiveMedia: boolean) {
    this.includeArchiveMedia = includeArchiveMedia;
  }

  toJSON(): MediaItemsFilter {
    return {
      dateFilter: this.dateFilter,
      mediaTypeFilter: this.mediaTypeFilter,
      contentFilter: this.contentFilter,
      includeArchiveMedia: this.includeArchiveMedia,
    }
  }
}
