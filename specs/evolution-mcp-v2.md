# Spec Kit: Evolution API MCP Platform v2

## Project Metadata

**Project Name**

```text
Evolution MCP Platform
```

**Version**

```text
v2.0
```

**Purpose**

```text
Expose Evolution API capabilities through a production-grade MCP server
with structured tools, multi-tenant support, security, observability,
and AI-optimized tool design.
```

**Primary Goals**

* Full Evolution API coverage
* Strong type safety
* AI-friendly tool discovery
* Multi-tenant architecture
* Production observability
* Secure deployment
* Extensible integrations

---

# Functional Requirements

## Instance Management

Capabilities:

```text
Create instance
Delete instance
Restart instance
List instances
Get instance status
Logout instance
Update presence
```

Tool definitions:

```yaml
instances.create
instances.delete
instances.restart
instances.list
instances.status
instances.logout
instances.presence
```

---

## Messaging

Capabilities:

```text
Send text
Send image
Send document
Send audio
Send sticker
Send location
Send contact
Send poll
Send reaction
Send status
Send template
Send list
Update message
Search messages
```

Tool definitions:

```yaml
messages.send_text
messages.send_image
messages.send_document
messages.send_audio
messages.send_sticker
messages.send_location
messages.send_contact
messages.send_poll
messages.send_reaction
messages.send_status
messages.send_template
messages.send_list
messages.update
messages.search
```

---

## Chats

Capabilities:

```text
Archive chat
Unarchive chat
Mark read
Search chats
Fetch business profile
Chat history — paginated, filterable
```

Tool definitions:

```yaml
chats.archive
chats.unarchive
chats.mark_read
chats.search
chats.business_profile
chats.history
```

---

## Groups

Capabilities:

```text
Create
Add members
Remove members
Update description
Update subject
Update picture
Invite users
Revoke invite
Leave group
Find members
Toggle ephemeral
```

Tool definitions:

```yaml
groups.create
groups.add_members
groups.remove_members
groups.update_subject
groups.update_description
groups.update_picture
groups.invite
groups.revoke_invite
groups.leave
groups.members
groups.toggle_ephemeral
```

---

## Profile

Capabilities:

```text
Update profile name
Update profile status
Update picture
Remove picture
Update privacy
```

Tool definitions:

```yaml
profile.update_name
profile.update_status
profile.update_picture
profile.remove_picture
profile.update_privacy
```

---

## Integrations

Capabilities:

```text
Configure Chatwoot
Configure Typebot
Find Chatwoot
Find Typebot
Start Typebot
Toggle Typebot
```

Tool definitions:

```yaml
chatwoot.configure
chatwoot.find

typebot.configure
typebot.start
typebot.status
```

---

## Webhooks

Capabilities:

```text
Set webhook
Get webhook
```

Tool definitions:

```yaml
webhooks.set
webhooks.get
```

---

# Nonfunctional Requirements

## Performance

```yaml
request_timeout: 5000ms
tool_latency_target: <500ms
max_payload_size: 10MB
concurrent_requests: 1000
```

---

## Reliability

```yaml
retry_strategy: exponential_backoff
max_retries: 3
circuit_breaker: enabled
health_checks: enabled
```

---

## Security

```yaml
authentication: JWT
authorization: RBAC
rate_limiting: enabled
tenant_isolation: enabled
audit_logs: enabled
```

---

# Architecture

```text
                +-----------------+
                | MCP Client      |
                +-----------------+
                         |
                         |
                +-----------------+
                | MCP Transport   |
                | STDIO / SSE     |
                +-----------------+
                         |
                         |
                +-----------------+
                | Middleware      |
                |
                | Validation
                | Authentication
                | Authorization
                | Logging
                | Metrics
                +-----------------+
                         |
                         |
                +-----------------+
                | Tool Layer      |
                +-----------------+
                         |
                         |
                +-----------------+
                | Service Layer   |
                +-----------------+
                         |
                         |
                +-----------------+
                | Evolution API   |
                +-----------------+
```

---

# Directory Structure

```text
src/

├── tools/
│   ├── instances/
│   ├── messages/
│   ├── chats/
│   ├── groups/
│   ├── profile/
│   ├── integrations/
│   └── webhooks/
│
├── services/
│
├── middleware/
│   ├── auth.ts
│   ├── validation.ts
│   ├── logging.ts
│   ├── rateLimit.ts
│
├── schemas/
│
├── resources/
│
├── transports/
│   ├── stdio.ts
│   └── sse.ts
│
├── utils/
│
├── types/
│
└── index.ts
```

---

# Request Schema Standard

Example:

```typescript
const SendTextSchema=z.object({

number:z.string()
.regex(/^\d+$/),

message:z.string()
.min(1)
.max(4096),

delay:z.number()
.optional(),

quotedMessageId:z.string()
.optional()

})
```

---

# Response Standard

Success:

```typescript
{
    success:true,

    data:{
        messageId:"abc123"
    },

    metadata:{
        requestId:"uuid",
        timestamp:"ISO8601"
    }
}
```

Failure:

```typescript
{
    success:false,

    code:"INVALID_PHONE_NUMBER",

    message:"Recipient number invalid",

    retryable:false,

    metadata:{
        requestId:"uuid"
    }
}
```

---

# Tool Metadata Standard

Example:

```typescript
{
    name:"messages.send_text",

    description:
    "Send WhatsApp text message",

    useCases:[
        "Send message",
        "Reply to chat"
    ],

    returns:[
        "messageId",
        "deliveryStatus"
    ]
}
```

---

# Authentication Spec

JWT payload:

```typescript
{
    sub:"userId",

    tenantId:"tenant123",

    instanceId:"instanceABC",

    role:"user"
}
```

Roles:

```yaml
admin:
    - all

user:
    - own_instances
    - send_messages
    - read_messages

readonly:
    - read_only
```

---

# Observability Spec

Logging:

```typescript
{
    requestId,
    toolName,
    tenantId,
    duration,
    success
}
```

Metrics:

```yaml
tool_invocations_total
tool_errors_total
request_duration
active_sessions
api_latency
```

Tracing:

```yaml
OpenTelemetry: enabled
Prometheus: enabled
Grafana: enabled
Sentry: enabled
```

---

# Bug Fix Requirements

Required fixes:

```yaml
remove_ts_nocheck: true

fix_fetch_instances:
    old: getInstanceStatus()
    new: fetchInstances()

fix_archive:
    archive: action="archive"
    unarchive: action="unarchive"

replace_audio_exception:
    use_capability_detection: true
```

---

# Roadmap

Phase 1:

```text
Fix bugs
Strict typing
Validation schemas
```

Phase 2:

```text
Expose missing methods
Tool restructuring
Response standardization
```

Phase 3:

```text
Observability
Middleware
Rate limiting
```

Phase 4:

```text
JWT auth
Tenant isolation
Capability discovery
Enterprise deployment
```
