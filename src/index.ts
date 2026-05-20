// @ts-nocheck
import { AsyncLocalStorage } from "async_hooks";
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { z } from "zod";
import http from "http";
import "dotenv/config";
import { config } from "./config.js";
import { EvolutionApiService } from "./services/evolutionApiService.js";

// Per-session auth context — set from SSE headers, falls back to env for STDIO
const authStorage = new AsyncLocalStorage<{ instanceName: string; instanceToken: string }>();

function getService(): EvolutionApiService {
  const auth = authStorage.getStore();
  return new EvolutionApiService(
    auth?.instanceName || config.evolutionApi.instanceId,
    auth?.instanceToken || config.evolutionApi.instanceToken
  );
}

// Create the MCP server
const server = new McpServer({
  name: config.mcp.name,
  version: config.mcp.version
});

// ===== GENERAL INFO =====

server.tool("getApiStatus", {}, async () => {
  try {
    const svc = getService();
    const apiInfo = await svc.getApiInfo();
    return { content: [{ type: "text", text: `Evolution API v${apiInfo.version} running. Status: ${apiInfo.status}` }] };
  } catch (error) {
    return { content: [{ type: "text", text: `Error: ${(error as Error).message}` }] };
  }
});

// ===== INSTANCE MANAGEMENT =====

server.tool("getInstanceStatus", {}, async () => {
  try {
    const svc = getService();
    const status = await svc.getInstanceStatus();
    return {
      content: [{
        type: "text",
        text: `Instance "${status.instanceName || svc.instanceId}" status: ${status.state || status.connectionStatus || "Unknown"}`
      }]
    };
  } catch (error) {
    return { content: [{ type: "text", text: `Error: ${(error as Error).message}` }] };
  }
});

server.tool("fetchInstances", {}, async () => {
  try {
    const svc = getService();
    const status = await svc.getInstanceStatus();
    return {
      content: [{
        type: "text",
        text: `Instance "${status.instanceName || svc.instanceId}" — status: ${status.state || status.connectionStatus || "Unknown"}`
      }]
    };
  } catch (error) {
    return { content: [{ type: "text", text: `Error: ${(error as Error).message}` }] };
  }
});

server.tool("restartInstance", {}, async () => {
  try {
    const svc = getService();
    await svc.restartInstance();
    return { content: [{ type: "text", text: "Instance restarted successfully." }] };
  } catch (error) {
    return { content: [{ type: "text", text: `Error: ${(error as Error).message}` }] };
  }
});

server.tool("logoutInstance", {}, async () => {
  try {
    const svc = getService();
    await svc.logout();
    return { content: [{ type: "text", text: "Instance logged out successfully." }] };
  } catch (error) {
    return { content: [{ type: "text", text: `Error: ${(error as Error).message}` }] };
  }
});

server.tool("setPresence", {
  presence: z.enum(["available", "unavailable", "composing", "recording", "paused"])
    .describe("Presence status to set")
}, async ({ presence }) => {
  try {
    const svc = getService();
    await svc.setPresence(presence);
    return { content: [{ type: "text", text: `Presence set to "${presence}" successfully.` }] };
  } catch (error) {
    return { content: [{ type: "text", text: `Error: ${(error as Error).message}` }] };
  }
});

// ===== MESSAGES =====

server.tool("sendTextMessage", {
  number: z.string().min(1).describe("Recipient number in international format"),
  text: z.string().min(1).describe("Message text"),
  options: z.object({
    delay: z.number().optional().describe("Delay in milliseconds"),
    presence: z.enum(["composing", "recording", "paused"]).optional().describe("Presence to show"),
    quotedMessageId: z.string().optional().describe("Message ID to quote")
  }).optional().describe("Optional send options")
}, async ({ number, text, options }) => {
  try {
    const svc = getService();
    const result = await svc.sendTextMessage({ number, text, options });
    return { content: [{ type: "text", text: `Message sent: ${result?.key?.id || "ID unavailable"}` }] };
  } catch (error) {
    return { content: [{ type: "text", text: `Error: ${(error as Error).message}` }] };
  }
});

