import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { EvolutionApiService } from "../services/evolutionApiService.js";
import { UpdateProfileNameSchema, UpdateProfileStatusSchema, UpdateProfilePictureSchema, UpdatePrivacySchema } from "../schemas/profile.js";
import { success, error, mcpText } from "../utils/response.js";
import { ErrorCodes } from "../types/response.js";

const TOOL = "profile";

export function registerProfileTools(server: McpServer, getService: () => EvolutionApiService): void {

  server.tool("profile.update_name", UpdateProfileNameSchema.shape, async ({ name }) => {
    const start = Date.now();
    try {
      const svc = getService();
      const result = await svc.updateProfileName(name);
      return mcpText(success("profile.update_name", result, Date.now() - start));
    } catch (e) {
      return mcpText(error("profile.update_name", ErrorCodes.EXTERNAL_API_ERROR, (e as Error).message, true));
    }
  });

  server.tool("profile.update_status", UpdateProfileStatusSchema.shape, async ({ status }) => {
    const start = Date.now();
    try {
      const svc = getService();
      const result = await svc.updateProfileStatus(status);
      return mcpText(success("profile.update_status", result, Date.now() - start));
    } catch (e) {
      return mcpText(error("profile.update_status", ErrorCodes.EXTERNAL_API_ERROR, (e as Error).message, true));
    }
  });

  server.tool("profile.update_picture", UpdateProfilePictureSchema.shape, async ({ url }) => {
    const start = Date.now();
    try {
      const svc = getService();
      const result = await svc.updateProfilePicture(url);
      return mcpText(success("profile.update_picture", result, Date.now() - start));
    } catch (e) {
      return mcpText(error("profile.update_picture", ErrorCodes.EXTERNAL_API_ERROR, (e as Error).message, true));
    }
  });

  server.tool("profile.remove_picture", {}, async () => {
    const start = Date.now();
    try {
      const svc = getService();
      const result = await svc.removeProfilePicture();
      return mcpText(success("profile.remove_picture", result, Date.now() - start));
    } catch (e) {
      return mcpText(error("profile.remove_picture", ErrorCodes.EXTERNAL_API_ERROR, (e as Error).message, true));
    }
  });

  server.tool("profile.update_privacy", UpdatePrivacySchema.shape, async (settings) => {
    const start = Date.now();
    try {
      const svc = getService();
      const result = await svc.updatePrivacySettings(settings);
      return mcpText(success("profile.update_privacy", result, Date.now() - start));
    } catch (e) {
      return mcpText(error("profile.update_privacy", ErrorCodes.EXTERNAL_API_ERROR, (e as Error).message, true));
    }
  });

  server.tool("profile.info", {}, async () => {
    const start = Date.now();
    try {
      const svc = getService();
      const profile = await svc.fetchProfile();
      return mcpText(success("profile.info", profile, Date.now() - start));
    } catch (e) {
      return mcpText(error("profile.info", ErrorCodes.EXTERNAL_API_ERROR, (e as Error).message, true));
    }
  });
}
