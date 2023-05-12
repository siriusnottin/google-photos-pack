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

export interface MediaItemIdRes {
  id: string,
};
export interface MediaItemResponse extends MediaItemIdRes {
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

export interface ShareInfo {
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

export type GPhotosDate = {
  year?: number;
  month?: number;
  day?: number;
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

export enum MediaFeature {
  None = "NONE",
  Favorites = "FAVORITES",
}

// filter object when "searching" for media items
export interface MediaItemsFilter {
  dateFilter?: {
    dates: GPhotosDate[];
    ranges: {
      startDate: GPhotosDate;
      endDate: GPhotosDate;
    }[];
  };
  contentFilter?: {
    includedContentCategories: string[], // TODO: find a way to make this an enum (MediasContentCategories)
    excludedContentCategories: string[],
  };
  mediaTypeFilter?: {
    mediaTypes: MediaTypes[],
  }
  featureFilter?: {
    includedFeatures: [MediaFeature],
  };
  includeArchivedMedia?: boolean;
  excludeNonAppCreatedData?: boolean;
}

export interface ApiResponse {
  mediaItems?: MediaItemResponse[] | MediaItemIdRes[];
  albums?: AlbumResponse[];
  sharedAlbums?: object[];
  nextPageToken?: string;
}

export enum MediaTypes {
  All = "ALL_MEDIA",
  Photo = "PHOTO",
  Video = "VIDEO",
}
