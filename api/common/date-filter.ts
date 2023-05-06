import { GDate } from "./gdate";
import { DateRange } from "./date-range";
import { MediaItemsFilter } from "types/api-types";

export class DateFilter {
  public dates: ReturnType<typeof GDate.newDate>[] = [];
  public ranges: DateRange[] = [];

  addDate(date) {
    this.dates.push(GDate.newDate(date));
  }

  addRange(startDate, endDate) {
    this.ranges.push(new DateRange(startDate, endDate));
  }

  toJSON() {
    return {
      dates: this.dates.map(d => d.toJSON()),
      ranges: this.ranges.map(r => r.toJSON()),
    }
  }
}
