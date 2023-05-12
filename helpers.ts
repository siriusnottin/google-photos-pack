import * as coda from "@codahq/packs-sdk";
import * as types from "types/common-types";
import GPhotos from "./api";

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
export function mediaItemsParser(mediaItems: types.MediaItemResponse[]): types.MediaItem[] {
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

export async function getMediaItemsFromAlbum(albumId: string, context: coda.ExecutionContext, pageSize = 100) {
  const photos = new GPhotos(context);
  let mediaItems: types.Album['mediaItems'] = [];
  let nextPageToken: string | undefined;
  do {
    const response = await photos.mediaItems.search(albumId, 'mediaItems(id),nextPageToken', pageSize, nextPageToken)
    const mediaItemsRes = response.body?.mediaItems as types.MediaItemIdRes[];
    if (mediaItemsRes) {
      mediaItems = mediaItems.concat(mediaItemsRes.map((mediaItem) => {
        return { mediaId: mediaItem.id, filename: "Not found" }
      }));
    }
    nextPageToken = response.body?.nextPageToken as string | undefined;
  } while (nextPageToken);
  return { mediaItems };
}

// Parse the response from the API to the format we want to return
// Matches the AlbumSchema schema defined in ./schemas.ts
export function albumParser(albums: types.AlbumResponse[]): types.Album[] {
  return albums.map((album) => {
    let { id, title, productUrl, coverPhotoBaseUrl, coverPhotoMediaItemId } = album;
    let coverPhotoMediaItem: types.Album['coverPhotoMediaItem'] = undefined;
    if (coverPhotoMediaItemId) {
      coverPhotoMediaItem = {
        filename: "Not found",
        mediaId: coverPhotoMediaItemId,
      }
    }
    return {
      albumId: id,
      title,
      url: productUrl,
      mediaItems: [],
      coverPhoto: `${coverPhotoBaseUrl}=w2048-h1024`,
      coverPhotoMediaItem,
    }
  });
}
