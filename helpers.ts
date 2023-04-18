import * as coda from "@codahq/packs-sdk";
import * as types from "./types";
import { allowedNodeEnvironmentFlags } from "process";

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

export async function SyncMediaItems(
  context: coda.SyncExecutionContext,
  filters?: types.MediaItemsFilter,
  albumId?: string,
): Promise<coda.GenericSyncFormulaResult> {
  if (filters && albumId || !filters && !albumId) {
    throw new coda.UserVisibleError("Must provide either filters or albumId");
  }
  let { continuation } = context.sync;
  let body: types.GetMediaItemsPayload = { pageSize: 100 };
  if (continuation) {
    body.pageToken = continuation.nextPageToken as string;
  }
  if (filters && !albumId) {
    body.filters = filters;
  }
  if (albumId && !filters) {
    body.albumId = albumId;
  }
  let response = await context.fetcher.fetch({
    method: "POST",
    url: `${ApiUrl}/mediaItems:search`,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  let mediaItemsRes = response.body.mediaItems as types.MediaItemResponse[];
  let nextPageToken;
  if (response.body.nextPageToken) {
    nextPageToken = response.body.nextPageToken;
  }
  let result: types.MediaItem[];

  if (!mediaItemsRes || mediaItemsRes.length === 0) {
    return {
      result: [],
      continuation: undefined,
    };
  }

  result = mediaItemsRes.map((mediaItem) => {
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

  return {
    result,
    continuation: nextPageToken ? { nextPageToken } : undefined,
  };
}

export async function syncAlbums(
  context: coda.SyncExecutionContext,
): Promise<coda.GenericSyncFormulaResult> {
  let url = `${ApiUrl}/albums`;
  let { continuation } = context.sync;
  if (continuation) {
    url = coda.withQueryParams(url, { pageToken: continuation.nextPageToken });
  }
  let response = await context.fetcher.fetch({
    method: "GET",
    url,
    headers: { "Content-Type": "application/json" },
  });
  let albumsRes = response.body.albums as types.AlbumResponse[];
  let nextPageToken;
  if (response.body.nextPageToken) {
    nextPageToken = response.body.nextPageToken;
  }
  let result: types.Album[];

  if (!albumsRes || albumsRes.length === 0) {
    return {
      result: [],
      continuation: undefined,
    };
  }

  result = albumsRes.map((album) => {
    let { id, title, productUrl, coverPhotoBaseUrl } = album;
    return {
      albumId: id,
      title,
      url: productUrl,
      mediaItems: [],
      coverPhoto: `${coverPhotoBaseUrl}=w2048-h1024`,
      coverPhotoMediaItem: undefined,
    }
  });

  return {
    result,
    continuation: nextPageToken ? { nextPageToken } : undefined,
  };
}
