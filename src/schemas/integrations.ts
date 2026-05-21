import { z } from "zod";

export const SetChatwootSchema = z.object({
  enabled: z.boolean(),
  account_id: z.string().min(1),
  token: z.string().min(1),
  endpoint: z.string().url(),
  instance_name: z.string().optional(),
  sign_msg: z.boolean().optional(),
  name_inbox: z.string().optional()
});

export const SetTypebotSchema = z.object({
  enabled: z.boolean(),
  url: z.string().url(),
  typebot: z.string().min(1),
  expire: z.number().optional(),
  keyword_finish: z.array(z.string()).optional(),
  delay_message: z.number().optional(),
  unknown_message: z.string().optional(),
  listening_from_me: z.boolean().optional()
});

export const StartTypebotSchema = z.object({
  number: z.string().min(1).describe("Number to start Typebot for")
});

export const ToggleTypebotSchema = z.object({
  enabled: z.boolean().describe("Enable or disable Typebot")
});
