import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { EvolutionApiService } from "../services/evolutionApiService.js";
import { ArchiveChatSchema, MarkReadSchema, DeleteMessageSchema, CheckNumberSchema, ChatHistorySchema } from "../schemas/chats.js";
import { success } from "../utils/response.js";
import { createHandler } from "../middleware/index.js";

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

  server.tool("chats.history", ChatHistorySchema.shape, createHandler("chats.history", async (ctx) => {
    const { chatId, limit, offset } = ctx.input as any;
    const svc = getService();
    const result = await svc.fetchMessages(chatId, limit, offset);
    return success(ctx.tool, result);
  }));
}
