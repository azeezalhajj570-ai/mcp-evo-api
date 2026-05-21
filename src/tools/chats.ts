import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { EvolutionApiService } from "../services/evolutionApiService.js";
import { ArchiveChatSchema, MarkReadSchema, DeleteMessageSchema, CheckNumberSchema } from "../schemas/chats.js";
import { success, error, mcpText } from "../utils/response.js";
import { ErrorCodes } from "../types/response.js";

const TOOL = "chats";

export function registerChatTools(server: McpServer, getService: () => EvolutionApiService): void {

  server.tool("chats.archive", ArchiveChatSchema.shape, async ({ number, shouldArchive }) => {
    const start = Date.now();
    try {
      const svc = getService();
      const result = await svc.archiveChat(number, shouldArchive);
      return mcpText(success("chats.archive", result ?? { archived: shouldArchive }, Date.now() - start));
    } catch (e) {
      return mcpText(error("chats.archive", ErrorCodes.EXTERNAL_API_ERROR, (e as Error).message, true));
    }
  });

  server.tool("chats.unarchive", {
    number: z.string().min(1).describe("Number in international format")
  }, async ({ number }) => {
    const start = Date.now();
    try {
      const svc = getService();
      const result = await svc.archiveChat(number, false);
      return mcpText(success("chats.unarchive", result ?? { unarchived: true }, Date.now() - start));
    } catch (e) {
      return mcpText(error("chats.unarchive", ErrorCodes.EXTERNAL_API_ERROR, (e as Error).message, true));
    }
  });

  server.tool("chats.mark_read", MarkReadSchema.shape, async ({ messageId }) => {
    const start = Date.now();
    try {
      const svc = getService();
      const result = await svc.markMessageAsRead(messageId);
      return mcpText(success("chats.mark_read", result, Date.now() - start));
    } catch (e) {
      return mcpText(error("chats.mark_read", ErrorCodes.EXTERNAL_API_ERROR, (e as Error).message, true));
    }
  });

  server.tool("chats.check_number", CheckNumberSchema.shape, async ({ phone }) => {
    const start = Date.now();
    try {
      const svc = getService();
      const result = await svc.checkWhatsAppNumber({ phone });
      return mcpText(success("chats.check_number", result, Date.now() - start));
    } catch (e) {
      return mcpText(error("chats.check_number", ErrorCodes.EXTERNAL_API_ERROR, (e as Error).message, true));
    }
  });

  server.tool("chats.delete_message", DeleteMessageSchema.shape, async ({ messageId }) => {
    const start = Date.now();
    try {
      const svc = getService();
      const result = await svc.deleteMessageForEveryone(messageId);
      return mcpText(success("chats.delete_message", result, Date.now() - start));
    } catch (e) {
      return mcpText(error("chats.delete_message", ErrorCodes.EXTERNAL_API_ERROR, (e as Error).message, true));
    }
  });

  server.tool("chats.business_profile", {
    number: z.string().min(1).describe("Number to fetch business profile for")
  }, async ({ number }) => {
    const start = Date.now();
    try {
      const svc = getService();
      const result = await svc.fetchProfilePictureUrl(number);
      return mcpText(success("chats.business_profile", result, Date.now() - start));
    } catch (e) {
      return mcpText(error("chats.business_profile", ErrorCodes.EXTERNAL_API_ERROR, (e as Error).message, true));
    }
  });
}
