import * as coda from "@codahq/packs-sdk";
import * as types from "types/api-types";

export const MediaDateRange = coda.makeParameter({
  type: coda.ParameterType.DateArray,
  name: "dateRange",
  description: "The date range over which data should be fetched.",
  suggestedValue: coda.PrecannedDateRange.LastWeek,
});

export const MediaCategoriesIncludeOpt = coda.makeParameter({
  type: coda.ParameterType.StringArray,
  name: "categoriesToInclude",
  description: "Filter by categories to include.",
  optional: true,
  autocomplete: Object.keys(types.MediasContentCategories)
});

export const MediaCategoriesExcludeOpt = coda.makeParameter({
  type: coda.ParameterType.StringArray,
  name: "categoriesToExclude",
  description: "Filter by categories to exclude.",
  optional: true,
  autocomplete: Object.keys(types.MediasContentCategories)
});

export const MediaTypeOptional = coda.makeParameter({
  type: coda.ParameterType.String,
  name: "mediaType",
  description: "The type of media to fetch.",
  autocomplete: Object.keys(types.MediaTypes),
  optional: true,
});

export const MediaFavoritesOptional = coda.makeParameter({
  type: coda.ParameterType.Boolean,
  name: "favorite",
  description: "Filter by favorites medias.",
  optional: true,
});

export const MediaArchivedOptional = coda.makeParameter({
  type: coda.ParameterType.Boolean,
  name: "archived",
  description: "Include archived medias.",
  optional: true,
});

// export const AlbumParam = coda.makeParameter({
//   type: coda.ParameterType.String,
//   name: "album",
//   description: "The id of the album to list medias from.",
//   autocomplete: async function (context, search) {
//     let results: types.AlbumResponse[] = [];
//     let continuation: coda.Continuation | undefined;
//     do {
//       let response = await helpers.getAlbums(context, continuation);
//       results = results.concat(...response.result);
//       ({ continuation } = response);
//     } while (continuation && continuation.nextPageToken);
//     return coda.autocompleteSearchObjects(search, results, "title", "id");
//   }
// });
