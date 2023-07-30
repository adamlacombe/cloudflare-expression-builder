import { ExpressionBuilder } from "../mod.ts";
import { assertEquals } from "./test_deps.ts";

Deno.test("ExpressionBuilder - addExpression", async () => {
  const builder = new ExpressionBuilder();
  builder.addExpression("ip.src", "==", "1.2.3.4");
  assertEquals(builder.build(), `ip.src == 1.2.3.4`);
  assertEquals(await builder.validate(), true);
});

Deno.test("ExpressionBuilder - and", async () => {
  const builder = new ExpressionBuilder();
  builder.addExpression("ip.src", "==", "1.2.3.4")
    .and()
    .addExpression("http.request.uri.path", "contains", "/admin");
  assertEquals(builder.build(), `ip.src == 1.2.3.4 and http.request.uri.path contains "/admin"`);
  assertEquals(await builder.validate(), true);
});

Deno.test("ExpressionBuilder - or", async () => {
  const builder = new ExpressionBuilder();
  builder.addExpression("ip.src", "==", "1.2.3.4").or().addExpression("http.request.uri.path", "contains", "/admin");
  assertEquals(builder.build(), `ip.src == 1.2.3.4 or http.request.uri.path contains "/admin"`);
  assertEquals(await builder.validate(), true);
});

Deno.test("ExpressionBuilder - not", async () => {
  const builder = new ExpressionBuilder();
  builder.not().addExpression("ip.src", "==", "1.2.3.4");
  assertEquals(builder.build(), `not ip.src == 1.2.3.4`);
  assertEquals(await builder.validate(), true);
});

Deno.test("ExpressionBuilder - in", async () => {
  const builder = new ExpressionBuilder();
  builder.addExpression("http.request.method", "in", ["GET", "POST", "PUT"]);
  assertEquals(builder.build(), `http.request.method in {"GET" "POST" "PUT"}`);
  assertEquals(await builder.validate(), true);
});

Deno.test("ExpressionBuilder - contains", async () => {
  const builder = new ExpressionBuilder();
  builder.addExpression("http.user_agent", "contains", "Chrome");
  assertEquals(builder.build(), `http.user_agent contains "Chrome"`);
  assertEquals(await builder.validate(), true);
});

Deno.test("ExpressionBuilder - matches", async () => {
  const builder = new ExpressionBuilder({ isPaidPlan: true });
  builder.addExpression("http.host", "matches", "^(www|store|blog)\.example.com");
  assertEquals(builder.build(), `http.host matches "^(www|store|blog)\.example.com"`);
  assertEquals(await builder.validate(), true);
});

Deno.test("ExpressionBuilder - addFunction - lower", async () => {
  const builder = new ExpressionBuilder();
  builder.addFunction("lower", "http.host", "==", "www.cloudflare.com");
  assertEquals(builder.build(), `lower(http.host) == "www.cloudflare.com"`);
  assertEquals(await builder.validate(), true);
});

Deno.test("ExpressionBuilder - group", async () => {
  const builder = new ExpressionBuilder();
  builder.group((inner) =>
    inner.addExpression("http.request.method", "==", "POST")
      .or()
      .addExpression("http.request.method", "==", "PUT")
  ).and().addExpression("http.request.uri.path", "contains", "/admin");
  assertEquals(builder.build(), `(http.request.method == "POST" or http.request.method == "PUT") and http.request.uri.path contains "/admin"`);
  assertEquals(await builder.validate(), true);
});

Deno.test("ExpressionBuilder - group 2", async () => {
  const builder = new ExpressionBuilder();
  builder.group((inner) =>
    inner.addExpression("http.request.method", "==", "POST")
      .and()
      .addExpression("http.request.uri.path", "contains", "/admin")
  ).or().group((inner) =>
    inner.addExpression("http.request.method", "==", "PUT")
      .and()
      .addExpression("http.request.uri.path", "contains", "/admin")
  );
  assertEquals(builder.build(), `(http.request.method == "POST" and http.request.uri.path contains "/admin") or (http.request.method == "PUT" and http.request.uri.path contains "/admin")`);
  assertEquals(await builder.validate(), true);
});
