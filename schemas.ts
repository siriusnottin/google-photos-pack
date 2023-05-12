import * as coda from "@codahq/packs-sdk";

const MediaPhotoMetadata = coda.makeObjectSchema({
  properties: {
    cameraMake: { type: coda.ValueType.String },
    cameraModel: { type: coda.ValueType.String },
    focalLength: { type: coda.ValueType.Number },
    apertureFNumber: { type: coda.ValueType.Number },
    isoEquivalent: { type: coda.ValueType.Number },
    exposureTime: { type: coda.ValueType.String },
  },
});

const MediaVideoMetadata = coda.makeObjectSchema({
  properties: {
    cameraMake: { type: coda.ValueType.String },
    cameraModel: { type: coda.ValueType.String },
    fps: { type: coda.ValueType.Number },
    status: { type: coda.ValueType.String },
  },
});

const MediaMetadataSchema = coda.makeObjectSchema({
  properties: {
    photo: MediaPhotoMetadata,
    video: MediaVideoMetadata,
  }
});

export const MediaSchema = coda.makeObjectSchema({
  properties: {
    mediaId: { type: coda.ValueType.String },
    filename: { type: coda.ValueType.String },
    mediaType: { type: coda.ValueType.String },
    mimeType: { type: coda.ValueType.String },
    description: { type: coda.ValueType.String },
    creationTime: {
      type: coda.ValueType.String,
      codaType: coda.ValueHintType.DateTime
    },
    mediaMetadata: MediaMetadataSchema,
    width: { type: coda.ValueType.Number },
    height: { type: coda.ValueType.Number },
    image: {
      type: coda.ValueType.String,
      codaType: coda.ValueHintType.ImageAttachment,
    },
    url: {
      type: coda.ValueType.String,
      description: "Google Photos URL for the media.",
      codaType: coda.ValueHintType.Url,
    },
  },
  displayProperty: "filename",
  idProperty: "mediaId",
  featuredProperties: [
    "image"
  ],
});

const MediaReferenceSchema = coda.makeObjectSchema({
  codaType: coda.ValueHintType.Reference,
  properties: {
    filename: { type: coda.ValueType.String, required: true },
    mediaId: { type: coda.ValueType.String, required: true },
  },
  displayProperty: "filename",
  idProperty: "mediaId",
  identity: {
    name: "Media",
  },
});

export const AlbumSchema = coda.makeObjectSchema({
  properties: {
    albumId: {
      type: coda.ValueType.String,
    },
    title: { type: coda.ValueType.String },
    url: {
      type: coda.ValueType.String,
      description: "Google Photos URL for the album.",
      codaType: coda.ValueHintType.Url,
    },
    mediaItems: {
      type: coda.ValueType.Array,
      items: MediaReferenceSchema
    },
    coverPhoto: {
      type: coda.ValueType.String,
      codaType: coda.ValueHintType.ImageAttachment,
    },
    coverPhotoMediaItem: MediaReferenceSchema,
  },
  displayProperty: "title",
  idProperty: "albumId",
  featuredProperties: [
    "coverPhoto"
  ]
});
