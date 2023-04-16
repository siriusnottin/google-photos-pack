import * as coda from "@codahq/packs-sdk";

export const ApiUrl = "https://photoslibrary.googleapis.com/v1";

export async function getConnectionName(context: coda.ExecutionContext) {
  let request: coda.FetchRequest = {
    method: "GET",
    url: "https://www.googleapis.com/oauth2/v1/userinfo",
    headers: {
      "Content-Type": "application/json",
    },
  };
  let userResponse = await context.fetcher.fetch(request);
  let user = userResponse.body;
  return user.name as string;
}

export const MediasContentCategoriesList = {
  Animals: "ANIMALS",
  Fashion: "FASHION",
  Landmarks: "LANDMARKS",
  Receipts: "RECEIPTS",
  Weddings: "WEDDINGS",
  Arts: "ARTS",
  Flowers: "FLOWERS",
  Landscapes: "LANDSCAPES",
  Screenshots: "SCREENSHOTS",
  Whiteboards: "WHITEBOARDS",
  Birthdays: "BIRTHDAYS",
  Food: "FOOD",
  Night: "NIGHT",
  Selfies: "SELFIES",
  Cityscapes: "CITYSCAPES",
  Gardens: "GARDENS",
  People: "PEOPLE",
  Sport: "SPORT",
  Crafts: "CRAFTS",
  Holidays: "HOLIDAYS",
  Performances: "PERFORMANCES",
  Travel: "TRAVEL",
  Documents: "DOCUMENTS",
  Houses: "HOUSES",
  Pets: "PETS",
  Utility: "UTILITY"
}
