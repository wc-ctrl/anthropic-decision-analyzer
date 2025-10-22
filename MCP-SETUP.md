# MCP (Model Context Protocol) Setup Guide

This guide will help you integrate Google Drive and Slack with your Anthropic Decision Analysis Platform using Model Context Protocol.

## 🚀 Quick Start

Run the automated setup script:

```bash
./setup-mcp.sh
```

## 📋 Manual Setup Instructions

### 1. 🔑 Google Drive MCP Server Setup

#### Install the MCP Server
```bash
npm install -g @modelcontextprotocol/server-gdrive
```

#### Configure Google Drive API

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create or Select Project**: Choose existing or create new project
3. **Enable APIs**:
   - Google Drive API
   - Google Docs API
   - Google Sheets API
4. **Create Service Account**:
   - Navigate to "Credentials" → "Create Credentials" → "Service Account"
   - Name: `anthropic-decision-analyzer-mcp`
   - Role: `Project → Editor` (or custom role with Drive access)
5. **Generate Key**:
   - Click on the service account
   - Go to "Keys" tab
   - "Add Key" → "Create New Key" → "JSON"
   - Download the JSON file
6. **Save Credentials**:
   ```bash
   # Save the downloaded JSON as:
   mv ~/Downloads/your-service-account-key.json ./google-credentials.json
   ```

#### Share Google Drive Access
1. **Copy Service Account Email** from the JSON file (`client_email` field)
2. **Share Google Drive Folders/Files** with this email address
3. **Grant appropriate permissions** (Viewer for read-only, Editor for read-write)

### 2. 💬 Slack MCP Server Setup

#### Install the MCP Server
```bash
npm install -g @modelcontextprotocol/server-slack
```

#### Configure Slack App

1. **Go to Slack API**: https://api.slack.com/apps
2. **Create New App**: "From scratch"
   - App Name: `Anthropic Decision Analyzer`
   - Workspace: Select your workspace
3. **Bot Token Scopes** (OAuth & Permissions):
   ```
   channels:read      - View basic information about public channels
   channels:history   - View messages in public channels
   chat:write         - Send messages as the bot
   files:read         - View files shared in channels
   users:read         - View people in the workspace
   users:read.email   - View email addresses of people
   ```
4. **Install App**: Click "Install to Workspace"
5. **Copy Bot Token**: Starts with `xoxb-`

#### Set Environment Variables
```bash
export SLACK_BOT_TOKEN=xoxb-your-bot-token-here
export SLACK_USER_TOKEN=xoxp-your-user-token-here  # Optional for enhanced features
```

### 3. 🔧 Claude Code MCP Configuration

#### Option A: Global MCP Configuration

Add to your Claude Code global configuration:

```json
{
  "mcpServers": {
    "google-drive": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-gdrive"],
      "env": {
        "GOOGLE_APPLICATION_CREDENTIALS": "/path/to/your/google-credentials.json"
      }
    },
    "slack": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-slack"],
      "env": {
        "SLACK_BOT_TOKEN": "xoxb-your-bot-token",
        "SLACK_USER_TOKEN": "xoxp-your-user-token"
      }
    }
  }
}
```

#### Option B: Project-Specific Configuration

Use the provided `mcp-config.json` and update with your credentials.

### 4. 🧪 Testing the Integration

#### Test Google Drive Access
```bash
# Claude Code should now have access to MCP Google Drive tools
# You can use commands like:
# - List files in Google Drive
# - Read Google Docs content
# - Access Google Sheets data
```

#### Test Slack Integration
```bash
# Claude Code should now have access to MCP Slack tools
# You can use commands like:
# - List Slack channels
# - Read message history
# - Post messages to channels
```

## 🎯 Integration with Decision Analyzer

Once MCP is configured, you can enhance your decision analysis workflow:

### 📊 Google Drive Integration
- **Import Research**: Pull relevant documents into decision analysis
- **Export Results**: Save analysis results to Google Docs/Sheets
- **Team Collaboration**: Share decision trees via Google Drive
- **Historical Analysis**: Access past decision documents for context

### 💬 Slack Integration
- **Team Input**: Gather stakeholder opinions from Slack channels
- **Real-Time Updates**: Post analysis results to relevant channels
- **Decision Tracking**: Create decision threads in Slack
- **Notification System**: Alert teams when analysis is complete

## 🔒 Security Considerations

- **Google Drive**: Service account has limited, specific permissions
- **Slack**: Bot tokens are workspace-specific and scope-limited
- **Local Storage**: Credentials stored locally, not in cloud
- **Permission Model**: Respects existing Google/Slack permissions

## 🛠️ Advanced Configuration

### Custom Google Drive Folders
```json
{
  "google-drive": {
    "specificFolders": [
      "1BxY7z...decision-documents",
      "1CxZ8a...strategic-planning"
    ],
    "fileTypes": ["docs", "sheets", "slides", "pdf"]
  }
}
```

### Slack Channel Filtering
```json
{
  "slack": {
    "allowedChannels": ["#executive-decisions", "#strategy", "#planning"],
    "excludeChannels": ["#random", "#general"]
  }
}
```

## 🐛 Troubleshooting

### Common Issues
1. **"Permission denied"**: Check Google Drive sharing settings
2. **"Invalid token"**: Regenerate Slack bot token
3. **"MCP server not found"**: Ensure npm packages installed globally
4. **"Connection refused"**: Restart Claude Code after configuration

### Debug Commands
```bash
# Test Google Drive MCP server directly
npx @modelcontextprotocol/server-gdrive

# Test Slack MCP server directly
SLACK_BOT_TOKEN=your-token npx @modelcontextprotocol/server-slack

# Check Claude Code MCP logs
tail -f ~/.claude/logs/mcp.log
```

## 📚 Resources

- [Anthropic MCP Documentation](https://www.anthropic.com/news/model-context-protocol)
- [Google Drive API Documentation](https://developers.google.com/drive/api)
- [Slack API Documentation](https://api.slack.com/)
- [MCP Server Repository](https://github.com/modelcontextprotocol/servers)

---

🎉 **Once configured**, your decision analyzer will have powerful integrations with your organization's Google Drive and Slack, enabling seamless collaboration and data access for better decision-making!