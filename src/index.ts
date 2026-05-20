// @ts-nocheck
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { config } from "./config.js";
import { EvolutionApiService } from "./services/evolutionApiService.js";

// Create the MCP server
const server = new McpServer({
  name: config.mcp.name,
  version: config.mcp.version
});

// Helper: build service from optional instance params (defaults from env)
function getService(instanceName?: string, instanceToken?: string) {
  return new EvolutionApiService(
    instanceName || config.evolutionApi.instanceId,
    instanceToken || config.evolutionApi.instanceToken
  );
}

// Shared base schema fields for instance auth
const instanceNameField = z.string().optional().describe("Instance name on Evolution API (default: env var)");
const instanceTokenField = z.string().optional().describe("Instance token for authentication (default: env var)");

// ===== GENERAL INFO =====

server.tool("getApiStatus",
  {
    instanceName: instanceNameField,
    instanceToken: instanceTokenField
  },
  async ({ instanceName, instanceToken }) => {
    try {
      const svc = getService(instanceName, instanceToken);
      const apiInfo = await svc.getApiInfo();
      return {
        content: [{ type: "text", text: `Evolution API v${apiInfo.version} running. Status: ${apiInfo.status}` }]
      };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${(error as Error).message}` }] };
    }
  }
);

// ===== INSTANCE MANAGEMENT =====

server.tool("getInstanceStatus",
  {
    instanceName: instanceNameField,
    instanceToken: instanceTokenField
  },
  async ({ instanceName, instanceToken }) => {
    try {
      const svc = getService(instanceName, instanceToken);
      const status = await svc.getInstanceStatus();
      return {
        content: [{ type: "text", text: `Instance status: ${status.state || "Unknown"}` }]
      };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${(error as Error).message}` }] };
    }
  }
);

server.tool("fetchInstances",
  {
    instanceName: instanceNameField,
    instanceToken: instanceTokenField
  },
  async ({ instanceName, instanceToken }) => {
    try {
      const svc = getService(instanceName, instanceToken);
      const instances = await svc.fetchInstances();
      if (!instances || instances.length === 0) {
        return { content: [{ type: "text", text: "No instances found." }] };
      }
      const list = instances.map((inst: any) =>
        `- ${inst.name || inst.instanceName || "Unnamed"} (${inst.connectionStatus || "unknown"})`
      ).join("\n");
      return { content: [{ type: "text", text: `Available instances (${instances.length}):\n${list}` }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${(error as Error).message}` }] };
    }
  }
);

server.tool("restartInstance",
  {
    instanceName: instanceNameField,
    instanceToken: instanceTokenField
  },
  async ({ instanceName, instanceToken }) => {
    try {
      const svc = getService(instanceName, instanceToken);
      await svc.restartInstance();
      return { content: [{ type: "text", text: "Instance restarted successfully." }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${(error as Error).message}` }] };
    }
  }
);

server.tool("logoutInstance",
  {
    instanceName: instanceNameField,
    instanceToken: instanceTokenField
  },
  async ({ instanceName, instanceToken }) => {
    try {
      const svc = getService(instanceName, instanceToken);
      await svc.logout();
      return { content: [{ type: "text", text: "Instance logged out successfully." }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${(error as Error).message}` }] };
    }
  }
);

server.tool("setPresence",
  {
    presence: z.enum(["available", "unavailable", "composing", "recording", "paused"])
      .describe("Presence status to set"),
    instanceName: instanceNameField,
    instanceToken: instanceTokenField
  },
  async ({ presence, instanceName, instanceToken }) => {
    try {
      const svc = getService(instanceName, instanceToken);
      await svc.setPresence(presence);
      return { content: [{ type: "text", text: `Presence set to "${presence}" successfully.` }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${(error as Error).message}` }] };
    }
  }
);

// ===== MESSAGES =====

