import { z } from "zod";

export const UpdateProfileNameSchema = z.object({
  name: z.string().min(1).describe("New profile name")
});

export const UpdateProfileStatusSchema = z.object({
  status: z.string().min(1).describe("New profile status")
});

export const UpdateProfilePictureSchema = z.object({
  url: z.string().url().describe("Profile picture URL")
});

export const UpdatePrivacySchema = z.object({
  readreceipts: z.enum(["all", "contacts", "none"]).optional(),
  profile: z.enum(["all", "contacts", "none"]).optional(),
  status: z.enum(["all", "contacts", "none"]).optional(),
  online: z.enum(["all", "contacts", "none"]).optional(),
  last: z.enum(["all", "contacts", "none"]).optional(),
  groupadd: z.enum(["all", "contacts", "none"]).optional()
});
