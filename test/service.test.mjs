import assert from "node:assert/strict";
import test from "node:test";
import nock from "nock";
import { EvolutionApiService } from "../dist/services/evolutionApiService.js";

const BASE = "https://seu-servidor-evolution-api.com";

test("extractMessageTimestamp handles messageTimestamp", () => {
  const svc = new EvolutionApiService("test", "tok");
  const msg = { key: { remoteJid: "a@c.us", fromMe: false, id: "1" }, messageTimestamp: 1700000000 };
  assert.equal(svc.extractMessageTimestamp(msg), 1700000000);
});

test("extractMessageTimestamp handles timestamp field", () => {
  const svc = new EvolutionApiService("test", "tok");
  const msg = { key: { remoteJid: "a@c.us", fromMe: false, id: "1" }, timestamp: 1700000001 };
  assert.equal(svc.extractMessageTimestamp(msg), 1700000001);
});

test("extractMessageTimestamp falls back to createdAt", () => {
  const svc = new EvolutionApiService("test", "tok");
  const msg = { key: { remoteJid: "a@c.us", fromMe: false, id: "1" }, createdAt: "2025-01-15T10:00:00Z" };
  const ts = svc.extractMessageTimestamp(msg);
  assert.ok(typeof ts === "number");
  assert.ok(ts > 0);
});

test("instance-token header and body field are sent", async (t) => {
  const svc = new EvolutionApiService("test-instance", "test-token");
  const scope = nock(BASE, { reqheaders: { "instance-token": "test-token" } })
    .post("/message/text/test-instance", (body) => body.instanceToken === "test-token")
    .reply(200, { key: { id: "msg123" } });

  await svc.sendTextMessage({ number: "5511999999999", text: "Hello" });
  assert.ok(scope.isDone());
});

test("findMessages passes filters correctly", async () => {
  const svc = new EvolutionApiService("test-instance", "test-token");
  const scope = nock(BASE)
    .post("/chat/findMessages/test-instance", (body) =>
      body.chatId === "5511999999999@c.us" &&
      body.limit === 50 &&
      body.offset === 10 &&
      body.fromMe === false &&
      body.startDate === "2025-01-01T00:00:00Z" &&
      body.endDate === "2025-12-31T23:59:59Z")
    .reply(200, { data: [] });

  await svc.findMessages({
    remoteJid: "5511999999999@c.us", limit: 50, offset: 10,
    fromMe: false, startDate: "2025-01-01T00:00:00Z", endDate: "2025-12-31T23:59:59Z"
  });
  assert.ok(scope.isDone());
});

test("findMessages uses default limit and offset", async () => {
  const svc = new EvolutionApiService("test-instance", "test-token");
  const scope = nock(BASE)
    .post("/chat/findMessages/test-instance", (body) => body.limit === 100 && body.offset === 0)
    .reply(200, { data: [] });

  await svc.findMessages({});
  assert.ok(scope.isDone());
});

test("findStatusMessages sends correct request", async () => {
  const svc = new EvolutionApiService("test-instance", "test-token");
  const scope = nock(BASE).post("/chat/findStatusMessages/test-instance").reply(200, { data: [] });

  await svc.findStatusMessages();
  assert.ok(scope.isDone());
});

test("no instance-token header when token is empty", async () => {
  const svc = new EvolutionApiService("no-token-instance");
  const scope = nock(BASE, { badheaders: ["instance-token"] })
    .post("/message/text/no-token-instance")
    .reply(200, { key: { id: "1" } });

  await svc.sendTextMessage({ number: "5511999999999", text: "Hi" });
  assert.ok(scope.isDone());
});

test("getApiInfo sends GET /", async () => {
  const svc = new EvolutionApiService("test-instance", "test-token");
  const scope = nock(BASE).get("/").reply(200, { version: "2.0.0", status: 200 });

  const result = await svc.getApiInfo();
  assert.equal(result.version, "2.0.0");
  assert.ok(scope.isDone());
});

test("group detection by @g.us suffix", () => {
  assert.ok("12345@g.us".endsWith("@g.us"));
  assert.ok(!"5511999999999@c.us".endsWith("@g.us"));
  assert.ok(!"5511999999999@s.whatsapp.net".endsWith("@g.us"));
});
