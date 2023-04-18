// Types for the Google Photos API responses.

interface Photo {
  cameraMake: string;
  cameraModel: string;
  focalLength: number;
  apertureFNumber: number;
  isoEquivalent: number;
  exposureTime: string;
}

enum VideoProcessingStatus {
  PROCESSING = "Processing",
  READY = "ready",
  FAILED = "Failed",
}

interface Video {
  cameraMake: string;
  cameraModel: string;
  fps: number;
  status: VideoProcessingStatus;
}

interface MediaMetadata {
  creationTime: string;
  width: number;
  height: number;

  photo?: Photo;
  video?: Video;
}

interface ContributorInfo {
  profilePictureBaseUrl: string;
  displayName: string;
}

export interface MediaItemResponse {
  id: string;
  description: string;
  productUrl: string;
  baseUrl: string;
  mimeType: string;
  mediaMetadata: MediaMetadata;
  contributorInfo?: ContributorInfo;
  filename: string;
}

interface SharedAlbumOptions {
  isCollaborative: boolean;
  isCommentable: boolean;
}

interface ShareInfo {
  sharedAlbumOptions: SharedAlbumOptions;
  shareableUrl?: string;
  shareToken: string;
  isJoined: boolean;
  isOwned: boolean;
  isJoinable: boolean;
}

export interface AlbumResponse {
  id: string;
  title: string;
  productUrl: string;
  isWriteable: boolean;
  shareInfo?: ShareInfo;
  mediaItemsCount: string;
  coverPhotoBaseUrl: string;
  coverPhotoMediaItemId: string;
}

// 
// Pack types

export interface MediaItem {
  mediaId: string;
  filename: string;
  mediaType: string;
  mimeType: string;
  description: string;
  photoMetadata?: Photo;
  videoMetadata?: Video;
  creationTime: string;
  width: number;
  height: number;
  image: string;
  url: string;
}

export interface Album {
  albumId: string;
  title: string;
  url: string;
  mediaItems: MediaItem[];
  coverPhoto: string;
  coverPhotoMediaItem: string | undefined;
}

export enum MediasContentCategories {
  Animals = "ANIMALS",
  Arts = "ARTS",
  Birthdays = "BIRTHDAYS",
  Cityscapes = "CITYSCAPES",
  Crafts = "CRAFTS",
  Documents = "DOCUMENTS",
  Fashion = "FASHION",
  Flowers = "FLOWERS",
  Food = "FOOD",
  Gardens = "GARDENS",
  Holidays = "HOLIDAYS",
  Houses = "HOUSES",
  Landmarks = "LANDMARKS",
  Landscapes = "LANDSCAPES",
  Night = "NIGHT",
  People = "PEOPLE",
  Performances = "PERFORMANCES",
  Pets = "PETS",
  Receipts = "RECEIPTS",
  Screenshots = "SCREENSHOTS",
  Selfies = "SELFIES",
  Sport = "SPORT",
  Travel = "TRAVEL",
  Utility = "UTILITY",
  Weddings = "WEDDINGS",
  Whiteboards = "WHITEBOARDS",
}

export enum MediaTypes {
  Photo = "PHOTO",
  Video = "VIDEO",
}

// filter object when "searching" for media items
export interface MediaItemsFilter {
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
  contentFilter?: {
    includedContentCategories: string[], // TODO: find a way to make this an enum (MediasContentCategories)
    excludedContentCategories: string[],
  };
  mediaTypeFilter?: {
    mediaTypes: [string]
  }
  featureFilter?: {
    includedFeatures: ["NONE" | "FAVORITES"],
  };
  includeArchivedMedia?: boolean;
  excludeNonAppCreatedData?: boolean;
}

export interface GetMediaItemsPayload {
  albumId?: string;
  pageSize?: number;
  pageToken?: string;
  filters?: MediaItemsFilter;
}
