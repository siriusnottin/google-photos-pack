import * as coda from "@codahq/packs-sdk";
import { ApiResponse } from "types/api-types";

const ApiBaseUrl = "https://photoslibrary.googleapis.com/v1";

export class Transport {

  constructor(public readonly fetcher: coda.Fetcher) { }

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

  private async withErrorHandling<T>(apiCall: () => Promise<T>): Promise<T> {
    try {
      return await apiCall();
    } catch (e) {
      if (coda.StatusCodeError.isStatusCodeError(e)) {
        let statusError = e as coda.StatusCodeError;
        let message = statusError.body?.error?.message;
        if (message) {
          throw new coda.UserVisibleError(message);
        }
      }
      throw e;
    }
  }

  get(endpoint: string, params?: { [key: string]: any }): Promise<coda.FetchResponse<ApiResponse>> {
    const request = this.createRequestParams(
      "GET",
      this.createUrl(endpoint, params)
    );
    return this.withErrorHandling(() => this.fetcher.fetch(request));
  }

  upload() {
    // TODO: implement upload method
  }

  post(endpoint: string, options?: object, fields?: string): Promise<coda.FetchResponse<ApiResponse>> {
    const body = JSON.stringify(options);
    const params = { fields }
    const request = this.createRequestParams(
      "POST",
      this.createUrl(endpoint, params),
      body
    );
    return this.withErrorHandling(() => this.fetcher.fetch(request));
  }

}
