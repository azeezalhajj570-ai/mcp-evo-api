# MCP Server for Evolution API Configuration in n8n

This document provides instructions for configuring the Evolution API MCP Server for use with n8n.

## Configuration via STDIO (Command Line)

1. In n8n, add an "MCP Client (STDIO)" node.
2. Configure the fields as below:

### For Windows:

**Command:**
```
powershell
```

**Arguments:**
```
/c cd C:\full\path\to\mcp-evolution-api && node dist/index.js
```

**Environments:**
```
EVOLUTION_API_URL=https://your-evolution-api-server.com
EVOLUTION_API_KEY=your-api-key
EVOLUTION_API_INSTANCE=your-instance
```

### For Linux/Mac:

**Command:**
```
bash
```

**Arguments:**
```
-c "cd /full/path/to/mcp-evolution-api && node dist/index.js"
```

**Environments:**
```
EVOLUTION_API_URL=https://your-evolution-api-server.com
EVOLUTION_API_KEY=your-api-key
EVOLUTION_API_INSTANCE=your-instance
```

## Configuration via WebSocket

If you are facing issues with the STDIO method, especially in Docker environments, you can use WebSocket:

1. First, start the MCP server with WebSocket support:
```bash
cd /path/to/mcp-evolution-api
export ENABLE_WEBSOCKET=true
export PORT=3000
npm start
```

2. In n8n, add an "MCP Client (SSE)" node.
3. Configure the URL as:
```
ws://your-server:3000
```

## Troubleshooting

### Connection closed error

If you encounter the "Connection closed" error, check:

1. Is the MCP server running?
2. Did you configure the path correctly in n8n?
3. Are the environment variables correct?
4. Try the WebSocket method if STDIO fails

### Docker Issues

If running n8n in Docker, make sure to:

1. Use the WebSocket method instead of STDIO
2. Configure Docker networks so that the n8n container can access the MCP server

### Testing the connection

You can test the connection by listing the available tools. After configuring, click on "List Available Tools" in the MCP Client node.
