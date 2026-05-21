import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { EvolutionApiService } from "../services/evolutionApiService.js";
import {
  CreateGroupSchema,
  AddMembersSchema,
  RemoveMembersSchema,
  UpdateGroupSubjectSchema,
  UpdateGroupDescriptionSchema,
  LeaveGroupSchema,
  ToggleEphemeralSchema
} from "../schemas/groups.js";
import { success, error, mcpText } from "../utils/response.js";
import { ErrorCodes } from "../types/response.js";

const TOOL = "groups";

export function registerGroupTools(server: McpServer, getService: () => EvolutionApiService): void {

  server.tool("groups.create", CreateGroupSchema.shape, async ({ subject, participants, description }) => {
    const start = Date.now();
    try {
      const svc = getService();
      const result = await svc.createGroup({ subject, participants, description });
      return mcpText(success("groups.create", result, Date.now() - start));
    } catch (e) {
      return mcpText(error("groups.create", ErrorCodes.EXTERNAL_API_ERROR, (e as Error).message, true));
    }
  });

  server.tool("groups.add_members", AddMembersSchema.shape, async ({ groupId, participants }) => {
    const start = Date.now();
    try {
      const svc = getService();
      const result = await svc.updateGroupMembers({ groupJid: groupId, action: "add", participants });
      return mcpText(success("groups.add_members", result, Date.now() - start));
    } catch (e) {
      return mcpText(error("groups.add_members", ErrorCodes.EXTERNAL_API_ERROR, (e as Error).message, true));
    }
  });

  server.tool("groups.remove_members", RemoveMembersSchema.shape, async ({ groupId, participants }) => {
    const start = Date.now();
    try {
      const svc = getService();
      const result = await svc.updateGroupMembers({ groupJid: groupId, action: "remove", participants });
      return mcpText(success("groups.remove_members", result, Date.now() - start));
    } catch (e) {
      return mcpText(error("groups.remove_members", ErrorCodes.EXTERNAL_API_ERROR, (e as Error).message, true));
    }
  });

  server.tool("groups.update_subject", UpdateGroupSubjectSchema.shape, async ({ groupId, subject }) => {
    const start = Date.now();
    try {
      const svc = getService();
      const result = await svc.updateGroupSubject(groupId, subject);
      return mcpText(success("groups.update_subject", result, Date.now() - start));
    } catch (e) {
      return mcpText(error("groups.update_subject", ErrorCodes.EXTERNAL_API_ERROR, (e as Error).message, true));
    }
  });

  server.tool("groups.update_description", UpdateGroupDescriptionSchema.shape, async ({ groupId, description }) => {
    const start = Date.now();
    try {
      const svc = getService();
      const result = await svc.updateGroupDescription(groupId, description);
      return mcpText(success("groups.update_description", result, Date.now() - start));
    } catch (e) {
      return mcpText(error("groups.update_description", ErrorCodes.EXTERNAL_API_ERROR, (e as Error).message, true));
    }
  });

  server.tool("groups.update_picture", {
    groupId: z.string().min(1).describe("Group ID"),
    url: z.string().url().describe("Image URL")
  }, async ({ groupId, url }) => {
    const start = Date.now();
    try {
      const svc = getService();
      const result = await svc.updateGroupPicture(groupId, url);
      return mcpText(success("groups.update_picture", result, Date.now() - start));
    } catch (e) {
      return mcpText(error("groups.update_picture", ErrorCodes.EXTERNAL_API_ERROR, (e as Error).message, true));
    }
  });

  server.tool("groups.invite", {
    groupId: z.string().min(1).describe("Group ID"),
    numbers: z.string().min(1).describe("Comma-separated phone numbers")
  }, async ({ groupId, numbers }) => {
    const start = Date.now();
    try {
      const svc = getService();
      const list = numbers.split(",").map((n: string) => n.trim());
      const result = await svc.sendGroupInvite(groupId, list);
      return mcpText(success("groups.invite", result, Date.now() - start));
    } catch (e) {
      return mcpText(error("groups.invite", ErrorCodes.EXTERNAL_API_ERROR, (e as Error).message, true));
    }
  });

  server.tool("groups.revoke_invite", {
    groupId: z.string().min(1).describe("Group ID")
  }, async ({ groupId }) => {
    const start = Date.now();
    try {
      const svc = getService();
      const result = await svc.revokeInviteCode(groupId);
      return mcpText(success("groups.revoke_invite", result, Date.now() - start));
    } catch (e) {
      return mcpText(error("groups.revoke_invite", ErrorCodes.EXTERNAL_API_ERROR, (e as Error).message, true));
    }
  });

  server.tool("groups.leave", LeaveGroupSchema.shape, async ({ groupId }) => {
    const start = Date.now();
    try {
      const svc = getService();
      const result = await svc.leaveGroup(groupId);
      return mcpText(success("groups.leave", result, Date.now() - start));
    } catch (e) {
      return mcpText(error("groups.leave", ErrorCodes.EXTERNAL_API_ERROR, (e as Error).message, true));
    }
  });

  server.tool("groups.members", {
    groupId: z.string().min(1).describe("Group ID")
  }, async ({ groupId }) => {
    const start = Date.now();
    try {
      const svc = getService();
      const members = await svc.findGroupMembers(groupId);
      return mcpText(success("groups.members", members, Date.now() - start));
    } catch (e) {
      return mcpText(error("groups.members", ErrorCodes.EXTERNAL_API_ERROR, (e as Error).message, true));
    }
  });

  server.tool("groups.toggle_ephemeral", ToggleEphemeralSchema.shape, async ({ groupId, expiration }) => {
    const start = Date.now();
    try {
      const svc = getService();
      const result = await svc.toggleEphemeral(groupId, expiration);
      return mcpText(success("groups.toggle_ephemeral", result, Date.now() - start));
    } catch (e) {
      return mcpText(error("groups.toggle_ephemeral", ErrorCodes.EXTERNAL_API_ERROR, (e as Error).message, true));
    }
  });
}
