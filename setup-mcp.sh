#!/bin/bash

# Anthropic Decision Analyzer - MCP Setup Script
echo "🚀 Setting up Model Context Protocol (MCP) integrations..."

# Install required MCP servers
echo "📦 Installing MCP servers..."

# Install Google Drive MCP server
npm install -g @modelcontextprotocol/server-gdrive
echo "✅ Google Drive MCP server installed"

# Install Slack MCP server
npm install -g @modelcontextprotocol/server-slack
echo "✅ Slack MCP server installed"

# Alternative: Install community Google Drive server (more features)
# npm install -g mcp-gdrive
# echo "✅ Community Google Drive MCP server installed"

echo ""
echo "📋 Next Steps:"
echo ""
echo "1. 🔑 Google Drive Setup:"
echo "   - Go to https://console.cloud.google.com/"
echo "   - Create a new project or select existing"
echo "   - Enable Google Drive API"
echo "   - Create service account credentials"
echo "   - Download JSON credentials file"
echo "   - Save as 'google-credentials.json' in project root"
echo ""
echo "2. 💬 Slack Setup:"
echo "   - Go to https://api.slack.com/apps"
echo "   - Create new Slack app"
echo "   - Add Bot Token Scopes: channels:read, files:read, users:read"
echo "   - Install app to workspace"
echo "   - Copy Bot User OAuth Token"
echo "   - Set SLACK_BOT_TOKEN environment variable"
echo ""
echo "3. 🔧 Claude Code MCP Configuration:"
echo "   - Add MCP servers to your Claude Code configuration"
echo "   - Update ~/.claude/mcp_servers.json or use Claude Code settings"
echo ""
echo "4. ✅ Test Integration:"
echo "   - Restart Claude Code"
echo "   - Test Google Drive access with MCP tools"
echo "   - Test Slack integration"
echo ""
echo "🎯 Your decision analyzer will then be able to:"
echo "   - Import data from Google Drive documents"
echo "   - Share analysis results to Slack channels"
echo "   - Collaborate on decisions through Slack integration"
echo ""
echo "For detailed setup instructions, see MCP-SETUP.md"