# Prompt Scaffold System

This document describes the two-tiered analytical framework system that enhances Claudeswitz's analysis quality through intelligent scaffold selection.

## System Overview

The prompt scaffold system automatically:
1. **Analyzes the input topic** to understand its complexity, information availability, and analytical requirements
2. **Selects the 5 most appropriate scaffolds** from a database of 23+ analytical frameworks
3. **Enhances the analysis prompts** with selected frameworks for deeper, more rigorous analysis
4. **Applies esoteric search strategies** for non-US topics requiring specialized sources

## Scaffold Categories

### 🔍 Search Strategies
Advanced information gathering and research methodologies:
- **Bayesian Network Construction**: Complex causal modeling with probability propagation
- **Temporal Layered Search**: Time-stratified research with momentum analysis
- **Multi-Source Triangulation**: Cross-verification across source types
- **Base Rate Research**: Reference class refinement for statistical baseline
- **Expert Consensus Mapping**: Authority-weighted forecasting aggregation
- **Contrarian Evidence Hunting**: Deliberate counter-evidence discovery
- **Primary Source Verification**: Official document verification protocols

### 🧠 Reasoning Strategies
Sophisticated analytical frameworks and logical structures:
- **Factor Tree Decomposition**: Hierarchical factor analysis with weighted scoring
- **Temporal Trajectory Analysis**: Phased probability calculation with momentum
- **Multi-Scenario Planning**: Comprehensive scenario enumeration and probability
- **Expert Perspective Simulation**: Multi-disciplinary viewpoint integration
- **Premortem Analysis**: Success/failure narrative plausibility assessment

### 🎯 Nudging Strategies
Quick analytical prompts for focused thinking:
- **Base Rate Consideration**: Historical frequency baseline establishment
- **Dependency Analysis**: Conditional probability chain evaluation
- **Information Asymmetry**: Evidence gap identification and impact
- **Temporal Reasoning**: Timeline and milestone criticality assessment
- **Historical Comparison**: Precedent analysis and pattern recognition

## Esoteric Search Strategy

For non-US topics, the system automatically applies enhanced source hierarchies:

**Tier 1**: Government statistical agencies, central banks, international organizations
**Tier 2**: Technical standards bodies, specifications, regulatory documents
**Tier 3**: Non-English regional sources, local government data
**Tier 4**: Open-source intelligence, NGO reports, academic datasets

## Updating Scaffolds

To add or modify scaffolds:

1. **Edit the database**: `src/data/promptScaffolds.json`
2. **Add new scaffolds** with proper structure:
   ```json
   {
     "id": "unique_identifier",
     "name": "Human-Readable Name",
     "category": "search/reasoning/nudging",
     "complexity": "low/medium/high",
     "applicability": ["topic_types", "use_cases"],
     "description": "Detailed framework instructions..."
   }
   ```
3. **Test scaffold selection** with relevant topics
4. **Deploy changes** - system automatically picks up new scaffolds

## Quality Metrics

The scaffold system is designed to improve:
- **Analytical rigor**: Systematic frameworks prevent ad-hoc reasoning
- **Source diversity**: Esoteric search expands beyond obvious sources
- **Bias mitigation**: Contrarian and multi-perspective approaches
- **Uncertainty quantification**: Probability-based reasoning frameworks
- **Strategic relevance**: Business-focused analytical structures

## Topic Analysis

For each topic, the system evaluates:
- **Complexity**: Information density and causal interconnections
- **Information Availability**: Source accessibility and data richness
- **Time Horizon**: Short/medium/long-term analytical requirements
- **Stakeholder Complexity**: Multi-party dynamics and influence mapping
- **Uncertainty Level**: Epistemological confidence and evidence gaps

## Usage in Analysis

Selected scaffolds are automatically integrated into analysis prompts with:
- **Framework descriptions**: Core methodology guidance
- **Rationale explanations**: Why each scaffold was chosen
- **Topic profiles**: Analytical context and requirements
- **Esoteric search**: Enhanced source strategies for complex topics

This creates a more sophisticated, rigorous analytical engine that adapts its methodology to the specific requirements of each strategic analysis topic.

---

*For technical implementation details, see `src/app/api/select-scaffolds/route.ts`*