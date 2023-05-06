import { Moment, isMoment } from "moment";
import { GPhotosDate } from "types/api-types";

export class GDate {
  constructor(public year?: number, public month?: number, public day?: number) { }

  static fromDate(date: Date) {
    if (!(date instanceof Date)) {
      throw Error('Not a valid date object');
    }
    return new GDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
  }

  static fromMoment(moment: Moment) {
    if (!isMoment(moment)) {
      throw Error('Not a valid moment object');
    }
    return new GDate(moment.year(), moment.month() + 1, moment.date());
  }

  static newDate(date?: GDate | Date | Moment | GPhotosDate) {
    if (date instanceof GDate) {
      return date;
    }
    if (date instanceof Date) {
      return GDate.fromDate(date);
    }
    if (isMoment(date)) {
      return GDate.fromMoment(date);
    }
    if (date.year && date.month && date.day) {
      return new GDate(date.year, date.month, date.day);
    }
    return new GDate();
  }

  toJSON(): GPhotosDate {
    return {
      year: this.year,
      month: this.month,
      day: this.day
    }
  }

}
