import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { EvolutionApiService } from "../services/evolutionApiService.js";
import { SetChatwootSchema, SetTypebotSchema } from "../schemas/integrations.js";
import { success } from "../utils/response.js";
import { createHandler } from "../middleware/index.js";

export function registerIntegrationTools(server: McpServer, getService: () => EvolutionApiService): void {

  server.tool("chatwoot.configure", SetChatwootSchema.shape, createHandler("chatwoot.configure", async (ctx) => {
    const svc = getService();
    const result = await svc.setChatwoot(ctx.input);
    return success(ctx.tool, result);
  }));

  server.tool("chatwoot.find", {}, createHandler("chatwoot.find", async (ctx) => {
    const svc = getService();
    const result = await svc.findChatwoot();
    return success(ctx.tool, result);
  }));

  server.tool("typebot.configure", SetTypebotSchema.shape, createHandler("typebot.configure", async (ctx) => {
    const svc = getService();
    const result = await svc.setTypebot(ctx.input);
    return success(ctx.tool, result);
  }));

  server.tool("typebot.start", {
    number: z.string().min(1).describe("Number to start Typebot for")
  }, createHandler("typebot.start", async (ctx) => {
    const { number } = ctx.input as any;
    const svc = getService();
    const result = await svc.startTypebot(number);
    return success(ctx.tool, result);
  }));

  server.tool("typebot.status", {
    enabled: z.boolean().describe("Enable or disable Typebot")
  }, createHandler("typebot.status", async (ctx) => {
    const { enabled } = ctx.input as any;
    const svc = getService();
    const result = await svc.changeTypebotStatus(enabled);
    return success(ctx.tool, result);
  }));

  server.tool("typebot.find", {}, createHandler("typebot.find", async (ctx) => {
    const svc = getService();
    const result = await svc.findTypebot();
    return success(ctx.tool, result);
  }));
}
