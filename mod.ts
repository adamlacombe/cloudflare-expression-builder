import { CLOUDFLARE_FIREWALL_FIELDS, type CFOperator, type CloudflareFirewallFields, type CloudflareResponse, type ExpressionValue } from "./types.ts";

/**
 * Options for configuring an instance of the `ExpressionBuilder` class.
 */
export interface ExpressionBuilderOptions {
  /**
   * Whether the Cloudflare account associated with the API token is on a paid plan.
   * If `false`, the `matches` operator will throw an error when used.
   * Default: `false`.
   */
  isPaidPlan?: boolean;

  /**
   * The Cloudflare API token to use for validation.
   * If not provided, the `CLOUDFLARE_API_TOKEN` environment variable will be used.
   */
  apiToken?: string;
}

export class ExpressionBuilder {
  private expressions: string[] = [];
  private options: ExpressionBuilderOptions;

  constructor(options: ExpressionBuilderOptions = { isPaidPlan: false }) {
    this.options = options;
    this.formatValue = this.formatValue.bind(this);
  }

  group(func: (builder: ExpressionBuilder) => ExpressionBuilder) {
    const builder = new ExpressionBuilder(this.options);
    func(builder);
    this.expressions.push(`(${builder.build()})`);
    return this;
  }

  addExpression<Op extends CFOperator>(field: CloudflareFirewallFields, operator?: Op, value?: ExpressionValue<Op>) {
    if (operator && value !== undefined) {
      if (operator === "matches" && !this.options.isPaidPlan) {
        throw new Error("The 'matches' operator requires a Cloudflare Business or Enterprise plan.");
      }

      if (operator === "in" && Array.isArray(value)) {
        this.expressions.push(`${field} ${operator} {${value.map(v => `"${v.trim()}"`).join(" ")}}`);
      } else {
        this.expressions.push(`${field} ${operator} ${this.formatValue(value as string | number | boolean)}`);
      }
    } else {
      this.expressions.push(field);
    }
    return this;
  }

  and() {
    this.expressions.push("and");
    return this;
  }

  or() {
    this.expressions.push("or");
    return this;
  }

  not() {
    this.expressions.push("not");
    return this;
  }

  in(value: string) {
    this.expressions.push(`in ${value}`);
    return this;
  }

  contains(value: string) {
    this.expressions.push(`contains ${value}`);
    return this;
  }

  matches(value: string) {
    this.expressions.push(`matches ${value}`);
    return this;
  }

  addFunction<Op extends CFOperator>(functionName: string, field: CloudflareFirewallFields, operator?: CFOperator, value?: ExpressionValue<Op>) {
    if (this.isFieldName(field)) {
      if (operator && value !== undefined) {
        this.expressions.push(`${functionName}(${field}) ${operator} ${this.formatValue(value as string | number | boolean)}`);
      } else {
        this.expressions.push(`${functionName}(${field})`);
      }
    } else {
      throw new Error(`Invalid field name: ${field}`);
    }
    return this;
  }


  build() {
    let result = this.expressions.join(" ");
    // Remove the outermost parentheses if there is only one group of expressions
    if (result.startsWith("(") && result.endsWith(")") && result.split("(").length === 2) {
      result = result.slice(1, -1);
    }
    return result;
  }

  async validate(): Promise<boolean> {
    const apiToken = this.options.apiToken || Deno.env.get("CLOUDFLARE_API_TOKEN");
    if (!apiToken) {
      throw new Error("No Cloudflare API token provided.");
    }

    const headers = new Headers();
    headers.append("Authorization", `Bearer ${apiToken}`);
    headers.append("Content-Type", "application/json");

    const response = await fetch(`https://api.cloudflare.com/client/v4/filters/validate-expr`, {
      headers: headers,
      method: "POST",
      body: JSON.stringify({
        expression: this.build()
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to validate expression: ${response.statusText}`);
    }

    const data: CloudflareResponse<any> = await response.json();
    if (!data.success) {
      throw new Error(`Failed to validate expression: ${data.errors[0].message}`);
    }

    return data.success;
  }

  private formatValue(value: string | number | boolean): string {
    if (typeof value === "string") {
      // Don't enclose field names or IP addresses in quotes
      if (this.isFieldName(value) || this.isIpAddress(value)) {
        return value;
      }
      return `"${value}"`;
    }
    return value.toString();
  }

  private isFieldName(value: string): boolean {
    return value in CLOUDFLARE_FIREWALL_FIELDS;
  }


  private isIpAddress(value: string) {
    // Use a simple regex to check if the value is an IP address
    const ipPattern = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
    return ipPattern.test(value);
  }

}

