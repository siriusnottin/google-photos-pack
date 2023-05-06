import { MediaItem } from "types/pack-types"
import { Transport } from "api/transport";

export class MediaItems {
  constructor(public transport: Transport) { }

  list(pageSize = 100, pageToken?: string) { // range: 25-100
    return this.transport.get("mediaItems", { pageSize, pageToken });
  }

  get(id: string) {
    return this.transport.get(`mediaItems/${id}`);
  }

  search(albumIdOrFilters: string | object, pageSize = 100, pageToken?: string) {
    const postData: {
      pageSize?: number;
      pageToken?: string;
      albumId?: string;
      filters?: object;
    } = { pageSize, pageToken }
    if (typeof albumIdOrFilters === "string") {
      postData.albumId = albumIdOrFilters;
    } else {
      postData.filters = albumIdOrFilters;
    }
    JSON.stringify(postData);
    return this.transport.post("mediaItems:search", postData);
  }

}
