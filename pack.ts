import * as coda from "@codahq/packs-sdk";
import * as helpers from "./helpers";
import * as schemas from "./schemas";
import * as types from "./types/pack-types";
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
      function formatDate(date: Date, dateFormatter: Intl.DateTimeFormat) {
        const dateParts = dateFormatter.formatToParts(date);
        return {
          year: dateParts.find((part) => part.type === "year").value,
          month: dateParts.find((part) => part.type === "month").value,
          day: dateParts.find((part) => part.type === "day").value,
        };
      }
      const dateFormatter = new Intl.DateTimeFormat("en", {
        timeZone: context.timezone, // Use the doc's timezone (important!)
        year: "numeric",
        month: "numeric",
        day: "numeric",
      });

      let filters: types.MediaItemsFilter = {
        dateFilter: {
          ranges: [{
            "startDate": formatDate(dateRange[0], dateFormatter),
            "endDate": formatDate(dateRange[1], dateFormatter),
          }]
        },
      };

      if (categoriesToInclude || categoriesToExclude) {
        filters.contentFilter = {
          includedContentCategories: (categoriesToInclude) ? categoriesToInclude.map((category) => types.MediasContentCategories[category]) : undefined,
          excludedContentCategories: (categoriesToExclude) ? categoriesToExclude.map((category) => types.MediasContentCategories[category]) : undefined,
        };
      }

      if (mediaType) {
        filters.mediaTypeFilter = { mediaTypes: [types.MediaTypes[mediaType]] };
      }

      if (favorite) {
        filters.featureFilter = { includedFeatures: ["FAVORITES"] }
      }

      if (archived) { filters.includeArchivedMedia = archived }

      return helpers.SyncMediaItems(context, filters);

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