server.tool("sendMedia", {
  number: z.string().min(1).describe("Recipient number"),
  url: z.string().url().describe("Media URL"),
  caption: z.string().optional().describe("Caption"),
  fileName: z.string().optional().describe("File name"),
  mediaType: z.enum(["image", "document", "video", "audio"]).describe("Media type")
}, async ({ number, url, caption, fileName, mediaType }) => {
  try {
    const svc = getService();
    await svc.sendMedia({ number, media: { url, caption, fileName, mediaType } });
    return { content: [{ type: "text", text: "Media sent successfully." }] };
  } catch (error) {
    return { content: [{ type: "text", text: `Error: ${(error as Error).message}` }] };
  }
});

server.tool("sendAudio", {
  number: z.string().min(1).describe("Recipient number"),
  url: z.string().url().describe("Audio URL"),
  ptt: z.boolean().optional().describe("Push-to-talk")
}, async ({ number, url, ptt }) => {
  try {
    const svc = getService();
    await svc.sendAudio({ number, audio: { url, ptt } });
    return { content: [{ type: "text", text: "Audio sent successfully." }] };
  } catch (error) {
    return { content: [{ type: "text", text: `Error: ${(error as Error).message}` }] };
  }
});

server.tool("sendSticker", {
  number: z.string().min(1).describe("Recipient number"),
  url: z.string().url().describe("Sticker URL")
}, async ({ number, url }) => {
  try {
    const svc = getService();
    await svc.sendSticker({ number, sticker: { url } });
    return { content: [{ type: "text", text: "Sticker sent successfully." }] };
  } catch (error) {
    return { content: [{ type: "text", text: `Error: ${(error as Error).message}` }] };
  }
});

server.tool("sendLocation", {
  number: z.string().min(1).describe("Recipient number"),
  lat: z.number().describe("Latitude"),
  lng: z.number().describe("Longitude"),
  title: z.string().optional().describe("Location title"),
  address: z.string().optional().describe("Location address")
}, async ({ number, lat, lng, title, address }) => {
  try {
    const svc = getService();
    await svc.sendLocation({ number, location: { lat, lng, title, address } });
    return { content: [{ type: "text", text: "Location sent successfully." }] };
  } catch (error) {
    return { content: [{ type: "text", text: `Error: ${(error as Error).message}` }] };
  }
});

server.tool("sendContact", {
  number: z.string().min(1).describe("Recipient number"),
  fullName: z.string().min(1).describe("Contact full name"),
  wuid: z.string().min(1).describe("WhatsApp ID"),
  phoneNumber: z.string().min(1).describe("Phone number")
}, async ({ number, fullName, wuid, phoneNumber }) => {
  try {
    const svc = getService();
    await svc.sendContact({ number, contact: { fullName, wuid, phoneNumber } });
    return { content: [{ type: "text", text: "Contact sent successfully." }] };
  } catch (error) {
    return { content: [{ type: "text", text: `Error: ${(error as Error).message}` }] };
  }
});

server.tool("sendPoll", {
  number: z.string().min(1).describe("Recipient number"),
  name: z.string().min(1).describe("Poll question"),
  options: z.array(z.string()).min(2).describe("Answer options"),
  multipleChoice: z.boolean().optional().describe("Allow multiple choices")
}, async ({ number, name, options, multipleChoice }) => {
  try {
    const svc = getService();
    await svc.sendPoll({ number, poll: { name, options, multipleChoice } });
    return { content: [{ type: "text", text: "Poll sent successfully." }] };
  } catch (error) {
    return { content: [{ type: "text", text: `Error: ${(error as Error).message}` }] };
  }
});

// ===== CHAT MANAGEMENT =====

server.tool("checkWhatsAppNumber", {
  phone: z.string().min(1).describe("Number to check in international format")
}, async ({ phone }) => {
  try {
    const svc = getService();
    const result = await svc.checkWhatsAppNumber({ phone });
    const isWhatsApp = result?.numbers?.[0]?.exists || false;
    return { content: [{ type: "text", text: isWhatsApp ? `Number ${phone} is a valid WhatsApp.` : `Number ${phone} is NOT a valid WhatsApp.` }] };
  } catch (error) {
    return { content: [{ type: "text", text: `Error: ${(error as Error).message}` }] };
  }
});

server.tool("markMessageAsRead", {
  messageId: z.string().min(1).describe("Message ID to mark as read")
}, async ({ messageId }) => {
  try {
    const svc = getService();
    await svc.markMessageAsRead(messageId);
    return { content: [{ type: "text", text: "Message marked as read successfully." }] };
  } catch (error) {
    return { content: [{ type: "text", text: `Error: ${(error as Error).message}` }] };
  }
});

