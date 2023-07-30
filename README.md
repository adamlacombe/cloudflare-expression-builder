# Cloudflare Expression Builder

**NOTE:** Still a work in progress. Not ready for production use.

Cloudflare Expression Builder is a Deno module that simplifies the creation of
expressions for Cloudflare's firewall rules. It provides a fluent API to build
complex expressions and includes a validation method that uses Cloudflare's API
to ensure the expression is valid.

## Features

- Fluent API for building expressions
- Supports all Cloudflare firewall fields and operators
- Validates expressions using Cloudflare's API
- Supports both free and paid Cloudflare plans

## Usage

Here's an example of how to use the ExpressionBuilder:

```typescript
import { ExpressionBuilder } from "https://deno.land/x/cloudflare-expression-builder/mod.ts";

const builder = new ExpressionBuilder();
builder.addExpression("ip.src", "==", "1.2.3.4")
  .and()
  .addExpression("http.request.uri.path", "contains", "/admin");

console.log(builder.build()); // Outputs: ip.src == 1.2.3.4 and http.request.uri.path contains "/admin"
```

You can also validate the expression using Cloudflare's API:

```typescript
const isValid = await builder.validate();
console.log(isValid); // Outputs: true or throws an error
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to
discuss what you would like to change.

Please make sure to update tests as appropriate.
