# MCP Server for Evolution API

This project implements an MCP (Model Context Protocol) server that exposes all Evolution API v2 features to language models.

## Features

The server exposes all Evolution API functionality categories:

### Instance Management
- API and instance status checks
- Instance creation, deletion, and restart
- Presence management
- Logout

### Message Sending
- Text messages
- Media messages (images, documents, videos, audios)
- Stickers
- Locations
- Contacts
- Polls and lists
- Status

### Chat Management
- WhatsApp number verification
- Mark messages as read
- Archive/unarchive chats
- Delete messages
- Chat presence management
- Search messages and contacts

### Profile
- Retrieve and update profile information
- Update profile picture
- Privacy settings

### Groups
- Group creation and management
- Add/remove participants
- Ephemeral messages configuration
- Group invites

### Additional Integrations
- Typebot
- Chatwoot

## Requirements

- Node.js 18+
- NPM or Yarn
- Access to an Evolution API v2 server

## Installation

### Via NPM (locally)

```bash
# Install locally
git clone https://github.com/IntuitivePhella/mcp-evolution-api.git
cd mcp-evolution-api
npm install
npm run build
```

### Via NPX (no installation)

```bash
# Run directly via npx (when published)
npx mcp-evolution-api
```

### Via Docker

```bash
# Build the image
docker build -t mcp-evolution-api .

# Run the container
docker run -p 3000:3000 --env-file .env mcp-evolution-api
```

## Configuration

Create a `.env` file in the project root with the following variables:

```bash
# Evolution API server URL
EVOLUTION_API_URL=https://your-evolution-api-server.com

# Evolution API key
EVOLUTION_API_KEY=your-api-key

# WhatsApp instance ID in Evolution API
EVOLUTION_API_INSTANCE=default-instance

# Enable WebSocket server (optional)
ENABLE_WEBSOCKET=true

# Port for WebSocket server (optional)
PORT=3000
```

## Running

### Command line

To start the server in development mode:

```bash
npm run dev
```

To build and run in production:

```bash
npm run build
npm start
```

### Docker

```bash
# Using npm scripts
npm run docker:build
npm run docker:run
```

## Connection Methods

This MCP server supports two connection methods:

### 1. STDIO (Default)

Used mainly for local connections and integration with tools like Claude Desktop.

### 2. WebSocket

Ideal for remote connections or when the server is in a Docker container. To enable:

```bash
ENABLE_WEBSOCKET=true
PORT=3000 # optional port, default is 3000
```

## Integration with Tools

### Claude Desktop

Add to your `claude_desktop_config.json` file:

```json
{
  "mcpServers": {
    "evolution-api": {
      "command": "node",
      "args": [
        "/full/path/to/mcp-evolution-api/dist/index.js"
      ],
      "env": {
        "EVOLUTION_API_URL": "https://your-evolution-api-server.com",
        "EVOLUTION_API_KEY": "your-api-key",
        "EVOLUTION_API_INSTANCE": "your-instance"
      }
    }
  }
}
```

See a complete example at [examples/claude_desktop_config.json](examples/claude_desktop_config.json).

### n8n

To configure in n8n, please consult the detailed guide at [examples/n8n_config.md](examples/n8n_config.md).

## Available Tools

The MCP server exposes the following tools that can be called by the MCP client:

### General Information
- `getApiStatus`: Checks the Evolution API status

### Instance Management
- `getInstanceStatus`: Checks the WhatsApp connection status
- `setPresence`: Sets the presence status
- `logoutInstance`: Disconnects the instance
- `restartInstance`: Restarts the instance

### Messages
- `sendTextMessage`: Sends a text message
- `sendMedia`: Sends media (image, document, video, audio)
- `sendAudio`: Sends audio/voice message
- `sendSticker`: Sends a sticker
- `sendLocation`: Sends a location
- `sendContact`: Sends a contact
- `sendPoll`: Sends a poll

### Chat Control
- `checkWhatsAppNumber`: Checks if a number is on WhatsApp
- `markMessageAsRead`: Marks a message as read
- `archiveChat`: Archives/unarchives a chat
- `deleteMessageForEveryone`: Deletes a message for everyone

### Profile
- `updateProfileName`: Updates the profile name
- `updateProfileStatus`: Updates the profile status

### Groups
- `createGroup`: Creates a new group
- `addGroupParticipants`: Adds participants to a group

## Available Resources

The MCP server provides the following resources:

- `contacts://list`: Lists all available contacts
- `chats://list`: Lists all available conversations
- `groups://list`: Lists all available groups
- `profile://info`: Displays profile information
- `privacy://settings`: Displays privacy settings

## Usage Example with Claude via MCP

```typescript
import { McpClient } from "@modelcontextprotocol/sdk/client/mcp.js";

// Connect to the MCP server
const client = new McpClient();
await client.connect(mcpServerTransport);

// Check API status
const status = await client.callTool("getApiStatus", {});
console.log(status.content[0].text);

// Send a message
const msgResult = await client.callTool("sendTextMessage", {
  number: "5511999999999",
  text: "Hello, this is a test message!"
});
console.log(msgResult.content[0].text);

// Send media
const mediaResult = await client.callTool("sendMedia", {
  number: "5511999999999",
  url: "https://example.com/image.jpg",
  caption: "Check out this image!",
  mediaType: "image"
});
console.log(mediaResult.content[0].text);

// Load resources
const groups = await client.loadResource("groups://list");
console.log(groups.contents[0].text);
```

## License

MIT
