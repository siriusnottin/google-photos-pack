import * as coda from "@codahq/packs-sdk";

import { Transport } from "./transport";

import { Albums } from "./albums";
import { MediaItems } from "./media-items";

import { DateFilter } from "./common/date-filter";
import { MediaTypeFilter } from "./media-items/media-type-filter";
import { FeatureFilter } from "./media-items/feature-filter"
import { ContentFilter } from "./media-items/content-filter";
import { Filters } from "./media-items/filters";
export default class GPhotos {

  public readonly transport: Transport;

  public readonly albums: Albums;
  public readonly mediaItems: MediaItems;

  public readonly DateFilter = DateFilter;
  public readonly MediaTypeFilter = MediaTypeFilter;
  public readonly FeatureFilter = FeatureFilter;
  public readonly ContentFilter = ContentFilter;
  public readonly Filters = Filters;

  constructor(public readonly context: coda.ExecutionContext) {
    this.transport = new Transport(context);
    this.albums = new Albums(this.transport);
    this.mediaItems = new MediaItems(this.transport);
  }

}
