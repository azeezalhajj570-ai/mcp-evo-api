import { expect } from "chai";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import { EvolutionApiService } from "../src/services/evolutionApiService.js";
import { config } from "../src/config.js";
import { MessageData } from "../src/types.js";

describe("EvolutionApiService", () => {
  let mock: MockAdapter;
  let service: EvolutionApiService;

  beforeEach(() => {
    mock = new MockAdapter(axios);
    service = new EvolutionApiService("test-instance", "test-token");
  });

  afterEach(() => {
    mock.restore();
  });

  it("sends instance-token header and body field", async () => {
    let capturedHeaders: any;
    let capturedBody: any;

    mock.onPost(/\/message\/text\/test-instance/).reply((req: any) => {
      capturedHeaders = req.headers;
      capturedBody = JSON.parse(req.data);
      return [200, { key: { id: "msg123" } }];
    });

    await service.sendTextMessage({ number: "5511999999999", text: "Hello" });

    expect(capturedHeaders["instance-token"]).to.equal("test-token");
    expect(capturedBody.instanceToken).to.equal("test-token");
  });

  it("findMessages passes filters correctly", async () => {
    let capturedBody: any;

    mock.onPost(/\/chat\/findMessages\/test-instance/).reply((req: any) => {
      capturedBody = JSON.parse(req.data);
      return [200, { data: [] }];
    });

    await service.findMessages({
      remoteJid: "5511999999999@c.us",
      limit: 50,
      offset: 10,
      fromMe: false,
      startDate: "2025-01-01T00:00:00Z",
      endDate: "2025-12-31T23:59:59Z"
    });

    expect(capturedBody.chatId).to.equal("5511999999999@c.us");
    expect(capturedBody.limit).to.equal(50);
    expect(capturedBody.offset).to.equal(10);
    expect(capturedBody.fromMe).to.equal(false);
    expect(capturedBody.startDate).to.equal("2025-01-01T00:00:00Z");
    expect(capturedBody.endDate).to.equal("2025-12-31T23:59:59Z");
  });

  it("findMessages uses default limit and offset", async () => {
    let capturedBody: any;

    mock.onPost(/\/chat\/findMessages\/test-instance/).reply((req: any) => {
      capturedBody = JSON.parse(req.data);
      return [200, { data: [] }];
    });

    await service.findMessages({});

    expect(capturedBody.limit).to.equal(100);
    expect(capturedBody.offset).to.equal(0);
  });

  it("extractMessageTimestamp handles messageTimestamp", () => {
    const msg: MessageData = {
      key: { remoteJid: "a@c.us", fromMe: false, id: "1" },
      messageTimestamp: 1700000000
    };
    expect(service.extractMessageTimestamp(msg)).to.equal(1700000000);
  });

  it("extractMessageTimestamp handles timestamp field", () => {
    const msg: MessageData = {
      key: { remoteJid: "a@c.us", fromMe: false, id: "1" },
      timestamp: 1700000001
    };
    expect(service.extractMessageTimestamp(msg)).to.equal(1700000001);
  });

  it("extractMessageTimestamp falls back to createdAt", () => {
    const msg: MessageData = {
      key: { remoteJid: "a@c.us", fromMe: false, id: "1" },
      createdAt: "2025-01-15T10:00:00Z"
    };
    const ts = service.extractMessageTimestamp(msg);
    expect(ts).to.be.a("number");
    expect(ts).to.be.greaterThan(0);
  });

  it("findStatusMessages sends correct request", async () => {
    let capturedMethod: string = "";

    mock.onPost(/\/chat\/findStatusMessages\/test-instance/).reply((req: any) => {
      capturedMethod = "post";
      return [200, { data: [] }];
    });

    await service.findStatusMessages();
    expect(capturedMethod).to.equal("post");
  });

  it("getApiInfo sends GET to /", async () => {
    let capturedUrl = "";

    mock.onGet("/").reply((req: any) => {
      capturedUrl = "/";
      return [200, { version: "2.0.0", status: 200 }];
    });

    const result = await service.getApiInfo();
    expect(capturedUrl).to.equal("/");
    expect(result.version).to.equal("2.0.0");
  });

  it("constructor uses defaults from config", () => {
    const defaultService = new EvolutionApiService();
    expect(defaultService).to.be.instanceOf(EvolutionApiService);
  });

  it("sets instance-token header only when token is provided", async () => {
    const noTokenService = new EvolutionApiService("no-token-instance");
    let capturedHeaders: any;

    mock.onPost(/\/message\/text\/no-token-instance/).reply((req: any) => {
      capturedHeaders = req.headers;
      return [200, { key: { id: "1" } }];
    });

    await noTokenService.sendTextMessage({ number: "5511999999999", text: "Hi" });
    expect(capturedHeaders["instance-token"]).to.be.undefined;
  });
});
