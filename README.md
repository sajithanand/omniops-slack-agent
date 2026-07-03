# 🤖 OmniOps Agent • Slack Agent Builder Challenge

> **Category**: Track 1 (New Slack Agent) / Best UX / Best Technological Implementation  
> **Built With**: Slack Bolt SDK, Slack Real-Time Search (RTS) API, Model Context Protocol (MCP), Slack AI, Block Kit UI, TypeScript, Node.js

---

## 💡 Overview

**OmniOps Agent** is an autonomous IT operations and context-synthesis agent built inside Slack. When production incidents occur or context is fragmented across channels, OmniOps Agent:
1. **Performs Real-Time Search (RTS API)** across workspace messages, files, and threads to locate historical resolution patterns.
2. **Executes External Infrastructure Actions via MCP (Model Context Protocol)** to query Kubernetes health, GitHub deployment status, or trigger canary rollbacks.
3. **Synthesizes Insights with Slack AI** to generate root-cause analyses and presents them in an interactive **Block Kit UI**.

---

## 🏗️ Architecture & Data Flow

```
  ┌────────────────────────────────────────────────────────┐
  │                   SLACK WORKSPACE                      │
  │  (@omniops mention / /omniops command / Block Kit UI)  │
  └───────────────────────────┬────────────────────────────┘
                              │
                              ▼
  ┌────────────────────────────────────────────────────────┐
  │                 OMNIOPS AGENT ENGINE                   │
  │                  (Slack Bolt SDK)                      │
  └─────┬─────────────────────┼──────────────────────┬─────┘
        │                     │                      │
        ▼                     ▼                      ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  REAL-TIME SEARCH│  │  MODEL CONTEXT   │  │    SLACK AI      │
│    (RTS) API     │  │  PROTOCOL (MCP)  │  │  SYNTHESIS BLOCK │
│  search.messages │  │  GitHub & Ops    │  │  Root Cause AI   │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

---

## 🛠️ Tech Stack & Requirements Met

| Technology Requirement | Implementation in OmniOps |
| :--- | :--- |
| **Real-Time Search (RTS) API** | Uses `search.messages` and `search.files` to index and retrieve real-time channel discussions and uploaded post-mortems. |
| **MCP Server Integration** | Connects to standard Model Context Protocol servers to query deployment metrics (`github_get_deployment_status`) and cluster health (`ops_query_service_health`). |
| **Slack AI capabilities** | Generates real-time thread summaries, impact scores, and automated remediation action plans. |
| **Best UX (Block Kit)** | Interactive buttons, status spinners, modal views, and Slack Canvas exports. |

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Run End-to-End Simulation Test (No Slack credentials required for initial verification)
```bash
npm run test:agent
```

### 3. Environment Configuration (`.env`)
Copy `.env.example` to `.env` and fill in your Slack App credentials:
```env
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_APP_TOKEN=xapp-your-app-token
SLACK_SIGNING_SECRET=your-signing-secret
SLACK_USER_TOKEN=xoxp-your-user-token-with-search-read-scopes
```

### 4. Run Development Server
```bash
# Start standalone MCP Server
npm run mcp:server

# Start Slack Agent in dev mode
npm run dev
```

---

## ⚙️ Slack App Manifest (Copy & Paste into Slack API Console at https://api.slack.com/apps)

```json
{
  "display_information": {
    "name": "OmniOps Agent",
    "description": "Autonomous ITOps & Context Synthesis Slack Agent using RTS, MCP & Slack AI",
    "background_color": "#0d1117"
  },
  "features": {
    "bot_user": {
      "display_name": "OmniOps Agent",
      "always_online": true
    },
    "slash_commands": [
      {
        "command": "/omniops",
        "description": "Run workspace RTS search & MCP infrastructure query",
        "usage_hint": "[incident ID or query]"
      }
    ]
  },
  "oauth_config": {
    "scopes": {
      "bot": [
        "app_mentions:read",
        "channels:history",
        "chat:write",
        "commands",
        "files:read"
      ],
      "user": [
        "search:read"
      ]
    }
  },
  "settings": {
    "event_subscriptions": {
      "bot_events": [
        "app_mention"
      ]
    },
    "interactivity": {
      "is_enabled": true
    },
    "socket_mode_enabled": true
  }
}
```

---

## 📋 Hackathon Submission Checklist

- [x] **Project Track Selected**: Track 1 (New Slack Agent)
- [x] **Required Tech Used**: RTS API + MCP Server + Slack AI capabilities
- [x] **Sandbox Access Granted**: `slackhack@salesforce.com` and `testing@devpost.com`
- [x] **Architecture Diagram Included**: Yes (see diagram above)
- [ ] **3-Minute Demo Video Recorded**: Ready for recording
