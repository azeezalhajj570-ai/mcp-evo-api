import { z } from "zod";

export const SetWebhookSchema = z.object({
  url: z.string().url().describe("Webhook URL"),
  enabled: z.boolean().describe("Enable webhook"),
  events: z.array(z.enum(["message", "message.ack", "qr", "connection.update", "group.update", "presence.update"])).optional().describe("Webhook events")
});
