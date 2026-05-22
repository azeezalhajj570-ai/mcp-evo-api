import { AsyncLocalStorage } from "async_hooks";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import "dotenv/config";
import { config } from "./config.js";
import { EvolutionApiService } from "./services/evolutionApiService.js";
import { registerInstanceTools } from "./tools/instances.js";
import { registerMessageTools } from "./tools/messages.js";
import { registerChatTools } from "./tools/chats.js";
import { registerGroupTools } from "./tools/groups.js";
import { registerProfileTools } from "./tools/profile.js";
import { registerIntegrationTools } from "./tools/integrations.js";
import { registerWebhookTools } from "./tools/webhooks.js";
import { registerContactTools } from "./tools/contacts.js";
import { registerLabelTools } from "./tools/labels.js";
import { registerResources } from "./resources/index.js";
import { startStdioServer } from "./transports/stdio.js";
import { startHttpServer, authStorage } from "./transports/sse.js";
import { success } from "./utils/response.js";
import { createHandler } from "./middleware/index.js";

interface SessionAuth {
  instanceName: string;
  instanceToken: string;
}

function getService(): EvolutionApiService {
  const auth = authStorage.getStore() as SessionAuth | undefined;
  return new EvolutionApiService(
    auth?.instanceName || config.evolutionApi.instanceName,
    auth?.instanceToken || config.evolutionApi.instanceToken
  );
}

const server = new McpServer({
  name: config.mcp.name,
  version: config.mcp.version
});

// ===== GENERAL =====
server.tool("getApiStatus", {}, createHandler("getApiStatus", async (ctx) => {
  const svc = getService();
  const info = await svc.getApiInfo();
  return success(ctx.tool, info);
}));

// ===== DOMAIN-SCOPED TOOLS =====
registerInstanceTools(server, getService);
registerMessageTools(server, getService);
registerChatTools(server, getService);
registerGroupTools(server, getService);
registerProfileTools(server, getService);
registerIntegrationTools(server, getService);
registerWebhookTools(server, getService);
registerContactTools(server, getService);
registerLabelTools(server, getService);

// ===== RESOURCES =====
registerResources(server, getService);

// ===== TRANSPORT =====
const transportMode = process.env.MCP_TRANSPORT || "stdio";
const port = Number(process.env.PORT) || 3000;

if (transportMode === "http" || transportMode === "sse") {
  startHttpServer(server, port);
} else {
  startStdioServer(server);
}