server.tool("sendTextMessage",
  {
    number: z.string().min(1).describe("Recipient number in international format (e.g. 5511999999999)"),
    text: z.string().min(1).describe("Message text"),
    options: z.object({
      delay: z.number().optional().describe("Delay in milliseconds"),
      presence: z.enum(["composing", "recording", "paused"]).optional().describe("Presence to show"),
      quotedMessageId: z.string().optional().describe("Message ID to quote")
    }).optional().describe("Optional send options"),
    instanceName: instanceNameField,
    instanceToken: instanceTokenField
  },
  async ({ number, text, options, instanceName, instanceToken }) => {
    try {
      const svc = getService(instanceName, instanceToken);
      const result = await svc.sendTextMessage({ number, text, options });
      return { content: [{ type: "text", text: `Message sent: ${result?.key?.id || "ID unavailable"}` }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${(error as Error).message}` }] };
    }
  }
);

server.tool("sendMedia",
  {
    number: z.string().min(1).describe("Recipient number in international format"),
    url: z.string().url().describe("Media URL"),
    caption: z.string().optional().describe("Caption"),
    fileName: z.string().optional().describe("File name"),
    mediaType: z.enum(["image", "document", "video", "audio"]).describe("Media type"),
    instanceName: instanceNameField,
    instanceToken: instanceTokenField
  },
  async ({ number, url, caption, fileName, mediaType, instanceName, instanceToken }) => {
    try {
      const svc = getService(instanceName, instanceToken);
      await svc.sendMedia({ number, media: { url, caption, fileName, mediaType } });
      return { content: [{ type: "text", text: "Media sent successfully." }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${(error as Error).message}` }] };
    }
  }
);

server.tool("sendAudio",
  {
    number: z.string().min(1).describe("Recipient number in international format"),
    url: z.string().url().describe("Audio URL"),
    ptt: z.boolean().optional().describe("Push-to-talk (voice message)"),
    instanceName: instanceNameField,
    instanceToken: instanceTokenField
  },
  async ({ number, url, ptt, instanceName, instanceToken }) => {
    try {
      const svc = getService(instanceName, instanceToken);
      await svc.sendAudio({ number, audio: { url, ptt } });
      return { content: [{ type: "text", text: "Audio sent successfully." }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${(error as Error).message}` }] };
    }
  }
);

server.tool("sendSticker",
  {
    number: z.string().min(1).describe("Recipient number in international format"),
    url: z.string().url().describe("Sticker URL"),
    instanceName: instanceNameField,
    instanceToken: instanceTokenField
  },
  async ({ number, url, instanceName, instanceToken }) => {
    try {
      const svc = getService(instanceName, instanceToken);
      await svc.sendSticker({ number, sticker: { url } });
      return { content: [{ type: "text", text: "Sticker sent successfully." }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${(error as Error).message}` }] };
    }
  }
);

server.tool("sendLocation",
  {
    number: z.string().min(1).describe("Recipient number in international format"),
    lat: z.number().describe("Latitude"),
    lng: z.number().describe("Longitude"),
    title: z.string().optional().describe("Location title"),
    address: z.string().optional().describe("Location address"),
    instanceName: instanceNameField,
    instanceToken: instanceTokenField
  },
  async ({ number, lat, lng, title, address, instanceName, instanceToken }) => {
    try {
      const svc = getService(instanceName, instanceToken);
      await svc.sendLocation({ number, location: { lat, lng, title, address } });
      return { content: [{ type: "text", text: "Location sent successfully." }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${(error as Error).message}` }] };
    }
  }
);

server.tool("sendContact",
  {
    number: z.string().min(1).describe("Recipient number in international format"),
    fullName: z.string().min(1).describe("Contact full name"),
    wuid: z.string().min(1).describe("WhatsApp ID"),
    phoneNumber: z.string().min(1).describe("Phone number"),
    instanceName: instanceNameField,
    instanceToken: instanceTokenField
  },
  async ({ number, fullName, wuid, phoneNumber, instanceName, instanceToken }) => {
    try {
      const svc = getService(instanceName, instanceToken);
      await svc.sendContact({ number, contact: { fullName, wuid, phoneNumber } });
      return { content: [{ type: "text", text: "Contact sent successfully." }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${(error as Error).message}` }] };
    }
  }
);

