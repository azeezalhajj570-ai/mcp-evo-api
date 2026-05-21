import { z } from "zod";

export const SendTextSchema = z.object({
  number: z.string().min(1).describe("Recipient number in international format"),
  text: z.string().min(1).max(4096).describe("Message text"),
  options: z.object({
    delay: z.number().optional().describe("Delay in milliseconds"),
    presence: z.enum(["composing", "recording", "paused"]).optional().describe("Presence to show"),
    quotedMessageId: z.string().optional().describe("Message ID to quote")
  }).optional().describe("Optional send options")
});

export const SendMediaSchema = z.object({
  number: z.string().min(1).describe("Recipient number"),
  url: z.string().url().describe("Media URL"),
  caption: z.string().optional().describe("Caption"),
  fileName: z.string().optional().describe("File name"),
  mediaType: z.enum(["image", "document", "video", "audio"]).describe("Media type")
});

export const SendAudioSchema = z.object({
  number: z.string().min(1).describe("Recipient number"),
  url: z.string().url().describe("Audio URL"),
  ptt: z.boolean().optional().describe("Push-to-talk")
});

export const SendStickerSchema = z.object({
  number: z.string().min(1).describe("Recipient number"),
  url: z.string().url().describe("Sticker URL")
});

export const SendLocationSchema = z.object({
  number: z.string().min(1).describe("Recipient number"),
  lat: z.number().describe("Latitude"),
  lng: z.number().describe("Longitude"),
  title: z.string().optional().describe("Location title"),
  address: z.string().optional().describe("Location address")
});

export const SendContactSchema = z.object({
  number: z.string().min(1).describe("Recipient number"),
  fullName: z.string().min(1).describe("Contact full name"),
  wuid: z.string().min(1).describe("WhatsApp ID"),
  phoneNumber: z.string().min(1).describe("Phone number")
});

export const SendPollSchema = z.object({
  number: z.string().min(1).describe("Recipient number"),
  name: z.string().min(1).describe("Poll question"),
  options: z.array(z.string()).min(2).describe("Answer options"),
  multipleChoice: z.boolean().optional().describe("Allow multiple choices")
});

export const SendReactionSchema = z.object({
  messageId: z.string().min(1).describe("Message ID to react to"),
  remoteJid: z.string().min(1).describe("Remote JID of the message"),
  reaction: z.string().min(1).describe("Reaction emoji")
});

export const SendStatusSchema = z.object({
  type: z.enum(["text", "image", "video", "audio"]).describe("Status type"),
  content: z.string().min(1).describe("Text content or media URL"),
  caption: z.string().optional().describe("Caption for media status")
});

export const UpdateMessageSchema = z.object({
  messageId: z.string().min(1).describe("Message ID to update"),
  text: z.string().min(1).describe("New message text")
});

export const SearchMessagesSchema = z.object({
  query: z.string().min(1).describe("Search query"),
  chatId: z.string().optional().describe("Chat ID to scope search")
});
