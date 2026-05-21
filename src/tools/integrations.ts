import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { EvolutionApiService } from "../services/evolutionApiService.js";
import { SetChatwootSchema, SetTypebotSchema } from "../schemas/integrations.js";
import { success, error, mcpText } from "../utils/response.js";
import { ErrorCodes } from "../types/response.js";

export function registerIntegrationTools(server: McpServer, getService: () => EvolutionApiService): void {

  server.tool("chatwoot.configure", SetChatwootSchema.shape, async (config) => {
    const start = Date.now();
    try {
      const svc = getService();
      const result = await svc.setChatwoot(config);
      return mcpText(success("chatwoot.configure", result, Date.now() - start));
    } catch (e) {
      return mcpText(error("chatwoot.configure", ErrorCodes.EXTERNAL_API_ERROR, (e as Error).message, true));
    }
  });

  server.tool("chatwoot.find", {}, async () => {
    const start = Date.now();
    try {
      const svc = getService();
      const result = await svc.findChatwoot();
      return mcpText(success("chatwoot.find", result, Date.now() - start));
    } catch (e) {
      return mcpText(error("chatwoot.find", ErrorCodes.EXTERNAL_API_ERROR, (e as Error).message, true));
    }
  });

  server.tool("typebot.configure", SetTypebotSchema.shape, async (config) => {
    const start = Date.now();
    try {
      const svc = getService();
      const result = await svc.setTypebot(config);
      return mcpText(success("typebot.configure", result, Date.now() - start));
    } catch (e) {
      return mcpText(error("typebot.configure", ErrorCodes.EXTERNAL_API_ERROR, (e as Error).message, true));
    }
  });

  server.tool("typebot.start", {
    number: z.string().min(1).describe("Number to start Typebot for")
  }, async ({ number }) => {
    const start = Date.now();
    try {
      const svc = getService();
      const result = await svc.startTypebot(number);
      return mcpText(success("typebot.start", result, Date.now() - start));
    } catch (e) {
      return mcpText(error("typebot.start", ErrorCodes.EXTERNAL_API_ERROR, (e as Error).message, true));
    }
  });

  server.tool("typebot.status", {
    enabled: z.boolean().describe("Enable or disable Typebot")
  }, async ({ enabled }) => {
    const start = Date.now();
    try {
      const svc = getService();
      const result = await svc.changeTypebotStatus(enabled);
      return mcpText(success("typebot.status", result, Date.now() - start));
    } catch (e) {
      return mcpText(error("typebot.status", ErrorCodes.EXTERNAL_API_ERROR, (e as Error).message, true));
    }
  });

  server.tool("typebot.find", {}, async () => {
    const start = Date.now();
    try {
      const svc = getService();
      const result = await svc.findTypebot();
      return mcpText(success("typebot.find", result, Date.now() - start));
    } catch (e) {
      return mcpText(error("typebot.find", ErrorCodes.EXTERNAL_API_ERROR, (e as Error).message, true));
    }
  });
}
