import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { EvolutionApiService } from "../services/evolutionApiService.js";
import { SetWebhookSchema } from "../schemas/webhooks.js";
import { success } from "../utils/response.js";
import { createHandler } from "../middleware/index.js";

export function registerWebhookTools(server: McpServer, getService: () => EvolutionApiService): void {

  server.tool("webhooks.set", SetWebhookSchema.shape, createHandler("webhooks.set", async (ctx) => {
    const svc = getService();
    const result = await svc.setWebhook(ctx.input);
    return success(ctx.tool, result);
  }));

  server.tool("webhooks.get", {}, createHandler("webhooks.get", async (ctx) => {
    const svc = getService();
    const result = await svc.getWebhook();
    return success(ctx.tool, result);
  }));
}