server.tool("archiveChat", {
  number: z.string().min(1).describe("Number in international format"),
  shouldArchive: z.boolean().default(true).describe("True to archive, false to unarchive")
}, async ({ number, shouldArchive }) => {
  try {
    const svc = getService();
    await svc.archiveChat(number);
    return { content: [{ type: "text", text: shouldArchive ? "Chat archived successfully." : "Chat unarchived successfully." }] };
  } catch (error) {
    return { content: [{ type: "text", text: `Error: ${(error as Error).message}` }] };
  }
});

server.tool("deleteMessageForEveryone", {
  messageId: z.string().min(1).describe("Message ID to delete")
}, async ({ messageId }) => {
  try {
    const svc = getService();
    await svc.deleteMessageForEveryone(messageId);
    return { content: [{ type: "text", text: "Message deleted for everyone successfully." }] };
  } catch (error) {
    return { content: [{ type: "text", text: `Error: ${(error as Error).message}` }] };
  }
});

// ===== PROFILE =====

server.tool("updateProfileName", {
  name: z.string().min(1).describe("New profile name")
}, async ({ name }) => {
  try {
    const svc = getService();
    await svc.updateProfileName(name);
    return { content: [{ type: "text", text: `Profile name updated to "${name}".` }] };
  } catch (error) {
    return { content: [{ type: "text", text: `Error: ${(error as Error).message}` }] };
  }
});

server.tool("updateProfileStatus", {
  status: z.string().min(1).describe("New profile status")
}, async ({ status }) => {
  try {
    const svc = getService();
    await svc.updateProfileStatus(status);
    return { content: [{ type: "text", text: `Profile status updated to "${status}".` }] };
  } catch (error) {
    return { content: [{ type: "text", text: `Error: ${(error as Error).message}` }] };
  }
});

// ===== GROUPS =====

server.tool("createGroup", {
  subject: z.string().min(1).describe("Group name"),
  participants: z.array(z.string()).min(1).describe("Participant numbers"),
  description: z.string().optional().describe("Group description")
}, async ({ subject, participants, description }) => {
  try {
    const svc = getService();
    const result = await svc.createGroup({ subject, participants, description });
    return { content: [{ type: "text", text: `Group "${subject}" created. ID: ${result.groupId}` }] };
  } catch (error) {
    return { content: [{ type: "text", text: `Error: ${(error as Error).message}` }] };
  }
});

server.tool("addGroupParticipants", {
  groupId: z.string().min(1).describe("Group ID"),
  participants: z.array(z.string()).min(1).describe("Participant numbers")
}, async ({ groupId, participants }) => {
  try {
    const svc = getService();
    await svc.updateGroupMembers({ groupJid: groupId, action: "add", participants });
    return { content: [{ type: "text", text: `${participants.length} participant(s) added.` }] };
  } catch (error) {
    return { content: [{ type: "text", text: `Error: ${(error as Error).message}` }] };
  }
});

// ===== RESOURCES =====

server.resource("contacts", new ResourceTemplate("contacts://list", { list: undefined }), async (uri) => {
  try {
    const svc = getService();
    const contactsData = await svc.fetchContacts();
    const contacts = contactsData?.data || [];
    return { contents: [{ uri: uri.href, text: `Contacts (${contacts.length}):\n${contacts.map((c: any) => `- ${c.name || "No name"}: ${c.id.replace("@c.us", "")}`).join("\n")}` }] };
  } catch (error) {
    return { contents: [{ uri: uri.href, text: `Error: ${(error as Error).message}` }] };
  }
});

server.resource("chats", new ResourceTemplate("chats://list", { list: undefined }), async (uri) => {
  try {
    const svc = getService();
    const chatsData = await svc.fetchChats();
    const chats = chatsData?.data || [];
    return { contents: [{ uri: uri.href, text: `Chats (${chats.length}):\n${chats.map((c: any) => `- ${c.name || c.id || "Unnamed chat"}`).join("\n")}` }] };
  } catch (error) {
    return { contents: [{ uri: uri.href, text: `Error: ${(error as Error).message}` }] };
  }
});

