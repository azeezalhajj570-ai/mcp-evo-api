import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { EvolutionApiService } from "../services/evolutionApiService.js";
import { SetPresenceSchema } from "../schemas/instances.js";
import { success, error, mcpText } from "../utils/response.js";
import { ErrorCodes } from "../types/response.js";

const TOOL = "instances";

export function registerInstanceTools(server: McpServer, getService: () => EvolutionApiService): void {

  server.tool("instances.list", {}, async () => {
    const start = Date.now();
    try {
      const svc = getService();
      const instances = await svc.fetchInstances();
      const list = Array.isArray(instances) ? instances : [];
      return mcpText(success(TOOL, list, Date.now() - start));
    } catch (e) {
      return mcpText(error(TOOL, ErrorCodes.EXTERNAL_API_ERROR, (e as Error).message, true));
    }
  });

  server.tool("instances.status", {}, async () => {
    const start = Date.now();
    try {
      const svc = getService();
      const status = await svc.getInstanceStatus();
      return mcpText(success("instances.status", status, Date.now() - start));
    } catch (e) {
      return mcpText(error("instances.status", ErrorCodes.EXTERNAL_API_ERROR, (e as Error).message, true));
    }
  });

  server.tool("instances.restart", {}, async () => {
    const start = Date.now();
    try {
      const svc = getService();
      await svc.restartInstance();
      return mcpText(success("instances.restart", { restarted: true }, Date.now() - start));
    } catch (e) {
      return mcpText(error("instances.restart", ErrorCodes.EXTERNAL_API_ERROR, (e as Error).message, true));
    }
  });

  server.tool("instances.logout", {}, async () => {
    const start = Date.now();
    try {
      const svc = getService();
      await svc.logout();
      return mcpText(success("instances.logout", { loggedOut: true }, Date.now() - start));
    } catch (e) {
      return mcpText(error("instances.logout", ErrorCodes.EXTERNAL_API_ERROR, (e as Error).message, true));
    }
  });

  server.tool("instances.presence", SetPresenceSchema.shape, async ({ presence }) => {
    const start = Date.now();
    try {
      const svc = getService();
      await svc.setPresence(presence);
      return mcpText(success("instances.presence", { presence }, Date.now() - start));
    } catch (e) {
      return mcpText(error("instances.presence", ErrorCodes.EXTERNAL_API_ERROR, (e as Error).message, true));
    }
  });

  server.tool("instances.create", {
    instanceName: z.string().min(1).describe("Name for the new instance")
  }, async ({ instanceName }) => {
    const start = Date.now();
    try {
      const svc = getService();
      const result = await svc.createInstance(instanceName);
      return mcpText(success("instances.create", result ?? { instanceName }, Date.now() - start));
    } catch (e) {
      return mcpText(error("instances.create", ErrorCodes.EXTERNAL_API_ERROR, (e as Error).message, true));
    }
  });

  server.tool("instances.delete", {}, async () => {
    const start = Date.now();
    try {
      const svc = getService();
      await svc.deleteInstance();
      return mcpText(success("instances.delete", { deleted: true }, Date.now() - start));
    } catch (e) {
      return mcpText(error("instances.delete", ErrorCodes.EXTERNAL_API_ERROR, (e as Error).message, true));
    }
  });
}
