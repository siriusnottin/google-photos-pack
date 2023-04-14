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
  description: "Filter by photos categories.",
  optional: true,
  autocomplete: Object.keys(MediasContentCategoriesList)
});

const MediaFavoritesParam = coda.makeParameter({
  type: coda.ParameterType.Boolean,
  name: "favorite",
  description: "Filter by favorites photos.",
  optional: true,
});

pack.addSyncTable({
  name: "Photos",
  schema: MediaSchema,
  identityName: "Photo",
  formula: {
    name: "SyncPhotos",
    description: "Sync all photos from the user's library.",
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

const MediaReferenceSchema = coda.makeReferenceSchemaFromObjectSchema(MediaSchema, "Photo");

const AlbumSchema = coda.makeObjectSchema({
  properties: {
    albumId: {
      type: coda.ValueType.String,
      fromKey: "id",
    },
    title: { type: coda.ValueType.String },
    photos: {
      type: coda.ValueType.Array,
      items: MediaReferenceSchema
    },
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
      let baseUrl = `${ApiBaseUrl}/albums`;
      if (context.sync.continuation) {
        baseUrl = coda.withQueryParams(baseUrl, { pageToken: context.sync.continuation.albumsToken })
      };
      const response = await context.fetcher.fetch({
        method: "GET",
        url: baseUrl,
      });

      let continuation;
      if (response.body.nextPageToken) {
        continuation = {
          albumsToken: response.body.nextPageToken,
          AlbumItemsToken: undefined,
        };
      };

      const albums = await response.body.albums;
      for (const album of albums) {
        // we want to search for all medias in the current album.
        let baseUrl = coda.withQueryParams(`${ApiBaseUrl}/mediaItems:search`, { pageSize: 5 });
        if (context.sync.continuation) {
          baseUrl = coda.withQueryParams(baseUrl, { pageToken: context.sync.continuation.AlbumItemsToken })
        };
        debugger;
        const body = { albumId: album.id };
        const mediaItemsInAlbum = await context.fetcher.fetch({
          method: "POST",
          url: baseUrl,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        });
        if (mediaItemsInAlbum.body.nextPageToken) {
          continuation.AlbumItemsToken = mediaItemsInAlbum.body.nextPageToken;
        };
        album.photos = [];
        album.coverPhoto = album.coverPhotoBaseUrl + "=w2048-h1024"
      }
      return {
        result: albums,
        continuation: continuation,
      };
    }
  }
});