server.tool("sendPoll",
  {
    number: z.string().min(1).describe("Recipient number in international format"),
    name: z.string().min(1).describe("Poll question"),
    options: z.array(z.string()).min(2).describe("Answer options"),
    multipleChoice: z.boolean().optional().describe("Allow multiple choices"),
    instanceName: instanceNameField,
    instanceToken: instanceTokenField
  },
  async ({ number, name, options, multipleChoice, instanceName, instanceToken }) => {
    try {
      const svc = getService(instanceName, instanceToken);
      await svc.sendPoll({ number, poll: { name, options, multipleChoice } });
      return { content: [{ type: "text", text: "Poll sent successfully." }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${(error as Error).message}` }] };
    }
  }
);

// ===== CHAT MANAGEMENT =====

server.tool("checkWhatsAppNumber",
  {
    phone: z.string().min(1).describe("Number to check in international format (e.g. 5511999999999)"),
    instanceName: instanceNameField,
    instanceToken: instanceTokenField
  },
  async ({ phone, instanceName, instanceToken }) => {
    try {
      const svc = getService(instanceName, instanceToken);
      const result = await svc.checkWhatsAppNumber({ phone });
      const isWhatsApp = result?.numbers?.[0]?.exists || false;
      return { content: [{ type: "text", text: isWhatsApp ? `Number ${phone} is a valid WhatsApp.` : `Number ${phone} is NOT a valid WhatsApp.` }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${(error as Error).message}` }] };
    }
  }
);

server.tool("markMessageAsRead",
  {
    messageId: z.string().min(1).describe("Message ID to mark as read"),
    instanceName: instanceNameField,
    instanceToken: instanceTokenField
  },
  async ({ messageId, instanceName, instanceToken }) => {
    try {
      const svc = getService(instanceName, instanceToken);
      await svc.markMessageAsRead(messageId);
      return { content: [{ type: "text", text: "Message marked as read successfully." }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${(error as Error).message}` }] };
    }
  }
);

server.tool("archiveChat",
  {
    number: z.string().min(1).describe("Number in international format"),
    shouldArchive: z.boolean().default(true).describe("True to archive, false to unarchive"),
    instanceName: instanceNameField,
    instanceToken: instanceTokenField
  },
  async ({ number, shouldArchive, instanceName, instanceToken }) => {
    try {
      const svc = getService(instanceName, instanceToken);
      await svc.archiveChat(number);
      return { content: [{ type: "text", text: shouldArchive ? "Chat archived successfully." : "Chat unarchived successfully." }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${(error as Error).message}` }] };
    }
  }
);

server.tool("deleteMessageForEveryone",
  {
    messageId: z.string().min(1).describe("Message ID to delete"),
    instanceName: instanceNameField,
    instanceToken: instanceTokenField
  },
  async ({ messageId, instanceName, instanceToken }) => {
    try {
      const svc = getService(instanceName, instanceToken);
      await svc.deleteMessageForEveryone(messageId);
      return { content: [{ type: "text", text: "Message deleted for everyone successfully." }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${(error as Error).message}` }] };
    }
  }
);

// ===== PROFILE =====

server.tool("updateProfileName",
  {
    name: z.string().min(1).describe("New profile name"),
    instanceName: instanceNameField,
    instanceToken: instanceTokenField
  },
  async ({ name, instanceName, instanceToken }) => {
    try {
      const svc = getService(instanceName, instanceToken);
      await svc.updateProfileName(name);
      return { content: [{ type: "text", text: `Profile name updated to "${name}" successfully.` }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${(error as Error).message}` }] };
    }
  }
);

server.tool("updateProfileStatus",
  {
    status: z.string().min(1).describe("New profile status"),
    instanceName: instanceNameField,
    instanceToken: instanceTokenField
  },
  async ({ status, instanceName, instanceToken }) => {
    try {
      const svc = getService(instanceName, instanceToken);
      await svc.updateProfileStatus(status);
      return { content: [{ type: "text", text: `Profile status updated to "${status}" successfully.` }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${(error as Error).message}` }] };
    }
  }
);

// ===== GROUPS =====

server.tool("createGroup",
  {
    subject: z.string().min(1).describe("Group name"),
    participants: z.array(z.string()).min(1).describe("Participant numbers list"),
    description: z.string().optional().describe("Group description"),
    instanceName: instanceNameField,
    instanceToken: instanceTokenField
  },
  async ({ subject, participants, description, instanceName, instanceToken }) => {
    try {
      const svc = getService(instanceName, instanceToken);
      const result = await svc.createGroup({ subject, participants, description });
      return { content: [{ type: "text", text: `Group "${subject}" created. ID: ${result.groupId}` }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${(error as Error).message}` }] };
    }
  }
);

