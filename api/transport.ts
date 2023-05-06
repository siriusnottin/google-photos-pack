import * as coda from "@codahq/packs-sdk";

export class Transport {

  constructor(public readonly context: coda.ExecutionContext) { }

  private readonly headers = {
    "Content-Type": "application/json",
  }

  private createUrl(endpoint: string, params?: { [key: string]: any }) {
    let url = `${ApiUrl}/${endpoint}`;
    if (params) {
      url = coda.withQueryParams(url, params);
    }
    return url;
  }

  private createRequestParams(method: coda.FetchMethodType, url: string, body?: string): coda.FetchRequest {
    // middleware to add header
    return {
      method: method,
      url: url,
      headers: this.headers,
      body: body,
    };
  }

  get(endpoint: string, params?: { [key: string]: any }) {
    const request = this.createRequestParams(
      "GET",
      this.createUrl(endpoint, params)
    );
    return this.context.fetcher.fetch(request);
  }

  upload() {
    // TODO: implement upload method
  }

  post(endpoint: string, options?: object) {
    const body = JSON.stringify(options) as string;
    const request = this.createRequestParams(
      "POST",
      this.createUrl(endpoint),
      body
    );
    return this.context.fetcher.fetch(request);
  }

}
