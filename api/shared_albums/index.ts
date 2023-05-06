import { Transport } from "api/transport";

export class SharedAlbums {
  constructor(public transport: Transport) { }

  list(pageSize = 50, pageToken?: string) {
  }

  get(id: string) {
  }

  join(id: string) {
  }

  leave(id: string) {
  }
}
