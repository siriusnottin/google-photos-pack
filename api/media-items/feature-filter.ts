
import { MediaFeature, MediaItemsFilter } from "types/api-types";

export class FeatureFilter {
  public includedFeatures: [MediaFeature];

  constructor(includedFeature = MediaFeature.None) {
    this.includedFeatures = [includedFeature];
  }

  setFeature(feature: MediaFeature) {
    this.includedFeatures = [feature];
  }

  toJSON(): MediaItemsFilter['featureFilter'] {
    return {
      includedFeatures: this.includedFeatures
    }
  }

}
