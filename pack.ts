import * as coda from "@codahq/packs-sdk";
import * as helpers from "./helpers";
import * as schemas from "./schemas";
import * as types from "./types/api-types";
import * as params from "./params";
import GPhotos from "./api";

export const pack = coda.newPack();

pack.addNetworkDomain("googleapis.com");

pack.setUserAuthentication({
  type: coda.AuthenticationType.OAuth2,
  authorizationUrl: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenUrl: "https://oauth2.googleapis.com/token",
  scopes: [
    "profile",
    "https://www.googleapis.com/auth/photoslibrary.readonly",
  ],
  additionalParams: {
    access_type: "offline",
    prompt: "consent",
  },
  getConnectionName: helpers.getConnectionName,
});

pack.addSyncTable({
  name: "Medias",
  schema: schemas.MediaSchema,
  identityName: "Media",
  formula: {
    name: "SyncMedias",
    description: "Sync medias from the user's library.",
    parameters: [
      params.MediaDateRange,
      params.MediaCategoriesIncludeOpt,
      params.MediaCategoriesExcludeOpt,
      params.MediaTypeOptional,
      params.MediaFavoritesOptional,
      params.MediaArchivedOptional,
    ],
    execute: async function ([dateRange, categoriesToInclude, categoriesToExclude, mediaType, favorite, archived], context) {
      let photos = new GPhotos(context);

      // Date filter
      const filters = new photos.Filters(archived);
      const dateFilter = new photos.DateFilter();
      if (!dateRange) {
        throw new coda.UserVisibleError("Date range is required.");
      }
      dateFilter.addRange(dateRange[0], dateRange[1]);
      filters.setDateFilter(dateFilter);

      // Content filter
      const contentFilter = new photos.ContentFilter();
      switch (categoriesToInclude || categoriesToExclude) {
        case categoriesToInclude:
          categoriesToInclude?.forEach((category) => {
            contentFilter.addIncludedCategory(category as types.MediasContentCategories);
          });
          break;
        case categoriesToExclude:
          categoriesToExclude?.forEach((category) => {
            contentFilter.addExcludedCategory(category as types.MediasContentCategories);
          });
          break;
      }
      filters.setContentFilter(contentFilter);

      // Media type filter
      const mediaTypeFilter = new photos.MediaTypeFilter(mediaType as types.MediaTypes);
      filters.setMediaTypeFilter(mediaTypeFilter);

      const { nextPageToken, mediaItems }: { nextPageToken?: string, mediaItems?: types.MediaItemResponse[] } = (await photos.mediaItems.search(filters, 100, (context.sync.continuation?.nextPageToken as string | undefined)))?.body ?? {};

      return {
        result: mediaItems ? helpers.mediaItemsParser(mediaItems) : null,
        continuation: { nextPageToken }
      }
    },
  },
});

pack.addSyncTable({
  name: "Albums",
  schema: schemas.AlbumSchema,
  identityName: "Album",
  formula: {
    name: "SyncAlbums",
    description: "Sync all albums.",
    parameters: [],
    execute: async function ([], context) {
      return helpers.syncAlbums(context);
    }
  }
});
