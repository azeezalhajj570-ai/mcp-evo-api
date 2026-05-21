import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { EvolutionApiService } from "../services/evolutionApiService.js";
import { success } from "../utils/response.js";
import { createHandler } from "../middleware/index.js";
import { sanitizeLabel } from "../utils/sanitize.js";

export function registerLabelTools(server: McpServer, getService: () => EvolutionApiService): void {

  server.tool("labels.list", {}, createHandler("labels.list", async (ctx) => {
    const svc = getService();
    const labels = await svc.findLabels();
    const list = Array.isArray(labels) ? labels : [];
    return success(ctx.tool, list.map(sanitizeLabel));
  }));

  server.tool("labels.add", {
    number: z.string().min(1).describe("Contact number to label"),
    labelId: z.string().min(1).describe("Label ID to assign")
  }, createHandler("labels.add", async (ctx) => {
    const { number, labelId } = ctx.input as { number: string; labelId: string };
    const svc = getService();
    const result = await svc.handleLabel(number, labelId, "add");
    return success(ctx.tool, result);
  }));

  server.tool("labels.remove", {
    number: z.string().min(1).describe("Contact number to unlabel"),
    labelId: z.string().min(1).describe("Label ID to remove")
  }, createHandler("labels.remove", async (ctx) => {
    const { number, labelId } = ctx.input as { number: string; labelId: string };
    const svc = getService();
    const result = await svc.handleLabel(number, labelId, "remove");
    return success(ctx.tool, result);
  }));


}
