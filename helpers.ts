import * as coda from "@codahq/packs-sdk";
import * as types from "types/pack-types";
import GPhotos from "./api";

export const ApiUrl = "https://photoslibrary.googleapis.com/v1";

export async function getConnectionName(context: coda.ExecutionContext) {
  let request: coda.FetchRequest = {
    method: "GET",
    url: "https://www.googleapis.com/oauth2/v1/userinfo",
    headers: {
      "Content-Type": "application/json",
    },
  };
  let userResponse = await context.fetcher.fetch(request);
  let user = userResponse.body;
  return user.name as string;
}

// Parse the response from the API to the format we want to return
// Matches the MediaSchema schema defined in ./schemas.ts
function mediaItemsParser(mediaItems: types.MediaItemResponse[]): types.MediaItem[] {
  return mediaItems.map((mediaItem) => {
    let { id, filename, mimeType, description, productUrl } = mediaItem;
    let { creationTime, photo, video, width, height } = mediaItem.mediaMetadata;
    return {
      mediaId: id,
      filename,
      mediaType: (photo) ? "Photo" : "Video",
      mimeType,
      description,
      creationTime,
      mediaMetadata: { photo, video },
      width,
      height,
      image: `${mediaItem.baseUrl}=w2048-h1024`,
      url: productUrl,
    }
  });
}

export async function SyncMediaItems(
  context: coda.SyncExecutionContext,
  filters?: types.MediaItemsFilter,
): Promise<coda.GenericSyncFormulaResult> {
  if (!filters) {
    throw new coda.UserVisibleError("You must provide a filter to sync media items");
  }
  let { continuation } = context.sync;
  let body: types.GetMediaItemsPayload = { pageSize: 100 };
  if (continuation) {
    body.pageToken = continuation.nextPageToken as string;
  }
  if (filters) {
    body.filters = filters;
  }
  let response = await context.fetcher.fetch({
    method: "POST",
    url: `${ApiUrl}/mediaItems:search`,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  let nextPageToken;
  if (response.body.nextPageToken) {
    nextPageToken = response.body.nextPageToken;
  }

  let result: types.MediaItem[] = [];
  if (response.body.mediaItems) {
    result = mediaItemsParser(response.body.mediaItems);
  }

  return {
    result,
    continuation: nextPageToken ? { nextPageToken } : undefined,
  };
}

async function getMediaItems(
  context: coda.ExecutionContext,
  albumId: string,
  continuation?: coda.Continuation | undefined,
): Promise<any> {
  let body: types.GetMediaItemsPayload = {
    albumId,
    pageSize: 100,
  }
  if (continuation) {
    body.pageToken = continuation.nextMediaItemsPageToken as string;
  }
  let response = await context.fetcher.fetch({
    method: "POST",
    url: `${ApiUrl}/mediaItems:search`,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  let nextMediaItemsPageToken;
  if (response.body.nextPageToken) {
    nextMediaItemsPageToken = response.body.nextPageToken;
  }
  return {
    result: response.body?.mediaItems ? mediaItemsParser(response.body.mediaItems) : undefined,
    continuation: nextMediaItemsPageToken ? { nextMediaItemsPageToken } : undefined,
  };
}

// Parse the response from the API to the format we want to return
// Matches the AlbumSchema schema defined in ./schemas.ts
function albumParser(albums: types.AlbumResponse[]): types.Album[] {
  return albums.map((album) => {
    let { id, title, productUrl, coverPhotoBaseUrl, coverPhotoMediaItemId } = album;
    return {
      albumId: id,
      title,
      url: productUrl,
      mediaItems: [],
      coverPhoto: `${coverPhotoBaseUrl}=w2048-h1024`,
      coverPhotoMediaItem: coverPhotoMediaItemId,
    }
  });
}

export async function syncAlbums(
  context: coda.SyncExecutionContext,
): Promise<coda.GenericSyncFormulaResult> {
  let url = `${ApiUrl}/albums`;
  let { continuation } = context.sync;
  if (continuation && continuation.nextAlbumsPageToken) {
    url = coda.withQueryParams(url, { pageToken: continuation.nextAlbumsPageToken });
  }
  let response = await context.fetcher.fetch({
    method: "GET",
    url,
    headers: { "Content-Type": "application/json" },
  });
  let nextAlbumsPageToken;
  if (response.body.nextPageToken) {
    nextAlbumsPageToken = response.body.nextPageToken;
  }
  let albums: types.Album[] = [];
  if (response.body.albums) {
    let albumsRes = response.body.albums as types.AlbumResponse[];
    albums = albumParser(albumsRes);
    albums.forEach(async (album) => {
      do {
        let mediaItemsRes = await getMediaItems(context, album.albumId, continuation);
        ({ continuation } = mediaItemsRes);
        album.mediaItems = mediaItemsRes.result;
      } while (continuation && continuation.nextMediaItemsPageToken);
    });
  }

  return {
    result: albums,
    continuation: nextAlbumsPageToken ? { nextAlbumsPageToken } : undefined,
  };
}
