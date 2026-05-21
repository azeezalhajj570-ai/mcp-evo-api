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
