import { z } from "zod";

export const ArchiveChatSchema = z.object({
  number: z.string().min(1).describe("Number in international format"),
  shouldArchive: z.boolean().default(true).describe("True to archive, false to unarchive")
});

export const MarkReadSchema = z.object({
  messageId: z.string().min(1).describe("Message ID to mark as read")
});

export const DeleteMessageSchema = z.object({
  messageId: z.string().min(1).describe("Message ID to delete")
});

export const CheckNumberSchema = z.object({
  phone: z.string().min(1).describe("Number to check in international format")
});

export const ChatHistorySchema = z.object({
  remoteJid: z.string().min(1).describe("Chat JID (e.g. 967774544394@s.whatsapp.net or 97899618795753@lid). Get this from chats.recent."),
  limit: z.number().int().min(1).max(500).optional().describe("Number of messages per page (default 50)"),
  offset: z.number().int().min(0).optional().describe("Offset for pagination (default 0)")
});
