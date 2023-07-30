export interface CloudflareResponseResultInfo {
  count: number;
  page: number;
  per_page: number;
  total_count: number;
}

export interface CloudflareResponse<T> {
  success: boolean;
  errors: any[];
  messages: any[];
  result: T;

  // This is only present on responses with pagination
  result_info?: CloudflareResponseResultInfo;
}

interface ICloudflareFirewallFields {
  /**
   * Represents the client TCP IP address, which may be adjusted to reflect the actual address of the client by using, for example, HTTP headers such as
   * X-Forwarded-For or X-Real-IP.
   */
  "ip.src": string;

  /**
   * Represents the 16- or 32-bit integer representing the Autonomous System (AS) number associated with client IP address.
   * This field has the same value as the ip.geoip.asnum field, which is still available.
   */
  "ip.geoip.asnum": number;

  /**
   * Represents the continent code associated with client IP address:
   * AF – Africa
   * AN – Antarctica
   * AS – Asia
   * EU – Europe
   * NA – North America
   * OC – Oceania
   * SA – South America
   * T1 – Tor network
   * This field has the same value as the ip.geoip.continent field, which is still available.
   */
  "ip.geoip.continent": string;

  /**
   * Represents the 2-letter country code in ISO 3166-1 Alpha 2 format.
   * This field has the same value as the ip.geoip.country field, which is still available.
   */
  "ip.geoip.country": string;

  /**
   * Represents the entire cookie as a string.
   */
  "http.cookie": string;

  /**
   * Represents the hostname used in the full request URI.
   */
  "http.host": string;

  /**
   * Represents the HTTP Referer request header, which contains the address of the web page that linked to the currently requested page.
   */
  "http.referer": string;

  /**
   * Represents the full URI as received by the web server (does not include #fragment, which is not sent to web servers).
   */
  "http.request.full_uri": string;

  /**
   * Represents the HTTP method, returned as a string of uppercase characters.
   */
  "http.request.method": string;

  /**
   * Represents the URI path and query string of the request.
   */
  "http.request.uri": string;

  /**
   * Represents the URI path of the request.
   */
  "http.request.uri.path": string;

  /**
   * Represents the entire query string, without the ? delimiter.
   */
  "http.request.uri.query": string;

  /**
   * Represents the HTTP user agent, a request header that contains a characteristic string to allow identification of the client operating system and web browser.
   */
  "http.user_agent": string;

  /**
   * Represents the version of the HTTP protocol used. Use this field when you require different checks for different versions.
   */
  "http.request.version": string;

  /**
   * Represents the full X-Forwarded-For HTTP header.
   */
  "http.x_forwarded_for": string;

  /**
   * Represents the HTTP headers associated with a request as a string.
   * This allows for wildcard usage in expressions.
   */
  "http.request.headers": string;

  /**
   * Represents the names of the HTTP headers associated with a request.
   */
  "http.request.headers.names": string[];

  /**
   * Represents the values of the HTTP headers associated with a request.
   */
  "http.request.headers.values": string[];

  /**
   * Represents the MIME type of the request body.
   */
  "http.request.body.mime": string;

  /**
   * Represents whether the request was made using SSL (https).
   */
  "ssl": string;

  /**
   * Represents the threat score associated with the incoming request.
   * This score ranges from 0 (low risk) to 100 (high risk).
   */
  "cf.threat_score": number;

  /**
   * Represents whether the incoming request is from a known bot.
   */
  "cf.client.bot": boolean;

  /**
   * Represents whether the client certificate was verified.
   */
  "cf.tls_client_auth.cert_verified": boolean;
}

type CFirewallFields = keyof ICloudflareFirewallFields;
type Wildcard<T extends string> = `${T}[*]`;

export type CloudflareFirewallFields =
  | CFirewallFields
  | Wildcard<"http.request.headers.names">
  | Wildcard<"http.request.headers.values">;


export const CLOUDFLARE_FIREWALL_FIELDS: Record<Exclude<CFirewallFields, 'http.request.headers.values' | 'http.request.headers.names' | 'http.request.headers.names[*]' | 'http.request.headers.values[*]'>, null> = {
  "ip.src": null,
  "ip.geoip.asnum": null,
  "ip.geoip.continent": null,
  "ip.geoip.country": null,
  "http.cookie": null,
  "http.host": null,
  "http.referer": null,
  "http.request.full_uri": null,
  "http.request.method": null,
  "http.request.uri": null,
  "http.request.uri.path": null,
  "http.request.uri.query": null,
  "http.user_agent": null,
  "http.request.version": null,
  "http.x_forwarded_for": null,
  "http.request.headers": null,
  "http.request.body.mime": null,
  "ssl": null,
  "cf.threat_score": null,
  "cf.client.bot": null,
  "cf.tls_client_auth.cert_verified": null,
};

type EnglishOperator =
  | "eq"  // Equal
  | "ne"  // Not equal
  | "lt"  // Less than
  | "le"  // Less than or equal
  | "gt"  // Greater than
  | "ge"  // Greater than or equal
  | "contains"  // Exactly contains
  | "matches"  // Matches
  | "in";  // Value is in a set of values

type CLikeOperator =
  | "=="  // Equal
  | "!="  // Not equal
  | "<"  // Less than
  | "<="  // Less than or equal
  | ">"  // Greater than
  | ">="  // Greater than or equal
  | "~";  // Matches


export type CFOperator = EnglishOperator | CLikeOperator;

export type ExpressionValue<Op extends CFOperator> = Op extends "in" ? string[] : string | number | boolean;

