# Anthropic Decision Analysis Platform

A sophisticated web application designed for executives and managers at Anthropic to make better decisions through interactive consequence analysis and forecast exploration.

## Features

### 🎯 Two Analysis Modes

1. **Decision Analysis Mode**: Input a decision and explore 1st and 2nd order consequences
2. **Forecast Analysis Mode**: Input a prediction and map plausible causal pathways

### 🔄 Interactive Node System

- **Editable Nodes**: Click to edit any consequence or cause
- **Dynamic Addition**: Add new branches to explore alternative pathways
- **Smart Deletion**: Remove irrelevant nodes while maintaining tree integrity
- **Drag & Drop**: Reposition nodes for better visualization

### 🤖 AI-Powered Commentary

- **Live Analysis**: Real-time explanations of changes and relationships
- **Strategic Insights**: Executive-level commentary on implications
- **Context Awareness**: Updates automatically as you modify the decision tree

### 🎨 Executive-Friendly Interface

- **Clean Design**: Professional interface suitable for C-level use
- **Responsive Layout**: Works on desktop and mobile devices
- **Visual Hierarchy**: Color-coded nodes by consequence order
- **Intuitive Controls**: Easy-to-use tools for complex analysis

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
4. Edit, add, or remove consequences as needed
5. Review the live commentary for strategic insights

### Forecast Analysis
1. Select "Forecast Analysis" mode
2. Enter a prediction (e.g., "AI will significantly impact hiring in 2024")
3. Examine the causal pathway map
4. Modify pathways to explore different scenarios
5. Use commentary to understand interconnections

## Technical Architecture

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **React Flow**: Interactive node graphs
- **Framer Motion**: Smooth animations

### AI Integration
- **Claude 3.5 Sonnet**: Consequence generation and analysis
- **Real-time Processing**: Dynamic commentary updates
- **Context Preservation**: Maintains analysis state across interactions

### Key Components
- `DecisionAnalyzer`: Main orchestration component
- `InteractiveNode`: Editable graph nodes
- `CommentaryPanel`: Live AI analysis display
- `ModeSelector`: Toggle between analysis types
- `InputPanel`: Decision/forecast input interface

## API Configuration

The application requires an Anthropic API key. Get yours at [console.anthropic.com](https://console.anthropic.com/).

```env
NEXT_PUBLIC_ANTHROPIC_API_KEY=your_api_key_here
```

## Development

### Project Structure
```
src/
├── app/
│   └── page.tsx              # Main entry point
├── components/
│   ├── DecisionAnalyzer.tsx  # Core application
│   ├── InteractiveNode.tsx   # Graph nodes
│   ├── CommentaryPanel.tsx   # AI commentary
│   ├── ModeSelector.tsx      # Mode switching
│   └── InputPanel.tsx        # Input interface
├── services/
│   └── aiService.ts          # Claude API integration
└── types/
    └── decision.ts           # TypeScript definitions
```

### Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint

## Contributing

This project is designed specifically for Anthropic's internal decision-making processes. External contributions should align with enterprise requirements and maintain the professional standard expected for executive tooling.

## Security

- API keys are required for functionality
- All analysis data remains client-side
- No decision data is permanently stored
- Secure communication with Anthropic's API

---

Built with ❤️ for better decision-making at Anthropic.
