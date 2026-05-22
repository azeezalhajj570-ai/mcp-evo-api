import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { EvolutionApiService } from "../services/evolutionApiService.js";
import { UpdateProfileNameSchema, UpdateProfileStatusSchema, UpdateProfilePictureSchema, UpdatePrivacySchema } from "../schemas/profile.js";
import { success } from "../utils/response.js";
import { createHandler } from "../middleware/index.js";

export function registerProfileTools(server: McpServer, getService: () => EvolutionApiService): void {

  server.tool("profile.update_name", UpdateProfileNameSchema.shape, createHandler("profile.update_name", async (ctx) => {
    const { name } = ctx.input as any;
    const svc = getService();
    const result = await svc.updateProfileName(name);
    return success(ctx.tool, result);
  }));

  server.tool("profile.update_status", UpdateProfileStatusSchema.shape, createHandler("profile.update_status", async (ctx) => {
    const { status } = ctx.input as any;
    const svc = getService();
    const result = await svc.updateProfileStatus(status);
    return success(ctx.tool, result);
  }));

  server.tool("profile.update_picture", UpdateProfilePictureSchema.shape, createHandler("profile.update_picture", async (ctx) => {
    const { url } = ctx.input as any;
    const svc = getService();
    const result = await svc.updateProfilePicture(url);
    return success(ctx.tool, result);
  }));

  server.tool("profile.remove_picture", {}, createHandler("profile.remove_picture", async (ctx) => {
    const svc = getService();
    const result = await svc.removeProfilePicture();
    return success(ctx.tool, result);
  }));

  server.tool("profile.update_privacy", UpdatePrivacySchema.shape, createHandler("profile.update_privacy", async (ctx) => {
    const svc = getService();
    const result = await svc.updatePrivacySettings(ctx.input);
    return success(ctx.tool, result);
  }));

  server.tool("profile.info", {
    number: z.string().min(1).describe("Phone number to fetch profile for (e.g. 967774544394)")
  }, createHandler("profile.info", async (ctx) => {
    const { number } = ctx.input as { number: string };
    const svc = getService();
    const profile = await svc.fetchProfile(number);
    return success(ctx.tool, profile);
  }));
}
