import * as coda from "@codahq/packs-sdk";
import * as helpers from "./helpers";
import { MediasContentCategoriesList } from "./helpers";

export const MediaDateRangeParam = coda.makeParameter({
  type: coda.ParameterType.DateArray,
  name: "dateRange",
  description: "The date range over which data should be fetched.",
  suggestedValue: coda.PrecannedDateRange.LastWeek,
});

export const MediaTypeParam = coda.makeParameter({
  type: coda.ParameterType.String,
  name: "mediaType",
  description: "The type of media to fetch.",
  autocomplete: ["Photo", "Video"],
  optional: true,
});

export const MediaCategoriesParam = coda.makeParameter({
  type: coda.ParameterType.StringArray,
  name: "categories",
  description: "Filter by medias categories.",
  optional: true,
  autocomplete: Object.keys(MediasContentCategoriesList)
});

export const MediaFavoritesParam = coda.makeParameter({
  type: coda.ParameterType.Boolean,
  name: "favorite",
  description: "Filter by favorites medias.",
  optional: true,
});

