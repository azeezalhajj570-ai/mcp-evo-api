import { z } from "zod";

export const CreateGroupSchema = z.object({
  subject: z.string().min(1).describe("Group name"),
  participants: z.array(z.string()).min(1).describe("Participant numbers"),
  description: z.string().optional().describe("Group description")
});

export const AddMembersSchema = z.object({
  groupId: z.string().min(1).describe("Group ID"),
  participants: z.array(z.string()).min(1).describe("Participant numbers")
});

export const RemoveMembersSchema = z.object({
  groupId: z.string().min(1).describe("Group ID"),
  participants: z.array(z.string()).min(1).describe("Participant numbers to remove")
});

export const UpdateGroupSubjectSchema = z.object({
  groupId: z.string().min(1).describe("Group ID"),
  subject: z.string().min(1).describe("New subject")
});

export const UpdateGroupDescriptionSchema = z.object({
  groupId: z.string().min(1).describe("Group ID"),
  description: z.string().min(1).describe("New description")
});

export const InviteGroupSchema = z.object({
  groupId: z.string().min(1).describe("Group ID"),
  numbers: z.array(z.string()).min(1).describe("Phone numbers to invite")
});

export const LeaveGroupSchema = z.object({
  groupId: z.string().min(1).describe("Group ID to leave")
});

export const ToggleEphemeralSchema = z.object({
  groupId: z.string().min(1).describe("Group ID"),
  expiration: z.number().describe("Ephemeral duration (0, 86400, 604800, 7776000)")
});
