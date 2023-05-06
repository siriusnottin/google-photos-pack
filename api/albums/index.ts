import { Transport } from "api/transport";

export class Albums {
  constructor(public transport: Transport) { }

  list(pageSize = 50, pageToken?: string) { // range: 20-50
    return this.transport.get("albums", { pageSize, pageToken });
  }

  get(albumId: string) {
    return this.transport.get(`albums/${albumId}`);
  }

  create(title: string, description?: string) {
  }

  share(albumId: string) {
  }

  unshare(albumId: string) {
  }

  addMediaItems(albumId: string, mediaItemIds: string[]) {
  }

  removeMediaItems(albumId: string, mediaItemIds: string[]) {
  }

  update(albumId: string, title: string, description?: string) {
  }

  batchAddMediaItems(albumId: string, mediaItemIds: string[]) {
  }

  batchRemoveMediaItems(albumId: string, mediaItemIds: string[]) {
  }

}
