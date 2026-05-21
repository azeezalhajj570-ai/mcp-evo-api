import { AsyncLocalStorage } from "async_hooks";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import http from "http";
import { config } from "../config.js";

interface SessionAuth {
  instanceName: string;
  instanceToken: string;
}

export const authStorage = new AsyncLocalStorage<SessionAuth>();

export async function startHttpServer(server: McpServer, port: number = 3000): Promise<void> {
  console.log(`Starting MCP server via SSE on port ${port}...`);

  const sessions: Record<string, { transport: SSEServerTransport; instanceName: string; instanceToken: string }> = {};

  const httpServer = http.createServer(async (req, res) => {
    try {
      if (req.method === "GET" && req.url === "/sse") {
        const instanceName = (req.headers["x-instance-name"] as string) || config.evolutionApi.instanceId;
        const instanceToken = (req.headers["x-instance-token"] as string) || config.evolutionApi.instanceToken;

        const transport = new SSEServerTransport("/message", res);
        sessions[transport.sessionId] = { transport, instanceName, instanceToken };
        res.on("close", () => {
          delete sessions[transport.sessionId];
          console.log(`SSE session closed: ${transport.sessionId}`);
        });

        await server.connect(transport);
        console.log(`SSE client connected. Session: ${transport.sessionId} (instance: ${instanceName})`);

      } else if (req.method === "POST" && req.url?.startsWith("/message")) {
        const sessionId = new URL(req.url, `http://localhost:${port}`).searchParams.get("sessionId");
        if (!sessionId) {
          res.writeHead(400);
          res.end("Missing sessionId");
          return;
        }
        const session = sessions[sessionId];
        if (!session) {
          res.writeHead(404);
          res.end("Session not found");
          return;
        }
        await authStorage.run(
          { instanceName: session.instanceName, instanceToken: session.instanceToken },
          () => session.transport.handlePostMessage(req, res)
        );
      } else {
        res.writeHead(404);
        res.end("Not Found");
      }
    } catch (err) {
      console.error("Request error:", err);
      if (!res.headersSent) {
        res.writeHead(500);
        res.end("Internal Server Error");
      }
    }
  });

  httpServer.listen(port, () => {
    console.log(`MCP SSE server: http://localhost:${port}/sse`);
    console.log(`  Send auth via headers: x-instance-name, x-instance-token`);
  });
}
