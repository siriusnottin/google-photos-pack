import * as coda from "@codahq/packs-sdk";
import * as helpers from "./helpers";
import * as params from "./params";
import * as schemas from "./schemas";

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
      params.MediaDateRangeParam,
      params.MediaCategoriesParam,
      params.MediaFavoritesParam
    ],
    execute: async function ([dateRange, categories, favorite], context) {
      let url = `${helpers.ApiUrl}/mediaItems:search`;

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

      interface RequestPayload {
        pageSize: number;
        filters: {
          dateFilter: {
            ranges: {
              startDate: {
                year: string;
                month: string;
                day: string;
              };
              endDate: {
                year: string;
                month: string;
                day: string;
              };
            }[];
          };
          featureFilter?: {
            includedFeatures: string[],
          };
          contentFilter?: {
            includedContentCategories: string[],
          };
        };
        pageToken?: undefined | string;
      };

      let payload: RequestPayload = {
        pageSize: 100,
        filters: {
          dateFilter: {
            ranges: [{
              "startDate": formatDate(dateRange[0], dateFormatter),
              "endDate": formatDate(dateRange[1], dateFormatter),
            }]
          },
          featureFilter: (favorite) ? { includedFeatures: ["FAVORITES"] } : undefined,
          contentFilter: (categories) ? { includedContentCategories: categories.map(category => (helpers.MediasContentCategoriesList[category])) } : undefined,
        },
        pageToken: (context.sync.continuation?.nextPageToken) ? context.sync.continuation.nextPageToken : undefined,
      }
      let response = await context.fetcher.fetch({
        method: "POST",
        url: url,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      let items = response.body.mediaItems;
      if (items && items.length > 0) {
        for (let item of items) {
          // the api returns item.mediaMetadata.photo and item.mediaMetadata.video, we want to have a single mediaType property.
          item.mediaType = (item.mediaMetadata.photo) ? "Photo" : "Video";
          item.creationTime = item.mediaMetadata.creationTime
          item.width = item.mediaMetadata.width
          item.height = item.mediaMetadata.height
          item.image = item.baseUrl + "=w2048-h1024"
        };
      };
      let continuation;
      if (response.body.nextPageToken) {
        continuation = {
          nextPageToken: response.body.nextPageToken
        };
      }
      return {
        result: items,
        continuation: continuation,
      };
    }
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
      let url = `${helpers.ApiUrl}/albums`;

      if (context.sync.continuation) {
        url = coda.withQueryParams(url, { pageToken: context.sync.continuation })
      };

      const AlbumsResponse = await context.fetcher.fetch({
        method: "GET",
        url,
      });

      let albumsContinuation;
      if (AlbumsResponse.body.nextPageToken) {
        albumsContinuation = AlbumsResponse.body.nextPageToken
      };

      const Albums = await AlbumsResponse.body.albums;
      for (const album of Albums) {
        // we want to search for all medias in the current album.
        // let url = coda.withQueryParams(`${helpers.ApiUrl}/mediaItems:search`, { pageSize: 5 });
        // let body = { albumId: album.id };
        // let mediaItemsInAlbum = [];
        // let mediaItemsNextPageToken;

        // const mediaItemsInAlbumResponse = await context.fetcher.fetch({
        //   method: "POST",
        //   url,
        //   headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify(body)
        // });
        // if (mediaItemsInAlbumResponse.body.nextPageToken) {
        //   continuation.AlbumMediaItemsNextPageToken = mediaItemsInAlbumResponse.body.nextPageToken;
        // };
        album.medias = [];
        album.coverPhoto = album.coverPhotoBaseUrl + "=w2048-h1024"
      }
      return {
        result: Albums,
        continuation: albumsContinuation,
      };
    }
  }
});
