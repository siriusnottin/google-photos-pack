import * as coda from "@codahq/packs-sdk";
import { ApiResponse } from "types/api-types";

const ApiBaseUrl = "https://photoslibrary.googleapis.com/v1";

export class Transport {

  constructor(public readonly context: coda.ExecutionContext) { }

  private readonly headers = {
    "Content-Type": "application/json",
  }

  private createUrl(endpoint: string, params?: { [key: string]: any }) {
    let url = `${ApiBaseUrl}/${endpoint}`;
    if (params) {
      url = coda.withQueryParams(url, params);
    }
    return url;
  }

  private createRequestParams(method: coda.FetchMethodType, url: string, body?: string): coda.FetchRequest {
    // middleware to add header
    return {
      method,
      url,
      headers: this.headers,
      body,
    };
  }

  get(endpoint: string, params?: { [key: string]: any }): Promise<coda.FetchResponse<ApiResponse>> {
    const request = this.createRequestParams(
      "GET",
      this.createUrl(endpoint, params)
    );
    return this.context.fetcher.fetch(request);
  }

  upload() {
    // TODO: implement upload method
  }

  post(endpoint: string, options?: object, fields?: string): Promise<coda.FetchResponse<ApiResponse>> {
    const body = JSON.stringify(options) as string;
    const params = { fields: fields }
    const request = this.createRequestParams(
      "POST",
      this.createUrl(endpoint, params),
      body
    );
    return this.context.fetcher.fetch(request);
  }

}
