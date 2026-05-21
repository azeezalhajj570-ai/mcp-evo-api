import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { EvolutionApiService } from "../services/evolutionApiService.js";
import { SetWebhookSchema } from "../schemas/webhooks.js";
import { success, error, mcpText } from "../utils/response.js";
import { ErrorCodes } from "../types/response.js";

export function registerWebhookTools(server: McpServer, getService: () => EvolutionApiService): void {

  server.tool("webhooks.set", SetWebhookSchema.shape, async ({ url, enabled, events }) => {
    const start = Date.now();
    try {
      const svc = getService();
      const result = await svc.setWebhook({ url, enabled, events });
      return mcpText(success("webhooks.set", result, Date.now() - start));
    } catch (e) {
      return mcpText(error("webhooks.set", ErrorCodes.EXTERNAL_API_ERROR, (e as Error).message, true));
    }
  });

  server.tool("webhooks.get", {}, async () => {
    const start = Date.now();
    try {
      const svc = getService();
      const result = await svc.getWebhook();
      return mcpText(success("webhooks.get", result, Date.now() - start));
    } catch (e) {
      return mcpText(error("webhooks.get", ErrorCodes.EXTERNAL_API_ERROR, (e as Error).message, true));
    }
  });
}
