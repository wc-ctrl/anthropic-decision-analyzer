# Claudeswitz

A sophisticated AI-powered decision analysis platform designed for executives and strategic planners to make better decisions through interactive consequence analysis and forecast exploration.

## Features

### 🎯 Multiple Analysis Modes

1. **Decision Analysis Mode**: Input a decision and explore 1st and 2nd order consequences
2. **Forecast Analysis Mode**: Input a prediction and map plausible causal pathways
3. **Scenario Planning Mode**: Generate probability-based scenario analysis with signposts
4. **Expert Mode**: Advanced analysis with deeper context and complexity controls

### 🔄 Interactive Node System

- **Editable Nodes**: Click to edit any consequence or cause
- **Dynamic Addition**: Add new branches to explore alternative pathways
- **Smart Deletion**: Remove irrelevant nodes while maintaining tree integrity
- **Drag & Drop**: Reposition nodes for better visualization
- **Deep Layer Analysis**: Generate additional consequence layers on demand
- **Sentiment Analysis**: Visual indicators for positive/negative/neutral outcomes

### 🤖 Advanced AI-Powered Analysis

- **Live Commentary**: Real-time explanations of changes and relationships
- **Strategic Insights**: Executive-level commentary on implications
- **Devil's Advocate Mode**: Generate contrarian analysis and counterarguments
- **Get Weird Analysis**: Surface unconventional but plausible scenarios using intuition pumps
- **Web-Enhanced Intelligence**: Real-time web context integration for current events
- **Topic Suggestions**: AI-powered recommendations for analysis topics
- **Quick Assessment**: Rapid strategic evaluation of decisions and forecasts

### 🔗 MCP Integrations

- **Google Drive Integration**: Import documents and export analysis results
- **Slack Integration**: Share analysis to #mission-lab-chatter and gather team input
- **Contextual Intelligence**: Pull organizational context from Slack conversations and Google Drive documents

### 📊 Advanced Scenario Tools

- **Probability Tracking**: Multi-tier probability scenarios (0-100%) with confidence intervals
- **Signpost Methodology**: Strategic indicators for tracking scenario development
- **Timeline Visualization**: Temporal mapping of scenario progression
- **Risk Assessment**: Quantified risk factors with impact analysis

### 🎨 Executive-Friendly Interface

- **Clean Design**: Professional interface suitable for C-level use
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Layout**: Works on desktop and mobile devices
- **Visual Hierarchy**: Color-coded nodes by consequence order and sentiment
- **Layout Controls**: Customizable node positioning and flow direction
- **Screenshot Sharing**: Capture and share analysis snapshots

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Anthropic API key

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure API Key**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local and add your Anthropic API key
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Open Browser**
   Navigate to `http://localhost:3000`

## Usage

### Decision Analysis
1. Select "Decision Analysis" mode
2. Enter a decision (e.g., "Launch new product line in Q2")
3. Explore the generated consequence tree
4. Use **Deep Layer** button to generate additional consequence levels
5. Try **Devil's Advocate** mode for contrarian analysis
6. Use **Get Weird** to surface unconventional but plausible outcomes
7. Share analysis to Slack or export snapshots

### Forecast Analysis
1. Select "Forecast Analysis" mode
2. Enter a prediction (e.g., "AI will significantly impact hiring in 2024")
3. Examine the causal pathway map
4. Use **Scenario Planning** to generate probability-based tracks
5. Monitor signposts to track scenario development
6. Apply web-enhanced intelligence for current events context

### Advanced Features
- **Expert Mode**: Toggle for deeper analysis and additional context
- **MCP Integration**: Import Google Drive documents or Slack conversations for context
- **Quick Assessment**: Get rapid strategic evaluation of your analysis
- **Topic Suggestions**: Let AI recommend relevant analysis topics
- **Dark Mode**: Switch themes for comfortable viewing

## Technical Architecture

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **React Flow**: Interactive node graphs
- **Framer Motion**: Smooth animations

### AI Integration
- **Claude Sonnet 4**: Advanced consequence generation and analysis
- **Real-time Processing**: Dynamic commentary updates
- **Context Preservation**: Maintains analysis state across interactions
- **Web Intelligence**: Real-time web context integration
- **MCP Protocol**: Google Drive and Slack integrations

