export const config = {
  // Evolution API configuration — instance-based auth only
  evolutionApi: {
    baseUrl: process.env.EVOLUTION_API_URL || "https://your-evolution-api-server.com",
    instanceId: process.env.EVOLUTION_API_INSTANCE || "default-instance",
    instanceToken: process.env.EVOLUTION_API_INSTANCE_TOKEN || ""
  },
  // MCP server configuration
  mcp: {
    name: "Evolution API Server",
    version: "1.0.0"
  }
};
