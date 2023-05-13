import { GDate } from "./gdate";
import { MediaItemsFilter } from "types/api-types";

export class DateRange {
  constructor(
    public startDate: ReturnType<GDate['toJSON']> | GDate | Date,
    public endDate: ReturnType<GDate['toJSON']> | GDate | Date
  ) { }

  toJSON(): MediaItemsFilter['dateFilter']['ranges'][0] {
    return {
      startDate: GDate.newDate(this.startDate).toJSON(),
      endDate: GDate.newDate(this.endDate).toJSON()
    }
  }
}
