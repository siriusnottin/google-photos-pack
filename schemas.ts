import * as coda from "@codahq/packs-sdk";

export const MediaSchema = coda.makeObjectSchema({
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
      codaType: coda.ValueHintType.ImageAttachment,
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

export const MediaReferenceSchema = coda.makeReferenceSchemaFromObjectSchema(MediaSchema, "Media");

export const AlbumSchema = coda.makeObjectSchema({
  properties: {
    albumId: {
      type: coda.ValueType.String,
      fromKey: "id",
    },
    title: { type: coda.ValueType.String },
    medias: {
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
      codaType: coda.ValueHintType.ImageAttachment,
    },
  },
  displayProperty: "title",
  idProperty: "albumId",
  featuredProperties: [
    "coverPhoto"
  ]
});
