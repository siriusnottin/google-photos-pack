import * as coda from "@codahq/packs-sdk";
import { Transport } from "./transport";
import { Albums } from "./albums";

const ApiUrl = "https://photoslibrary.googleapis.com/v1";

export default class GPhotos {

  public readonly transport: Transport;
  public readonly albums: Albums;
  public readonly mediaItems: MediaItems;

  constructor(private readonly context: coda.ExecutionContext) {
    this.transport = new Transport(context);
    this.albums = new Albums(this.transport);
    this.mediaItems = new MediaItems(this.transport);
  }

}
