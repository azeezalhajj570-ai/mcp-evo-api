import assert from "node:assert/strict";
import test from "node:test";
import { compose } from "../dist/middleware/compose.js";
import { requestContext } from "../dist/middleware/requestContext.js";
import { response } from "../dist/middleware/response.js";
import { logging } from "../dist/middleware/logging.js";
import { rateLimit } from "../dist/middleware/rateLimit.js";
import { validation } from "../dist/middleware/validation.js";
import { success, error } from "../dist/utils/response.js";
import { ErrorCodes } from "../dist/types/response.js";
import { z } from "zod";

test("compose runs middleware in correct order", async () => {
  const calls = [];
  const mw1 = async (ctx, next) => { calls.push("pre1"); const r = await next(); calls.push("post1"); return r; };
  const mw2 = async (ctx, next) => { calls.push("pre2"); const r = await next(); calls.push("post2"); return r; };
  const pipeline = compose([mw1, mw2]);
  const result = await pipeline({ tool: "test" }, async (ctx) => { calls.push("handler"); return "done"; });
  assert.equal(result, "done");
  assert.deepEqual(calls, ["pre1", "pre2", "handler", "post2", "post1"]);
});

test("requestContext adds requestId and startTime", async () => {
  const pipeline = compose([requestContext]);
  const ctx = { tool: "test" };
  await pipeline(ctx, async () => "ok");
  assert.ok(ctx.requestId);
  assert.ok(ctx.startTime);
  assert.equal(typeof ctx.requestId, "string");
  assert.equal(typeof ctx.startTime, "number");
});

test("response middleware enriches metadata with ctx values", async () => {
  const pipeline = compose([requestContext, response]);
  const enriched = await pipeline({ tool: "test" }, async (ctx) => {
    return success("test", { ok: true });
  });
  assert.equal(enriched.success, true);
  assert.equal(enriched.data.ok, true);
  assert.ok(enriched.metadata.requestId);
  assert.ok(typeof enriched.metadata.durationMs === "number");
  assert.equal(enriched.metadata.tool, "test");
  assert.equal(enriched.metadata.version, "2.0");
});

test("error response has correct shape", async () => {
  const errResp = error("test", ErrorCodes.INTERNAL_ERROR, "test error", false, { detail: "x" });
  assert.equal(errResp.success, false);
  assert.equal(errResp.code, "INTERNAL_ERROR");
  assert.equal(errResp.message, "test error");
  assert.equal(errResp.retryable, false);
  assert.deepEqual(errResp.details, { detail: "x" });
  assert.ok(errResp.metadata.requestId);
  assert.equal(errResp.metadata.tool, "test");
});

test("rateLimit blocks after exceeding max", async () => {
  const pipeline = compose([rateLimit({ maxRequests: 2, windowMs: 60000 })]);
  const ctx = { tool: "test", userId: "rate-test-user" };

  const r1 = await pipeline(ctx, async () => success("test", "ok"));
  assert.equal(r1.success, true);

  const r2 = await pipeline(ctx, async () => success("test", "ok"));
  assert.equal(r2.success, true);

  const r3 = await pipeline(ctx, async () => success("test", "ok"));
  assert.equal(r3.success, false);
  assert.equal(r3.code, ErrorCodes.RATE_LIMIT_EXCEEDED);
});

test("rateLimit uses separate counters per user", async () => {
  const pipeline = compose([rateLimit({ maxRequests: 1, windowMs: 60000 })]);
  const ctxA = await pipeline({ tool: "test", userId: "user-a" }, async () => success("a", "ok"));
  assert.equal(ctxA.success, true);

  const ctxB = await pipeline({ tool: "test", userId: "user-b" }, async () => success("b", "ok"));
  assert.equal(ctxB.success, true);
});

test("validation passes valid input", async () => {
  const schema = z.object({ name: z.string().min(1) });
  const pipeline = compose([validation(schema)]);
  const ctx = { tool: "test", input: { name: "hello" } };
  const result = await pipeline(ctx, async () => success("test", "valid"));
  assert.equal(result.success, true);
});

test("validation rejects invalid input with INVALID_INPUT", async () => {
  const schema = z.object({ name: z.string().min(1) });
  const pipeline = compose([validation(schema)]);
  const ctx = { tool: "test", input: { name: "" } };
  const result = await pipeline(ctx, async () => success("test", "invalid"));
  assert.equal(result.success, false);
  assert.equal(result.code, ErrorCodes.INVALID_INPUT);
});

test("validation skips when no schema provided", async () => {
  const pipeline = compose([validation(null)]);
  const ctx = { tool: "test", input: { anything: true } };
  const result = await pipeline(ctx, async () => success("test", "ok"));
  assert.equal(result.success, true);
});

test("logging middleware does not throw", async () => {
  const pipeline = compose([logging]);
  const ctx = { tool: "test", requestId: "test-id", startTime: Date.now() };
  const result = await pipeline(ctx, async () => success("test", "logged"));
  assert.equal(result.success, true);
});

test("full pipeline: requestContext + logging + rateLimit + auth + response", async () => {
  const fullPipeline = compose([requestContext, logging, rateLimit({ maxRequests: 10, windowMs: 60000 }), response]);
  const ctx = { tool: "full-test", userId: "full-user" };
  const result = await fullPipeline(ctx, async () => success("full-test", { value: 42 }));
  assert.equal(result.success, true);
  assert.equal(result.data.value, 42);
  assert.ok(result.metadata.requestId);
  assert.ok(typeof result.metadata.durationMs === "number");
  assert.equal(result.metadata.tool, "full-test");
});

test("createHandler wraps handler with full pipeline", async () => {
  // dynamic import since it re-exports from middleware index which may have side effects
  const { createHandler } = await import("../dist/middleware/index.js");
  const handler = createHandler("handler-test", async (ctx) => {
    return success(ctx.tool, { from: "handler" });
  });
  const result = await handler({ testInput: true });
  assert.ok(result.content);
  assert.equal(result.content[0].type, "text");
  const parsed = JSON.parse(result.content[0].text);
  assert.equal(parsed.from, "handler");
});

test("createHandler catches errors and returns INTERNAL_ERROR mcpText", async () => {
  const { createHandler } = await import("../dist/middleware/index.js");
  const handler = createHandler("error-test", async (ctx) => {
    throw new Error("something broke");
  });
  const result = await handler({});
  assert.ok(result.content);
  const text = result.content[0].text;
  assert.ok(text.includes("INTERNAL_ERROR"));
  assert.ok(text.includes("something broke"));
});
