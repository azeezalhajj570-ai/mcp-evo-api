import { z } from "zod";

export const SetPresenceSchema = z.object({
  presence: z.enum(["available", "unavailable", "composing", "recording", "paused"])
    .describe("Presence status to set")
});

export const CreateInstanceSchema = z.object({
  instanceName: z.string().min(1).describe("Name for the new instance")
});

export const DeleteInstanceSchema = z.object({
  instanceName: z.string().optional().describe("Instance name (uses default if omitted)")
});