### Key Components
- `DecisionAnalyzer`: Main orchestration component with expert mode
- `InteractiveNode`: Editable graph nodes with sentiment indicators
- `CommentaryPanel`: Live AI analysis display
- `ModeSelector`: Toggle between analysis types
- `InputPanel`: Enhanced input interface with topic suggestions
- `DevilsAdvocateModal`: Contrarian analysis interface
- `WeirdAnalysisModal`: Unconventional scenario generator
- `ScenarioAnalysisModal`: Probability-based scenario planning
- `McpIntegrationPanel`: Google Drive and Slack integration controls
- `DarkModeToggle`: Theme switching component
- `ShareAnalysisButton`: Export and sharing functionality

### API Endpoints
- `/api/analyze`: Core decision/forecast analysis
- `/api/devils-advocate`: Contrarian analysis generation
- `/api/get-weird`: Unconventional scenario analysis
- `/api/scenario`: Probability-based scenario planning
- `/api/share-slack`: Slack integration for sharing results
- `/api/mcp/*`: Google Drive and Slack MCP integrations
- `/api/web-enhanced-search`: Real-time web intelligence
- `/api/suggest-topics`: AI-powered topic recommendations

## Configuration

### API Configuration

The application requires an Anthropic API key. Get yours at [console.anthropic.com](https://console.anthropic.com/).

```env
NEXT_PUBLIC_ANTHROPIC_API_KEY=your_api_key_here
```

### MCP Integrations Setup

For Google Drive and Slack integrations, see the comprehensive [MCP Setup Guide](./MCP-SETUP.md) which covers:

- **Google Drive**: Import documents, export analysis results, access organizational context
- **Slack**: Share to #mission-lab-chatter, gather team input, pull conversation context
- **Authentication**: Service account setup for Google Drive, bot tokens for Slack
- **Permissions**: Proper access controls and security considerations

Quick setup:
```bash
./setup-mcp.sh
```

### Docker Deployment

The application includes Docker support for easy deployment:

```bash
# Development
docker-compose up

# Production
docker build -t claudeswitz .
docker run -p 3000:3000 claudeswitz
```

### Google Cloud Platform

Deploy to GCP with the included script:
```bash
./deploy-gcp.sh
```

## Development

### Project Structure
```
src/
├── app/
│   ├── api/                  # API endpoints
│   │   ├── analyze/          # Core analysis
│   │   ├── devils-advocate/  # Contrarian analysis
│   │   ├── get-weird/        # Unconventional scenarios
│   │   ├── scenario/         # Probability planning
│   │   ├── share-slack/      # Slack integration
│   │   ├── mcp/             # MCP integrations
│   │   └── web-enhanced-search/ # Web intelligence
│   └── page.tsx             # Main entry point
├── components/
│   ├── DecisionAnalyzer.tsx     # Core application with expert mode
│   ├── InteractiveNode.tsx      # Enhanced graph nodes
│   ├── CommentaryPanel.tsx      # AI commentary display
│   ├── DevilsAdvocateModal.tsx  # Contrarian analysis UI
│   ├── WeirdAnalysisModal.tsx   # Unconventional scenarios
│   ├── ScenarioAnalysisModal.tsx # Scenario planning
│   ├── McpIntegrationPanel.tsx  # MCP controls
│   ├── ShareAnalysisButton.tsx  # Export functionality
│   ├── DarkModeToggle.tsx       # Theme switching
│   ├── ModeSelector.tsx         # Enhanced mode switching
│   └── InputPanel.tsx           # Enhanced input interface
├── data/
│   └── intuitionPumps.json     # Unconventional thinking frameworks
├── services/
│   └── aiService.ts            # Enhanced Claude API integration
└── types/
    └── decision.ts             # Extended TypeScript definitions
```

### Available Scripts

- `npm run dev`: Start development server (with Turbopack)
- `npm run build`: Build for production (with Turbopack optimization)
- `npm run start`: Start production server
- `npm run lint`: Run ESLint
- `./setup-mcp.sh`: Configure MCP integrations automatically
- `./deploy-gcp.sh`: Deploy to Google Cloud Platform

## Contributing

This project is designed specifically for Anthropic's internal decision-making processes. External contributions should align with enterprise requirements and maintain the professional standard expected for executive tooling.

## Security

- **API Keys**: Anthropic API key required for AI functionality
- **MCP Integration**: Google Drive service accounts and Slack bot tokens with limited scopes
- **Data Privacy**: All analysis data remains client-side unless explicitly shared
- **No Permanent Storage**: Decision data is not permanently stored
- **Secure Communication**: Encrypted communication with Anthropic, Google, and Slack APIs
- **Permission Model**: Respects existing Google Drive and Slack permissions
- **Local Credentials**: MCP credentials stored locally, not in cloud

---

Built with ❤️ for better decision-making at Anthropic.