server.tool("addGroupParticipants",
  {
    groupId: z.string().min(1).describe("Group ID"),
    participants: z.array(z.string()).min(1).describe("Participant numbers list"),
    instanceName: instanceNameField,
    instanceToken: instanceTokenField
  },
  async ({ groupId, participants, instanceName, instanceToken }) => {
    try {
      const svc = getService(instanceName, instanceToken);
      await svc.updateGroupMembers({ groupJid: groupId, action: "add", participants });
      return { content: [{ type: "text", text: `${participants.length} participant(s) added successfully.` }] };
    } catch (error) {
      return { content: [{ type: "text", text: `Error: ${(error as Error).message}` }] };
    }
  }
);

// ===== RESOURCES =====

server.resource("contacts",
  new ResourceTemplate("contacts://list", { list: undefined }),
  async (uri) => {
    try {
      const svc = getService();
      const contactsData = await svc.fetchContacts();
      const contacts = contactsData?.data || [];
      return {
        contents: [{
          uri: uri.href,
          text: `Contacts (${contacts.length}):\n${contacts.map((c: any) => `- ${c.name || "No name"}: ${c.id.replace("@c.us", "")}`).join("\n")}`
        }]
      };
    } catch (error) {
      return { contents: [{ uri: uri.href, text: `Error: ${(error as Error).message}` }] };
    }
  }
);

server.resource("chats",
  new ResourceTemplate("chats://list", { list: undefined }),
  async (uri) => {
    try {
      const svc = getService();
      const chatsData = await svc.fetchChats();
      const chats = chatsData?.data || [];
      return {
        contents: [{
          uri: uri.href,
          text: `Chats (${chats.length}):\n${chats.map((c: any) => `- ${c.name || c.id || "Unnamed chat"}`).join("\n")}`
        }]
      };
    } catch (error) {
      return { contents: [{ uri: uri.href, text: `Error: ${(error as Error).message}` }] };
    }
  }
);

server.resource("groups",
  new ResourceTemplate("groups://list", { list: undefined }),
  async (uri) => {
    try {
      const svc = getService();
      const groupsData = await svc.fetchAllGroups();
      const groups = groupsData?.data || [];
      return {
        contents: [{
          uri: uri.href,
          text: `Groups (${groups.length}):\n${groups.map((g: any) => `- ${g.subject || g.id || "Unnamed"} (${g.participants?.length || 0} members)`).join("\n")}`
        }]
      };
    } catch (error) {
      return { contents: [{ uri: uri.href, text: `Error: ${(error as Error).message}` }] };
    }
  }
);

server.resource("profile",
  new ResourceTemplate("profile://info", { list: undefined }),
  async (uri) => {
    try {
      const svc = getService();
      const profile = await svc.fetchProfile();
      return {
        contents: [{
          uri: uri.href,
          text: `Profile:\n- Name: ${profile.name || "Not set"}\n- Status: ${profile.status || "Not set"}`
        }]
      };
    } catch (error) {
      return { contents: [{ uri: uri.href, text: `Error: ${(error as Error).message}` }] };
    }
  }
);

server.resource("privacy",
  new ResourceTemplate("privacy://settings", { list: undefined }),
  async (uri) => {
    try {
      const svc = getService();
      const privacy = await svc.fetchPrivacySettings();
      return {
        contents: [{
          uri: uri.href,
          text: `Privacy settings:\n- Read receipts: ${privacy.readreceipts}\n- Profile: ${privacy.profile}\n- Status: ${privacy.status}\n- Online: ${privacy.online}\n- Last seen: ${privacy.last}\n- Group add: ${privacy.groupadd}`
        }]
      };
    } catch (error) {
      return { contents: [{ uri: uri.href, text: `Error: ${(error as Error).message}` }] };
    }
  }
);

// ===== SERVER START =====

export async function startServer() {
  console.log("Starting MCP server for Evolution API...");
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.log("MCP server started successfully!");
  } catch (error) {
    console.error("Error starting MCP server:", error);
    process.exit(1);
  }
}

export async function startWebSocketServer(port: number = 3000) {
  console.warn(`WebSocket server not available in this version. Requested port: ${port}`);
}

startServer();
