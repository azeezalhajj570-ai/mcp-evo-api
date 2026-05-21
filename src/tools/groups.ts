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
import { success } from "../utils/response.js";
import { createHandler } from "../middleware/index.js";

export function registerGroupTools(server: McpServer, getService: () => EvolutionApiService): void {

  server.tool("groups.create", CreateGroupSchema.shape, createHandler("groups.create", async (ctx) => {
    const { subject, participants, description } = ctx.input as any;
    const svc = getService();
    const result = await svc.createGroup({ subject, participants, description });
    return success(ctx.tool, result);
  }));

  server.tool("groups.add_members", AddMembersSchema.shape, createHandler("groups.add_members", async (ctx) => {
    const { groupId, participants } = ctx.input as any;
    const svc = getService();
    const result = await svc.updateGroupMembers({ groupJid: groupId, action: "add", participants });
    return success(ctx.tool, result);
  }));

  server.tool("groups.remove_members", RemoveMembersSchema.shape, createHandler("groups.remove_members", async (ctx) => {
    const { groupId, participants } = ctx.input as any;
    const svc = getService();
    const result = await svc.updateGroupMembers({ groupJid: groupId, action: "remove", participants });
    return success(ctx.tool, result);
  }));

  server.tool("groups.update_subject", UpdateGroupSubjectSchema.shape, createHandler("groups.update_subject", async (ctx) => {
    const { groupId, subject } = ctx.input as any;
    const svc = getService();
    const result = await svc.updateGroupSubject(groupId, subject);
    return success(ctx.tool, result);
  }));

  server.tool("groups.update_description", UpdateGroupDescriptionSchema.shape, createHandler("groups.update_description", async (ctx) => {
    const { groupId, description } = ctx.input as any;
    const svc = getService();
    const result = await svc.updateGroupDescription(groupId, description);
    return success(ctx.tool, result);
  }));

  server.tool("groups.update_picture", {
    groupId: z.string().min(1).describe("Group ID"),
    url: z.string().url().describe("Image URL")
  }, createHandler("groups.update_picture", async (ctx) => {
    const { groupId, url } = ctx.input as any;
    const svc = getService();
    const result = await svc.updateGroupPicture(groupId, url);
    return success(ctx.tool, result);
  }));

  server.tool("groups.invite", {
    groupId: z.string().min(1).describe("Group ID"),
    numbers: z.string().min(1).describe("Comma-separated phone numbers")
  }, createHandler("groups.invite", async (ctx) => {
    const { groupId, numbers } = ctx.input as any;
    const svc = getService();
    const list = numbers.split(",").map((n: string) => n.trim());
    const result = await svc.sendGroupInvite(groupId, list);
    return success(ctx.tool, result);
  }));

  server.tool("groups.revoke_invite", {
    groupId: z.string().min(1).describe("Group ID")
  }, createHandler("groups.revoke_invite", async (ctx) => {
    const { groupId } = ctx.input as any;
    const svc = getService();
    const result = await svc.revokeInviteCode(groupId);
    return success(ctx.tool, result);
  }));

  server.tool("groups.leave", LeaveGroupSchema.shape, createHandler("groups.leave", async (ctx) => {
    const { groupId } = ctx.input as any;
    const svc = getService();
    const result = await svc.leaveGroup(groupId);
    return success(ctx.tool, result);
  }));

  server.tool("groups.members", {
    groupId: z.string().min(1).describe("Group ID")
  }, createHandler("groups.members", async (ctx) => {
    const { groupId } = ctx.input as any;
    const svc = getService();
    const members = await svc.findGroupMembers(groupId);
    return success(ctx.tool, members);
  }));

  server.tool("groups.toggle_ephemeral", ToggleEphemeralSchema.shape, createHandler("groups.toggle_ephemeral", async (ctx) => {
    const { groupId, expiration } = ctx.input as any;
    const svc = getService();
    const result = await svc.toggleEphemeral(groupId, expiration);
    return success(ctx.tool, result);
  }));
}
