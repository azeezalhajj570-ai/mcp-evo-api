import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { EvolutionApiService } from "../services/evolutionApiService.js";
import {
  SendTextSchema,
  SendAudioSchema,
  SendStickerSchema,
  SendLocationSchema,
  SendContactSchema,
  SendPollSchema,
  UpdateMessageSchema,
  SearchMessagesSchema
} from "../schemas/messages.js";
import { success, error } from "../utils/response.js";
import { ErrorCodes } from "../types/response.js";
import { createHandler } from "../middleware/index.js";

export function registerMessageTools(server: McpServer, getService: () => EvolutionApiService): void {

  server.tool("messages.send_text", SendTextSchema.shape, createHandler("messages.send_text", async (ctx) => {
    const { number, text, options } = ctx.input as any;
    const svc = getService();
    const result = await svc.sendTextMessage({ number, text, options });
    return success(ctx.tool, result);
  }));

  server.tool("messages.send_image", {
    number: z.string().min(1).describe("Recipient number"),
    url: z.string().url().describe("Image URL"),
    caption: z.string().optional().describe("Caption")
  }, createHandler("messages.send_image", async (ctx) => {
    const { number, url, caption } = ctx.input as any;
    const svc = getService();
    const result = await svc.sendMedia({ number, media: { url, caption, mediaType: "image" } });
    return success(ctx.tool, result);
  }));

  server.tool("messages.send_document", {
    number: z.string().min(1).describe("Recipient number"),
    url: z.string().url().describe("Document URL"),
    fileName: z.string().optional().describe("File name"),
    caption: z.string().optional().describe("Caption")
  }, createHandler("messages.send_document", async (ctx) => {
    const { number, url, fileName, caption } = ctx.input as any;
    const svc = getService();
    const result = await svc.sendMedia({ number, media: { url, fileName, caption, mediaType: "document" } });
    return success(ctx.tool, result);
  }));

  server.tool("messages.send_audio", SendAudioSchema.shape, createHandler("messages.send_audio", async (ctx) => {
    const { number, url, ptt } = ctx.input as any;
    const svc = getService();
    const result = await svc.sendAudio({ number, audio: { url, ptt } });
    return success(ctx.tool, result);
  }));

  server.tool("messages.send_sticker", SendStickerSchema.shape, createHandler("messages.send_sticker", async (ctx) => {
    const { number, url } = ctx.input as any;
    const svc = getService();
    const result = await svc.sendSticker({ number, sticker: { url } });
    return success(ctx.tool, result);
  }));

  server.tool("messages.send_location", SendLocationSchema.shape, createHandler("messages.send_location", async (ctx) => {
    const { number, lat, lng, title, address } = ctx.input as any;
    const svc = getService();
    const result = await svc.sendLocation({ number, location: { lat, lng, title, address } });
    return success(ctx.tool, result);
  }));

  server.tool("messages.send_contact", SendContactSchema.shape, createHandler("messages.send_contact", async (ctx) => {
    const { number, fullName, wuid, phoneNumber } = ctx.input as any;
    const svc = getService();
    const result = await svc.sendContact({ number, contact: { fullName, wuid, phoneNumber } });
    return success(ctx.tool, result);
  }));

  server.tool("messages.send_poll", SendPollSchema.shape, createHandler("messages.send_poll", async (ctx) => {
    const { number, name, options, multipleChoice } = ctx.input as any;
    const svc = getService();
    const result = await svc.sendPoll({ number, poll: { name, options, multipleChoice } });
    return success(ctx.tool, result);
  }));

  server.tool("messages.send_reaction", {
    messageId: z.string().min(1).describe("Message ID to react to"),
    remoteJid: z.string().min(1).describe("Remote JID of the message"),
    reaction: z.string().min(1).describe("Reaction emoji")
  }, createHandler("messages.send_reaction", async (ctx) => {
    const { messageId, remoteJid, reaction } = ctx.input as any;
    const svc = getService();
    const result = await svc.sendReaction({
      reactionMessage: { key: { id: messageId, remoteJid }, reaction }
    });
    return success(ctx.tool, result);
  }));

  server.tool("messages.send_status", {
    type: z.enum(["text", "image", "video", "audio"]).describe("Status type"),
    content: z.string().min(1).describe("Text content or media URL"),
    caption: z.string().optional().describe("Caption for media status")
  }, createHandler("messages.send_status", async (ctx) => {
    const { type, content, caption } = ctx.input as any;
    const svc = getService();
    const result = await svc.sendStatus({ status: { type, content, caption } });
    return success(ctx.tool, result);
  }));

  server.tool("messages.send_template", {
    number: z.string().min(1).describe("Recipient number"),
    namespace: z.string().min(1).describe("Template namespace"),
    name: z.string().min(1).describe("Template name"),
    languageCode: z.string().min(1).describe("Language code (e.g. en_US)")
  }, createHandler("messages.send_template", async (ctx) => {
    const { number, namespace, name, languageCode } = ctx.input as any;
    const svc = getService();
    const result = await svc.sendTemplate({
      number,
      template: { namespace, name, language: { code: languageCode }, components: [] }
    });
    return success(ctx.tool, result);
  }));

  server.tool("messages.send_list", {
    number: z.string().min(1).describe("Recipient number"),
    title: z.string().min(1).describe("List title"),
    description: z.string().min(1).describe("List description"),
    buttonText: z.string().min(1).describe("Button text"),
    sections: z.string().min(1).describe("JSON string of sections array")
  }, createHandler("messages.send_list", async (ctx) => {
    const { number, title, description, buttonText, sections } = ctx.input as any;
    const svc = getService();
    const parsed = JSON.parse(sections);
    const result = await svc.sendList({ number, list: { title, description, buttonText, sections: parsed } });
    return success(ctx.tool, result);
  }));

  server.tool("messages.update", UpdateMessageSchema.shape, createHandler("messages.update", async (ctx) => {
    const { messageId, text } = ctx.input as any;
    const svc = getService();
    const result = await svc.updateMessage(messageId, text);
    return success(ctx.tool, result);
  }));

  server.tool("messages.search", SearchMessagesSchema.shape, createHandler("messages.search", async (ctx) => {
    const { query, chatId } = ctx.input as any;
    const svc = getService();
    const result = await svc.findMessages(query, chatId);
    return success(ctx.tool, result);
  }));
}
