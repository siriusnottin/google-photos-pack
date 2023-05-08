import { MediaItem } from "types/pack-types"
import { Transport } from "api/transport";
import { Filters } from "./filters";
export class MediaItems {
  constructor(public transport: Transport) { }

  list(pageSize = 100, pageToken?: string) { // range: 25-100
    return this.transport.get("mediaItems", { pageSize, pageToken });
  }

  get(mediaItemId: string) {
    return this.transport.get(`mediaItems/${mediaItemId}`);
  }

  search(albumIdOrFilters: string | Filters, fields?: string, pageSize = 100, pageToken?: string) {
    const postData: {
      pageSize?: number;
      pageToken?: string;
      albumId?: string;
      filters?: ReturnType<Filters["toJSON"]>;
    } = { pageSize, pageToken }
    if (typeof albumIdOrFilters === "string") {
      postData.albumId = albumIdOrFilters;
    } else {
      postData.filters = albumIdOrFilters.toJSON();
    }
    JSON.stringify(postData);
    return this.transport.post("mediaItems:search", postData, fields);
  }

}
