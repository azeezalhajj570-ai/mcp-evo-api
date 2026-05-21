import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { EvolutionApiService } from "../services/evolutionApiService.js";

export function registerResources(server: McpServer, getService: () => EvolutionApiService): void {

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
}
