import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { EvolutionApiService } from "../services/evolutionApiService.js";
import { success } from "../utils/response.js";
import { createHandler } from "../middleware/index.js";
import { sanitizeContact } from "../utils/sanitize.js";

export function registerContactTools(server: McpServer, getService: () => EvolutionApiService): void {

  server.tool("contacts.list", {}, createHandler("contacts.list", async (ctx) => {
    const svc = getService();
    const contacts = await svc.fetchContacts();
    const list = contacts?.data ?? contacts ?? [];
    return success(ctx.tool, (Array.isArray(list) ? list : []).map(sanitizeContact));
  }));

  server.tool("contacts.find", {
    query: z.string().min(1).describe("Name or number to search for")
  }, createHandler("contacts.find", async (ctx) => {
    const { query } = ctx.input as { query: string };
    const svc = getService();
    const isNumber = /^\d+$/.test(query.replace(/[^0-9]/g, ""));
    if (isNumber) {
      const result = await svc.fetchContacts({ id: query });
      const list = result?.data ?? result ?? [];
      return success(ctx.tool, (Array.isArray(list) ? list : []).map(sanitizeContact));
    }
    const contacts = await svc.fetchContacts();
    const list = contacts?.data ?? contacts ?? [];
    const q = query.toLowerCase();
    const matches = (Array.isArray(list) ? list : []).filter((c: any) =>
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.pushname && c.pushname.toLowerCase().includes(q)) ||
      (c.id && c.id.toLowerCase().includes(q))
    );
    return success(ctx.tool, matches.map(sanitizeContact));
  }));
}
