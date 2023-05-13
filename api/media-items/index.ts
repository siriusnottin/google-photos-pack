import { Transport } from "api/transport";
import { Filters } from "./filters";
import { FetchResponse } from "@codahq/packs-sdk";
import { ApiResponse } from "types/api-types";
export class MediaItems {
  constructor(public transport: Transport) { }

  list(pageToken?: string, pageSize = 100) { // range: 25-100
    return this.transport.get("mediaItems", { pageSize, pageToken });
  }

  get(mediaItemId: string) {
    return this.transport.get(`mediaItems/${mediaItemId}`);
  }

  search(albumId: string, pageToken?: string, pageSize?: number, fields?: string): Promise<FetchResponse<ApiResponse>>
  search(filters: Filters, pageToken?: string, pageSize?: number, fields?: string): Promise<FetchResponse<ApiResponse>>;

  search(albumIdOrFilters: string | Filters, pageToken?: string, pageSize = 100, fields?: string) {
    const body: {
      pageSize?: number;
      pageToken?: string;
      albumId?: string;
      filters?: ReturnType<Filters["toJSON"]>;
    } = { pageSize, pageToken }
    if (typeof albumIdOrFilters === "string") {
      body.albumId = albumIdOrFilters;
    } else {
      body.filters = albumIdOrFilters.toJSON();
    }
    return this.transport.post("mediaItems:search", { fields }, body);
  }

}
