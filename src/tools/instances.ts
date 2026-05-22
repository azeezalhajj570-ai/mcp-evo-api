import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { EvolutionApiService } from "../services/evolutionApiService.js";
import { SetPresenceSchema } from "../schemas/instances.js";
import { success, error } from "../utils/response.js";
import { ErrorCodes } from "../types/response.js";
import { createHandler } from "../middleware/index.js";

export function registerInstanceTools(server: McpServer, getService: () => EvolutionApiService): void {

  server.tool("instances.status", {}, createHandler("instances.status", async (ctx) => {
    const svc = getService();
    const status = await svc.getInstanceStatus();
    return success(ctx.tool, status);
  }));

  server.tool("instances.restart", {}, createHandler("instances.restart", async (ctx) => {
    const svc = getService();
    await svc.restartInstance();
    return success(ctx.tool, { restarted: true });
  }));

  server.tool("instances.logout", {}, createHandler("instances.logout", async (ctx) => {
    const svc = getService();
    await svc.logout();
    return success(ctx.tool, { loggedOut: true });
  }));

  server.tool("instances.presence", SetPresenceSchema.shape, createHandler("instances.presence", async (ctx) => {
    const { presence } = ctx.input as z.infer<typeof SetPresenceSchema>;
    const svc = getService();
    await svc.setPresence(presence);
    return success(ctx.tool, { presence });
  }));

  server.tool("instances.create", {
    instanceName: z.string().min(1).describe("Name for the new instance")
  }, createHandler("instances.create", async (ctx) => {
    const { instanceName } = ctx.input as { instanceName: string };
    const svc = getService();
    const result = await svc.createInstance(instanceName);
    return success(ctx.tool, result ?? { instanceName });
  }));

  server.tool("instances.delete", {}, createHandler("instances.delete", async (ctx) => {
    const svc = getService();
    await svc.deleteInstance();
    return success(ctx.tool, { deleted: true });
  }));
}
