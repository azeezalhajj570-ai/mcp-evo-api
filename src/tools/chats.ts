import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { EvolutionApiService } from "../services/evolutionApiService.js";
import { ArchiveChatSchema, MarkReadSchema, DeleteMessageSchema, CheckNumberSchema, ChatHistorySchema } from "../schemas/chats.js";
import { success } from "../utils/response.js";
import { createHandler } from "../middleware/index.js";
import { sanitizeChat, sanitizeMessage } from "../utils/sanitize.js";

export function registerChatTools(server: McpServer, getService: () => EvolutionApiService): void {

  server.tool("chats.archive", ArchiveChatSchema.shape, createHandler("chats.archive", async (ctx) => {
    const { number, shouldArchive } = ctx.input as any;
    const svc = getService();
    const result = await svc.archiveChat(number, shouldArchive);
    return success(ctx.tool, result ?? { archived: shouldArchive });
  }));

  server.tool("chats.unarchive", {
    number: z.string().min(1).describe("Number in international format")
  }, createHandler("chats.unarchive", async (ctx) => {
    const { number } = ctx.input as any;
    const svc = getService();
    const result = await svc.archiveChat(number, false);
    return success(ctx.tool, result ?? { unarchived: true });
  }));

  server.tool("chats.mark_read", MarkReadSchema.shape, createHandler("chats.mark_read", async (ctx) => {
    const { messageId } = ctx.input as any;
    const svc = getService();
    const result = await svc.markMessageAsRead(messageId);
    return success(ctx.tool, result);
  }));

  server.tool("chats.check_number", CheckNumberSchema.shape, createHandler("chats.check_number", async (ctx) => {
    const { phone } = ctx.input as any;
    const svc = getService();
    const result = await svc.checkWhatsAppNumber({ phone });
    return success(ctx.tool, result);
  }));

  server.tool("chats.delete_message", DeleteMessageSchema.shape, createHandler("chats.delete_message", async (ctx) => {
    const { messageId } = ctx.input as any;
    const svc = getService();
    const result = await svc.deleteMessageForEveryone(messageId);
    return success(ctx.tool, result);
  }));

  server.tool("chats.business_profile", {
    number: z.string().min(1).describe("Number to fetch business profile for")
  }, createHandler("chats.business_profile", async (ctx) => {
    const { number } = ctx.input as any;
    const svc = getService();
    const result = await svc.fetchProfilePictureUrl(number);
    return success(ctx.tool, result);
  }));

  server.tool("chats.search", {
    query: z.string().min(1).describe("Search query"),
    chatId: z.string().optional().describe("Optional chat JID to scope the search")
  }, createHandler("chats.search", async (ctx) => {
    const { query, chatId } = ctx.input as any;
    const svc = getService();
    const result = await svc.findMessages(query, chatId);
    const msgs = result?.messages?.records ?? result?.records ?? result ?? [];
    return success(ctx.tool, (Array.isArray(msgs) ? msgs : []).map(sanitizeMessage));
  }));

  server.tool("chats.list", {}, createHandler("chats.list", async (ctx) => {
    const svc = getService();
    const chats = await svc.fetchChats();
    const list = chats?.data ?? chats ?? [];
    return success(ctx.tool, (Array.isArray(list) ? list : []).map(sanitizeChat));
  }));

  server.tool("chats.recent", {
    limit: z.number().int().min(1).max(100).optional().describe("Number of recent chats to return (default 10)")
  }, createHandler("chats.recent", async (ctx) => {
    const { limit = 10 } = ctx.input as { limit?: number };
    const svc = getService();
    const chats = await svc.fetchChats();
    const list = chats?.data ?? chats ?? [];
    const sorted = (Array.isArray(list) ? list : []).sort((a: any, b: any) => {
      const tA = a.lastMessage?.timestamp || a.timestamp || 0;
      const tB = b.lastMessage?.timestamp || b.timestamp || 0;
      return tB - tA;
    });
    return success(ctx.tool, sorted.slice(0, limit).map(sanitizeChat));
  }));

  server.tool("chats.history", ChatHistorySchema.shape, createHandler("chats.history", async (ctx) => {
    const { remoteJid, limit, offset } = ctx.input as any;
    const svc = getService();
    const result = await svc.fetchMessages(remoteJid);
    const msgs = result?.messages?.records ?? result?.records ?? result ?? [];
    const sliced = Array.isArray(msgs) ? msgs.slice(offset ?? 0, (offset ?? 0) + (limit ?? 50)) : [];
    return success(ctx.tool, sliced.map(sanitizeMessage));
  }));
}
