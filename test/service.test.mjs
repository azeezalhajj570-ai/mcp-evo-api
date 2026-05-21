import assert from "node:assert/strict";
import test from "node:test";
import nock from "nock";
import { EvolutionApiService } from "../dist/services/evolutionApiService.js";

const BASE = "https://your-evolution-api-server.com";

test("instance-token header is sent", async (t) => {
  const svc = new EvolutionApiService("test-instance", "test-token");
  const scope = nock(BASE, { reqheaders: { "instance-token": "test-token" } })
    .post("/message/sendText/test-instance")
    .reply(200, { key: { id: "msg123" } });

  await svc.sendTextMessage({ number: "5511999999999", text: "Hello" });
  assert.ok(scope.isDone());
});

test("findMessages passes query and chatId", async () => {
  const svc = new EvolutionApiService("test-instance", "test-token");
  const scope = nock(BASE)
    .post("/chat/findMessages/test-instance", (body) =>
      body.query === "hello" && body.chatId === "5511999999999@c.us")
    .reply(200, { data: [] });

  await svc.findMessages("hello", "5511999999999@c.us");
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
    .post("/message/sendText/no-token-instance")
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

test("sendMedia posts to sendMedia endpoint", async () => {
  const svc = new EvolutionApiService("test-instance", "test-token");
  const scope = nock(BASE)
    .post("/message/sendMedia/test-instance", (body) =>
      body.number === "5511999999999" && body.media.mediaType === "image")
    .reply(200, { key: { id: "media1" } });

  await svc.sendMedia({ number: "5511999999999", media: { url: "https://example.com/img.jpg", mediaType: "image" } });
  assert.ok(scope.isDone());
});

test("sendAudio posts to sendAudio endpoint", async () => {
  const svc = new EvolutionApiService("test-instance", "test-token");
  const scope = nock(BASE)
    .post("/message/sendAudio/test-instance")
    .reply(200, { key: { id: "audio1" } });

  await svc.sendAudio({ number: "5511999999999", audio: { url: "https://example.com/audio.mp3" } });
  assert.ok(scope.isDone());
});

test("fetchChats calls POST /chat/findChats", async () => {
  const svc = new EvolutionApiService("test-instance", "test-token");
  const scope = nock(BASE)
    .post("/chat/findChats/test-instance")
    .reply(200, { data: [{ id: "5511999999999@c.us", name: "Test Chat", lastMessage: { text: "hi", timestamp: 1000 } }] });

  const result = await svc.fetchChats();
  assert.equal(result.data[0].name, "Test Chat");
  assert.ok(scope.isDone());
});

test("findLabels calls GET /label/findLabels", async () => {
  const svc = new EvolutionApiService("test-instance", "test-token");
  const scope = nock(BASE)
    .get("/label/findLabels/test-instance")
    .reply(200, [{ id: "label1", name: "Clients", color: 1 }]);

  const result = await svc.findLabels();
  assert.ok(Array.isArray(result));
  assert.equal(result[0].name, "Clients");
  assert.ok(scope.isDone());
});

test("handleLabel calls POST /label/handleLabel", async () => {
  const svc = new EvolutionApiService("test-instance", "test-token");
  const scope = nock(BASE)
    .post("/label/handleLabel/test-instance", { number: "5511999999999", labelId: "label1", action: "add" })
    .reply(200, { success: true });

  const result = await svc.handleLabel("5511999999999", "label1", "add");
  assert.equal(result.success, true);
  assert.ok(scope.isDone());
});

test("fetchContacts calls POST /chat/findContacts", async () => {
  const svc = new EvolutionApiService("test-instance", "test-token");
  const scope = nock(BASE)
    .post("/chat/findContacts/test-instance", { where: {} })
    .reply(200, { data: [{ id: "5511999999999@c.us", name: "John", pushname: "John Doe" }] });

  const result = await svc.fetchContacts();
  assert.equal(result.data[0].name, "John");
  assert.ok(scope.isDone());
});
