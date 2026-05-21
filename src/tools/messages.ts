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
import { success, error, mcpText } from "../utils/response.js";
import { ErrorCodes } from "../types/response.js";

const TOOL = "messages";

export function registerMessageTools(server: McpServer, getService: () => EvolutionApiService): void {

  server.tool("messages.send_text", SendTextSchema.shape, async ({ number, text, options }) => {
    const start = Date.now();
    try {
      const svc = getService();
      const result = await svc.sendTextMessage({ number, text, options });
      return mcpText(success("messages.send_text", result, Date.now() - start));
    } catch (e) {
      return mcpText(error("messages.send_text", ErrorCodes.EXTERNAL_API_ERROR, (e as Error).message, true));
    }
  });

  server.tool("messages.send_image", {
    number: z.string().min(1).describe("Recipient number"),
    url: z.string().url().describe("Image URL"),
    caption: z.string().optional().describe("Caption")
  }, async ({ number, url, caption }) => {
    const start = Date.now();
    try {
      const svc = getService();
      const result = await svc.sendMedia({ number, media: { url, caption, mediaType: "image" } });
      return mcpText(success("messages.send_image", result, Date.now() - start));
    } catch (e) {
      return mcpText(error("messages.send_image", ErrorCodes.EXTERNAL_API_ERROR, (e as Error).message, true));
    }
  });

  server.tool("messages.send_document", {
    number: z.string().min(1).describe("Recipient number"),
    url: z.string().url().describe("Document URL"),
    fileName: z.string().optional().describe("File name"),
    caption: z.string().optional().describe("Caption")
  }, async ({ number, url, fileName, caption }) => {
    const start = Date.now();
    try {
      const svc = getService();
      const result = await svc.sendMedia({ number, media: { url, fileName, caption, mediaType: "document" } });
      return mcpText(success("messages.send_document", result, Date.now() - start));
    } catch (e) {
      return mcpText(error("messages.send_document", ErrorCodes.EXTERNAL_API_ERROR, (e as Error).message, true));
    }
  });

  server.tool("messages.send_audio", SendAudioSchema.shape, async ({ number, url, ptt }) => {
    const start = Date.now();
    try {
      const svc = getService();
      const result = await svc.sendAudio({ number, audio: { url, ptt } });
      return mcpText(success("messages.send_audio", result, Date.now() - start));
    } catch (e) {
      return mcpText(error("messages.send_audio", ErrorCodes.EXTERNAL_API_ERROR, (e as Error).message, true));
    }
  });

  server.tool("messages.send_sticker", SendStickerSchema.shape, async ({ number, url }) => {
    const start = Date.now();
    try {
      const svc = getService();
      const result = await svc.sendSticker({ number, sticker: { url } });
      return mcpText(success("messages.send_sticker", result, Date.now() - start));
    } catch (e) {
      return mcpText(error("messages.send_sticker", ErrorCodes.EXTERNAL_API_ERROR, (e as Error).message, true));
    }
  });

  server.tool("messages.send_location", SendLocationSchema.shape, async ({ number, lat, lng, title, address }) => {
    const start = Date.now();
    try {
      const svc = getService();
      const result = await svc.sendLocation({ number, location: { lat, lng, title, address } });
      return mcpText(success("messages.send_location", result, Date.now() - start));
    } catch (e) {
      return mcpText(error("messages.send_location", ErrorCodes.EXTERNAL_API_ERROR, (e as Error).message, true));
    }
  });

  server.tool("messages.send_contact", SendContactSchema.shape, async ({ number, fullName, wuid, phoneNumber }) => {
    const start = Date.now();
    try {
      const svc = getService();
      const result = await svc.sendContact({ number, contact: { fullName, wuid, phoneNumber } });
      return mcpText(success("messages.send_contact", result, Date.now() - start));
    } catch (e) {
      return mcpText(error("messages.send_contact", ErrorCodes.EXTERNAL_API_ERROR, (e as Error).message, true));
    }
  });

  server.tool("messages.send_poll", SendPollSchema.shape, async ({ number, name, options, multipleChoice }) => {
    const start = Date.now();
    try {
      const svc = getService();
      const result = await svc.sendPoll({ number, poll: { name, options, multipleChoice } });
      return mcpText(success("messages.send_poll", result, Date.now() - start));
    } catch (e) {
      return mcpText(error("messages.send_poll", ErrorCodes.EXTERNAL_API_ERROR, (e as Error).message, true));
    }
  });

  server.tool("messages.send_reaction", {
    messageId: z.string().min(1).describe("Message ID to react to"),
    remoteJid: z.string().min(1).describe("Remote JID of the message"),
    reaction: z.string().min(1).describe("Reaction emoji")
  }, async ({ messageId, remoteJid, reaction }) => {
    const start = Date.now();
    try {
      const svc = getService();
      const result = await svc.sendReaction({
        reactionMessage: { key: { id: messageId, remoteJid }, reaction }
      });
      return mcpText(success("messages.send_reaction", result, Date.now() - start));
    } catch (e) {
      return mcpText(error("messages.send_reaction", ErrorCodes.EXTERNAL_API_ERROR, (e as Error).message, true));
    }
  });

  server.tool("messages.send_status", {
    type: z.enum(["text", "image", "video", "audio"]).describe("Status type"),
    content: z.string().min(1).describe("Text content or media URL"),
    caption: z.string().optional().describe("Caption for media status")
  }, async ({ type, content, caption }) => {
    const start = Date.now();
    try {
      const svc = getService();
      const result = await svc.sendStatus({ status: { type, content, caption } });
      return mcpText(success("messages.send_status", result, Date.now() - start));
    } catch (e) {
      return mcpText(error("messages.send_status", ErrorCodes.EXTERNAL_API_ERROR, (e as Error).message, true));
    }
  });

  server.tool("messages.send_template", {
    number: z.string().min(1).describe("Recipient number"),
    namespace: z.string().min(1).describe("Template namespace"),
    name: z.string().min(1).describe("Template name"),
    languageCode: z.string().min(1).describe("Language code (e.g. en_US)")
  }, async ({ number, namespace, name, languageCode }) => {
    const start = Date.now();
    try {
      const svc = getService();
      const result = await svc.sendTemplate({
        number,
        template: { namespace, name, language: { code: languageCode }, components: [] }
      });
      return mcpText(success("messages.send_template", result, Date.now() - start));
    } catch (e) {
      return mcpText(error("messages.send_template", ErrorCodes.EXTERNAL_API_ERROR, (e as Error).message, true));
    }
  });

  server.tool("messages.send_list", {
    number: z.string().min(1).describe("Recipient number"),
    title: z.string().min(1).describe("List title"),
    description: z.string().min(1).describe("List description"),
    buttonText: z.string().min(1).describe("Button text"),
    sections: z.string().min(1).describe("JSON string of sections array")
  }, async ({ number, title, description, buttonText, sections }) => {
    const start = Date.now();
    try {
      const svc = getService();
      const parsed = JSON.parse(sections);
      const result = await svc.sendList({ number, list: { title, description, buttonText, sections: parsed } });
      return mcpText(success("messages.send_list", result, Date.now() - start));
    } catch (e) {
      if (e instanceof SyntaxError) {
        return mcpText(error("messages.send_list", ErrorCodes.INVALID_INPUT, "Invalid JSON in sections field"));
      }
      return mcpText(error("messages.send_list", ErrorCodes.EXTERNAL_API_ERROR, (e as Error).message, true));
    }
  });

  server.tool("messages.update", UpdateMessageSchema.shape, async ({ messageId, text }) => {
    const start = Date.now();
    try {
      const svc = getService();
      const result = await svc.updateMessage(messageId, text);
      return mcpText(success("messages.update", result, Date.now() - start));
    } catch (e) {
      return mcpText(error("messages.update", ErrorCodes.EXTERNAL_API_ERROR, (e as Error).message, true));
    }
  });

  server.tool("messages.search", SearchMessagesSchema.shape, async ({ query, chatId }) => {
    const start = Date.now();
    try {
      const svc = getService();
      const result = await svc.findMessages(query, chatId);
      return mcpText(success("messages.search", result, Date.now() - start));
    } catch (e) {
      return mcpText(error("messages.search", ErrorCodes.EXTERNAL_API_ERROR, (e as Error).message, true));
    }
  });
}
