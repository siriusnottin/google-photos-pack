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

export type GDate = {
  year: string;
  month: string;
  day: string;
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

// filter object when "searching" for media items
export interface MediaItemsFilter {
  dateFilter?: {
    ranges: {
      startDate: GDate;
      endDate: GDate;
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

export interface ApiResponse {
  mediaItems?: MediaItemResponse[];
  albums?: AlbumResponse[];
  sharedAlbums?: object[];
  nextPageToken?: string;
}

export enum MediaTypes {
  Photo = "PHOTO",
  Video = "VIDEO",
}