server.resource("groups", new ResourceTemplate("groups://list", { list: undefined }), async (uri) => {
  try {
    const svc = getService();
    const groupsData = await svc.fetchAllGroups();
    const groups = groupsData?.data || [];
    return { contents: [{ uri: uri.href, text: `Groups (${groups.length}):\n${groups.map((g: any) => `- ${g.subject || g.id || "Unnamed"} (${g.participants?.length || 0} members)`).join("\n")}` }] };
  } catch (error) {
    return { contents: [{ uri: uri.href, text: `Error: ${(error as Error).message}` }] };
  }
});

server.resource("profile", new ResourceTemplate("profile://info", { list: undefined }), async (uri) => {
  try {
    const svc = getService();
    const profile = await svc.fetchProfile();
    return { contents: [{ uri: uri.href, text: `Profile:\n- Name: ${profile.name || "Not set"}\n- Status: ${profile.status || "Not set"}` }] };
  } catch (error) {
    return { contents: [{ uri: uri.href, text: `Error: ${(error as Error).message}` }] };
  }
});

server.resource("privacy", new ResourceTemplate("privacy://settings", { list: undefined }), async (uri) => {
  try {
    const svc = getService();
    const privacy = await svc.fetchPrivacySettings();
    return { contents: [{ uri: uri.href, text: `Privacy:\n- Read receipts: ${privacy.readreceipts}\n- Profile: ${privacy.profile}\n- Status: ${privacy.status}\n- Online: ${privacy.online}\n- Last seen: ${privacy.last}\n- Group add: ${privacy.groupadd}` }] };
  } catch (error) {
    return { contents: [{ uri: uri.href, text: `Error: ${(error as Error).message}` }] };
  }
});

// ===== SERVER START =====

async function startStdioServer() {
  console.log("Starting MCP server via STDIO...");
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.log("MCP STDIO server started.");
  } catch (error) {
    console.error("Error starting STDIO server:", error);
    process.exit(1);
  }
}

async function startHttpServer(port: number = 3000) {
  console.log(`Starting MCP server via SSE on port ${port}...`);

  // Per-session auth store
  const sessions: Record<string, { transport: SSEServerTransport; instanceName: string; instanceToken: string }> = {};

  const httpServer = http.createServer(async (req, res) => {
    try {
      if (req.method === "GET" && req.url === "/sse") {
        // Extract auth from headers
        const instanceName = (req.headers["x-instance-name"] as string) || config.evolutionApi.instanceId;
        const instanceToken = (req.headers["x-instance-token"] as string) || config.evolutionApi.instanceToken;

        const transport = new SSEServerTransport("/message", res);
        sessions[transport.sessionId] = { transport, instanceName, instanceToken };
        res.on("close", () => {
          delete sessions[transport.sessionId];
          console.log(`SSE session closed: ${transport.sessionId}`);
        });

        await server.connect(transport);
        console.log(`SSE client connected. Session: ${transport.sessionId} (instance: ${instanceName})`);

      } else if (req.method === "POST" && req.url?.startsWith("/message")) {
        const sessionId = new URL(req.url, `http://localhost:${port}`).searchParams.get("sessionId");
        const session = sessions[sessionId];
        if (!session) {
          res.writeHead(404);
          res.end("Session not found");
          return;
        }
        // Set per-session auth context before processing the message
        await authStorage.run({ instanceName: session.instanceName, instanceToken: session.instanceToken },
          () => session.transport.handlePostMessage(req, res)
        );
      } else {
        res.writeHead(404);
        res.end("Not Found");
      }
    } catch (err) {
      console.error("Request error:", err);
      if (!res.headersSent) {
        res.writeHead(500);
        res.end("Internal Server Error");
      }
    }
  });

  httpServer.listen(port, () => {
    console.log(`MCP SSE server: http://localhost:${port}/sse`);
    console.log(`  Send auth via headers: x-instance-name, x-instance-token`);
  });
}

// Backward-compatible exports for cli.ts
export async function startServer() {
  await startStdioServer();
}

export async function startWebSocketServer(port: number = 3000) {
  console.warn("WebSocket deprecated. Use MCP_TRANSPORT=http instead.");
  await startHttpServer(port);
}

// Auto-detect transport mode
const transportMode = process.env.MCP_TRANSPORT || "stdio";
const port = Number(process.env.PORT) || 3000;

if (transportMode === "http" || transportMode === "sse") {
  startHttpServer(port);
} else {
  startStdioServer();
}
