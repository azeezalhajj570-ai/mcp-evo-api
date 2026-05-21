import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

export async function startStdioServer(server: McpServer): Promise<void> {
  console.log("Starting MCP server via STDIO...");
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.log("MCP STDIO server started.");
  } catch (error) {
    console.error("Error starting STDIO server:", error);
    process.exit(1);
  }
}
