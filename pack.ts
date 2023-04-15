import * as coda from "@codahq/packs-sdk";
export const pack = coda.newPack();

const ApiBaseUrl = "https://photoslibrary.googleapis.com/v1";

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

  // Determines the display name of the connected account.
  getConnectionName: async function (context) {
    let response = await context.fetcher.fetch({
      method: "GET",
      url: "https://www.googleapis.com/oauth2/v1/userinfo",
    });
    let user = response.body;
    return user.name;
  },
});

const MediaSchema = coda.makeObjectSchema({
  properties: {
    mediaId: {
      type: coda.ValueType.String,
      fromKey: "id",
      required: true
    },
    filename: { type: coda.ValueType.String, required: true },
    description: { type: coda.ValueType.String },
    creationTime: {
      type: coda.ValueType.String,
      codaType: coda.ValueHintType.DateTime
    },
    width: { type: coda.ValueType.Number },
    height: { type: coda.ValueType.Number },
    image: {
      type: coda.ValueType.String,
      codaType: coda.ValueHintType.ImageReference,
    },
    url: {
      type: coda.ValueType.String,
      description: "Google Photos URL for the media.",
      codaType: coda.ValueHintType.Url,
      fromKey: "productUrl",
    },
  },
  displayProperty: "filename",
  idProperty: "mediaId",
  featuredProperties: [
    "image"
  ],
});

const MediaDateRangeParam = coda.makeParameter({
  type: coda.ParameterType.DateArray,
  name: "dateRange",
  description: "The date range over which data should be fetched.",
  suggestedValue: coda.PrecannedDateRange.LastWeek,
});

const MediasContentCategoriesList = {
  Animals: "ANIMALS",
  Fashion: "FASHION",
  Landmarks: "LANDMARKS",
  Receipts: "RECEIPTS",
  Weddings: "WEDDINGS",
  Arts: "ARTS",
  Flowers: "FLOWERS",
  Landscapes: "LANDSCAPES",
  Screenshots: "SCREENSHOTS",
  Whiteboards: "WHITEBOARDS",
  Birthdays: "BIRTHDAYS",
  Food: "FOOD",
  Night: "NIGHT",
  Selfies: "SELFIES",
  Cityscapes: "CITYSCAPES",
  Gardens: "GARDENS",
  People: "PEOPLE",
  Sport: "SPORT",
  Crafts: "CRAFTS",
  Holidays: "HOLIDAYS",
  Performances: "PERFORMANCES",
  Travel: "TRAVEL",
  Documents: "DOCUMENTS",
  Houses: "HOUSES",
  Pets: "PETS",
  Utility: "UTILITY"
}

const MediaCategoriesParam = coda.makeParameter({
  type: coda.ParameterType.StringArray,
  name: "categories",
  description: "Filter by medias categories.",
  optional: true,
  autocomplete: Object.keys(MediasContentCategoriesList)
});

const MediaFavoritesParam = coda.makeParameter({
  type: coda.ParameterType.Boolean,
  name: "favorite",
  description: "Filter by favorites medias.",
  optional: true,
});

pack.addSyncTable({
  name: "Medias",
  schema: MediaSchema,
  identityName: "Media",
  formula: {
    name: "SyncMedias",
    description: "Sync medias from the user's library.",
    parameters: [MediaDateRangeParam, MediaCategoriesParam, MediaFavoritesParam],
    execute: async function ([dateRange, categories, favorite], context) {
      let url = `${ApiBaseUrl}/mediaItems:search`;

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
        pageToken?: string;
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
          contentFilter: (categories) ? { includedContentCategories: categories.map(category => (MediasContentCategoriesList[category])) } : undefined,
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

const MediaReferenceSchema = coda.makeReferenceSchemaFromObjectSchema(MediaSchema, "Media");

const AlbumSchema = coda.makeObjectSchema({
  properties: {
    albumId: {
      type: coda.ValueType.String,
      fromKey: "id",
    },
    title: { type: coda.ValueType.String },
    // medias: {
    //   type: coda.ValueType.Array,
    //   items: MediaReferenceSchema
    // },
    url: {
      type: coda.ValueType.String,
      description: "Google Photos URL for the album.",
      codaType: coda.ValueHintType.Url,
      fromKey: "productUrl",
    },
    coverPhoto: {
      type: coda.ValueType.String,
      codaType: coda.ValueHintType.ImageReference,
    },
  },
  displayProperty: "title",
  idProperty: "albumId",
  featuredProperties: [
    "coverPhoto"
  ]
});

pack.addSyncTable({
  name: "Albums",
  schema: AlbumSchema,
  identityName: "Album",
  formula: {
    name: "SyncAlbums",
    description: "Sync all albums.",
    parameters: [],
    execute: async function ([], context) {
      let url = `${ApiBaseUrl}/albums`;

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
        // let url = coda.withQueryParams(`${ApiBaseUrl}/mediaItems:search`, { pageSize: 5 });
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
