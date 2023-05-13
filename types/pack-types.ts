import { ShareInfo } from "./api-types";
// Pack types

export interface MediaItemId {
  mediaId: string,
}

export interface MediaItem extends MediaItemId {
  filename: string;
  mediaType: string;
  mimeType: string;
  description: string;
  creationTime: string;
  width: number;
  height: number;
  image: string;
  url: string;
}

export interface MediaItemReference extends MediaItemId {
  filename: "Not found";
}

export interface Album {
  albumId: string;
  title: string;
  url: string;
  shareInfo?: ShareInfo;
  mediaItems: MediaItemReference[] | undefined;
  coverPhoto: string;
  coverPhotoMediaItem: MediaItemReference | undefined;
}
