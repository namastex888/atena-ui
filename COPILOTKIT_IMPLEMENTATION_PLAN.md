# CopilotKit Integration Plan - Atena Tutora de Estudos

## Overview
Implementation plan for **Atena Tutora de Estudos** - an AI-powered study assistant for Universidade Cruzeiro do Sul students, built with CopilotKit and Agno backend integration.

## Project Context
- **Product**: Atena - Tutora Inteligente de Estudos
- **Target Users**: University students at Cruzeiro do Sul
- **Frontend**: Next.js 14 with TypeScript
- **AI Integration**: CopilotKit's CopilotSidebar with Agno backend
- **Core Purpose**: Intelligent study companion for academic materials

## Implementation Phases

### Phase 1: Environment Configuration

#### 1.1 Create Environment Variables
**File**: `.env.local`
```bash
# Agno Backend Configuration
NEXT_PUBLIC_AGNO_API_URL=http://localhost:18886
NEXT_PUBLIC_AGNO_AGENT_ID=atena
NEXT_PUBLIC_AGNO_ENDPOINT_PATH=/agui

# CopilotKit Configuration
NEXT_PUBLIC_COPILOT_RUNTIME_URL=/api/copilotkit

# Optional: API Keys (if needed by your Agno backend)
OPENAI_API_KEY=your_openai_api_key_here
```

#### 1.2 Create Type-safe Configuration
**File**: `/lib/config/environment.ts`
```typescript
// Type-safe environment configuration
const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const config = {
  agno: {
    apiUrl: getEnvVar('NEXT_PUBLIC_AGNO_API_URL'),
    agentId: getEnvVar('NEXT_PUBLIC_AGNO_AGENT_ID'),
    endpointPath: getEnvVar('NEXT_PUBLIC_AGNO_ENDPOINT_PATH', '/agui'),
  },
  copilotKit: {
    runtimeUrl: getEnvVar('NEXT_PUBLIC_COPILOT_RUNTIME_URL', '/api/copilotkit'),
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY, // Optional, may not be needed
  }
} as const;

// Helper to construct the full Agno endpoint URL
export const getAgnoEndpointUrl = () => {
  return `${config.agno.apiUrl}${config.agno.endpointPath}`;
};
```

### Phase 2: Backend Integration Setup

#### 2.1 Install Dependencies
```bash
npm install @copilotkit/react-core @copilotkit/react-ui @copilotkit/runtime @ag-ui/client openai
```

#### 2.2 Create CopilotKit API Route
**File**: `/app/api/copilotkit/route.ts`
```typescript
import {
  CopilotRuntime,
  OpenAIAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { HttpAgent } from "@ag-ui/client";
import { NextRequest } from "next/server";
import { config, getAgnoEndpointUrl } from "@/lib/config/environment";
import OpenAI from "openai";

// Initialize OpenAI client for the adapter
// NOTE: OpenAI adapter is required for CopilotKit features like suggestions
// The Agno agent will handle the main chat interactions
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "dummy-key-for-development"
});

// Create the service adapter for non-agent components
const serviceAdapter = new OpenAIAdapter({ openai });

// Create the Agno agent using HttpAgent from @ag-ui/client
const agnoAgent = new HttpAgent({
  url: getAgnoEndpointUrl(),
});

// Create the CopilotRuntime instance with Agno AG-UI integration
const runtime = new CopilotRuntime({
  agents: {
    [config.agno.agentId]: agnoAgent,
  }   
});

// Build a Next.js API route that handles the CopilotKit runtime requests
export const POST = async (req: NextRequest) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: "/api/copilotkit",
  });
  
  return handleRequest(req);
};
```

### Phase 3: Provider Configuration

#### 3.1 Update Root Layout
**File**: `/app/layout.tsx`
```typescript
import { CopilotKit } from "@copilotkit/react-core";
import "@copilotkit/react-ui/styles.css";
import { config } from "@/lib/config/environment";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <CopilotKit runtimeUrl={config.copilotKit.runtimeUrl}>
          {children}
        </CopilotKit>
      </body>
    </html>
  );
}
```

### Phase 4: UI Migration

#### 4.1 Replace Chat Panel with CopilotSidebar
**File**: `/app/page.tsx`

**Changes**:
- Remove `<ChatPanel />` component
- Add `<CopilotSidebar />` from `@copilotkit/react-ui`
- Configure sidebar positioning and styling

```typescript
import { CopilotSidebar } from "@copilotkit/react-ui";
import { useCoAgent } from "@copilotkit/react-core";
import { config } from "@/lib/config/environment";

// Inside component:
useCoAgent({
  name: config.agno.agentId,
  initialState: {
    documentId: currentDocument?.id,
    documentName: currentDocument?.name,
    documentContent: currentDocument?.content
  }
});

// Replace chat panel with:
<CopilotSidebar
  defaultOpen={true}
  clickOutsideToClose={false}
  labels={{
    title: "Atena AI Assistant",
    initial: "Olá! Sou a Atena, sua assistente inteligente de documentos. Como posso ajudá-lo hoje?",
    placeholder: "Digite sua pergunta sobre o documento...",
  }}
  icons={{
    // Custom icons if needed
  }}
/>
```

#### 4.2 Custom Styling
**File**: `/app/globals.css`

Add custom CSS variables for branding:
```css
:root {
  --copilot-kit-primary-color: #3B82F6; /* Match current primary color */
  --copilot-kit-contrast-color: #FFFFFF;
  --copilot-kit-background-color: #FFFFFF;
  --copilot-kit-secondary-color: #F3F4F6;
  --copilot-kit-separator-color: #E5E7EB;
}

/* Custom sidebar width to match current chat panel */
.copilotKitSidebar {
  width: 384px; /* 24rem - matches current w-96 */
}

/* Custom font to match project */
.copilotKitMessages,
.copilotKitInput {
  font-family: 'Inter', sans-serif;
}
```

### Phase 5: Document Context Integration

#### 5.1 Shared State Management
**Create**: `/hooks/useCopilotDocument.ts`
```typescript
import { useCopilotReadable } from "@copilotkit/react-core";
import { useDocumentStore } from "@/stores/document.store";

export function useCopilotDocument() {
  const { currentDocument, currentPage } = useDocumentStore();
  
  // Make document context readable by Copilot
  useCopilotReadable({
    description: "Current PDF document information",
    value: {
      documentId: currentDocument?.id,
      documentName: currentDocument?.name,
      currentPage: currentPage,
      totalPages: currentDocument?.totalPages,
    }
  });
}
```

#### 5.2 Frontend Actions for Document Interaction
**Create**: `/lib/copilot-actions.ts`
```typescript
import { useCopilotAction } from "@copilotkit/react-core";

// Action to navigate to specific page
useCopilotAction({
  name: "navigateToPage",
  description: "Navigate to a specific page in the PDF",
  parameters: [
    {
      name: "pageNumber",
      type: "number",
      description: "The page number to navigate to",
    }
  ],
  handler: ({ pageNumber }) => {
    // Implement navigation logic
  }
});

// Action to highlight text in PDF
useCopilotAction({
  name: "highlightText",
  description: "Highlight specific text in the PDF",
  parameters: [
    {
      name: "text",
      type: "string",
      description: "Text to highlight",
    }
  ],
  handler: ({ text }) => {
    // Implement highlighting logic
  }
});
```

### Phase 6: Component Cleanup

#### 6.1 Remove Obsolete Components
- Delete `/components/chat/` directory
- Remove chat-related code from stores (keep document store)
- Clean up unused chat types and utilities

#### 6.2 Update Imports
- Update all imports in `/app/page.tsx`
- Remove references to old chat components

## POC Features - Atena Tutora de Estudos

### Core Study Features for University Materials

Designed for university-level academic content, these are the **essential features for the POC**:

#### 1. Essential Contextual Actions (POC Implementation)
When highlighting text in the theory PDFs:

```typescript
// THREE CORE ACTIONS FOR POC
useCopilotAction({
  name: "explainConcept",
  description: "Explain the selected rule or concept in simple terms",
  parameters: [{
    name: "selectedText",
    type: "string",
    description: "The highlighted text from the theory PDF",
  }],
  handler: async ({ selectedText }) => {
    // Explain the theoretical concept clearly
  }
});

useCopilotAction({
  name: "generateExamples",
  description: "Provide practical examples of this theory",
  parameters: [{
    name: "selectedText",
    type: "string",
  }],
  handler: async ({ selectedText }) => {
    // Give real-world scenarios where this applies
  }
});

useCopilotAction({
  name: "testKnowledge",
  description: "Create a practice question about this topic",
  parameters: [{
    name: "selectedText",
    type: "string",
  }],
  handler: async ({ selectedText }) => {
    // Generate exam-style question
  }
});
```

**POC Context Menu:**
- 📖 **"Explicar"** - Explicação clara e direta
- 💡 **"Exemplos"** - Casos práticos e aplicações reais
- ❓ **"Quiz Me"** - Teste seu conhecimento

#### 2. Atena Chat Assistant (POC Priority)

**Intelligent Academic Support:**
```typescript
// Context-aware chat that knows current study material
useCopilotReadable({
  description: "Current academic material being studied",
  value: {
    currentTopic: currentChapter,
    currentPage: pageNumber,
    lastHighlight: lastSelectedText,
    studySessionDuration: timeOnPage,
  }
});
```

**Atena's Capabilities:**
- **"Explique o conceito de..."** - Detailed conceptual explanations
- **"Compare X com Y"** - Comparative analysis
- **"Resumo do material"** - Smart summaries
- **"Preparação para prova"** - Exam preparation assistance

#### 3. Quick Chat Suggestions (POC Implementation)

**Smart Study Suggestions:**
```typescript
// Quick action buttons for common study tasks
const quickPrompts = [
  { icon: "📚", text: "Resumir este conteúdo" },
  { icon: "🎯", text: "Questões de revisão" },
  { icon: "💭", text: "Conceitos principais" },
  { icon: "🔍", text: "Aprofundar tema" },
];

// Click handler sends prefilled message
const handleQuickPrompt = (prompt: string) => {
  copilot.sendMessage(prompt);
};
```

#### 4. Interactive Assessment with Generative UI (POC Showcase)

```typescript
// Generate interactive assessments with custom UI
useCopilotAction({
  name: "createAssessment",
  description: "Create interactive assessment from study material",
  renderAs: "AssessmentComponent", // Custom generative UI
  parameters: [{
    name: "topic",
    type: "string",
    description: "Academic topic from current material",
  }],
});

// Assessment Component - Atena's Interactive UI
function AssessmentComponent({ questions }: { questions: AssessmentQuestion[] }) {
  return (
    <div className="atena-assessment">
      <header className="assessment-header">
        <h3>Avaliação de Compreensão</h3>
        <span className="progress">{answered}/{total} respondidas</span>
      </header>
      {questions.map((q, idx) => (
        <QuestionCard 
          key={idx}
          question={q.question}
          options={q.options}
          correctAnswer={q.correct}
          explanation={q.academicExplanation}
        />
      ))}
      <footer className="assessment-footer">
        <button onClick={submitAssessment}>Finalizar Avaliação</button>
      </footer>
    </div>
  );
}
```

**Assessment Features:**
- **Multiple choice & open questions** with academic rigor
- **Progress tracking** with performance metrics
- **Detailed explanations** with references to material
- **Performance report** with study recommendations

#### 5. Placeholder UI for Future Features (POC - Visual Only)

```typescript
// Future features roadmap - Gen-Z friendly
const futureFeatures = [
  { icon: "🎤", label: "Voz", status: "Em Breve", tooltip: "Interação por voz com Atena" },
  { icon: "🃏", label: "Flashcards", status: "Em Breve", tooltip: "Criar cartões de estudo" },
  { icon: "🧠", label: "Mind Maps", status: "Em Breve", tooltip: "Mapas mentais visuais" },
  { icon: "📊", label: "Analytics", status: "Em Breve", tooltip: "Seu progresso de estudos" },
];

// Render in Atena's interface
{futureFeatures.map(feature => (
  <button disabled className="atena-future-feature">
    <span>{feature.icon}</span>
    <span>{feature.label}</span>
    <badge className="coming-soon">Em Breve</badge>
  </button>
))}
```

### POC Implementation Examples

#### Atena's Smart Study Interface
```typescript
// PDFViewer.tsx - Atena's contextual study tools
const handleTextSelection = () => {
  const selection = window.getSelection();
  const selectedText = selection.toString();
  
  if (selectedText) {
    showAtenaMenu({
      x: event.clientX,
      y: event.clientY,
      options: [
        // Active Study Tools
        { icon: "📖", label: "Explicar", action: "explainConcept", active: true },
        { icon: "💡", label: "Exemplos", action: "giveExamples", active: true },
        { icon: "❓", label: "Quiz Me", action: "testKnowledge", active: true },
        
        // Coming Soon
        { icon: "🃏", label: "Flashcard", action: null, active: false, badge: "Em Breve" },
        { icon: "🎤", label: "Audio", action: null, active: false, badge: "Em Breve" },
      ]
    });
  }
};
```

#### Theory Study Use Cases (Driving Theory Example)
```typescript
// When highlighting "velocidade máxima em vias urbanas"
POC Actions:
- "Explicar" → "Em vias urbanas, a velocidade máxima é 50 km/h..."
- "Exemplos" → "Imagine que você está dirigindo na Avenida Paulista..."
- "Testar" → "Qual a velocidade máxima permitida em áreas escolares?"

// When highlighting "direito de preferência"
POC Actions:
- "Explicar" → "O direito de preferência determina quem passa primeiro..."
- "Exemplos" → "Em um cruzamento sem sinalização..."
- "Testar" → "Quem tem preferência: veículo à direita ou à esquerda?"
```

### POC Scope Summary

#### ✅ What's IN the POC:
1. **CopilotSidebar** integration with Agno backend
2. **3 Core Contextual Actions** (Explicar, Exemplos, Testar)
3. **Quick Chat Prompts** (4 prefilled suggestions)
4. **Interactive Quiz** with Generative UI (showcase feature)
5. **"Em Breve" placeholders** for future features

#### ⏳ What's DEFERRED (shown as "Em Breve"):
- **Voice Interaction** - Read/speak answers
- **Flashcard Generation** - Study cards from highlights  
- **Socratic Mode** - Deep questioning
- **Analytics Dashboard** - Learning progress
- **Note Export** - PDF summaries
- **Collaborative Features** - Share with study groups

#### 🎯 POC Success Metrics:
- Student can highlight text and get instant explanation
- Quiz generates real questions from PDF content
- Chat understands current page context
- UI shows future potential with "Em Breve" features
- Entire flow works end-to-end with Agno backend

## Migration Checklist

### Pre-Implementation
- [x] Verify Agno backend is running (check configured URL)
- [x] Ensure Agno agent has AG-UI endpoint configured
- [x] Create `.env.local` file with required variables
- [x] Backup current implementation (using git)

### Implementation Steps
- [x] Create environment configuration file (`/lib/config/environment.ts`)
- [x] Install CopilotKit dependencies
- [x] Install @ag-ui/client and openai packages
- [x] Create API route for CopilotKit runtime (with OpenAI adapter)
- [x] Add CopilotKit provider to root layout
- [x] Import default CopilotKit styles
- [x] Replace ChatPanel with CopilotSidebar
- [x] Configure sidebar labels and styling
- [x] Integrate document context with useCopilotReadable
- [x] Add useCoAgent hook for Agno agent connection
- [x] Implement frontend actions for PDF interaction
- [x] Add useCopilotChatSuggestions for quick prompts
- [x] Test basic chat functionality
- [x] Implement quiz feature with generative UI
- [x] Add 'Em Breve' placeholder features
- [x] Style CopilotSidebar with custom CSS
- [x] Remove old chat components
- [x] Update documentation

### Post-Implementation
- [x] Test document context sharing
- [x] Verify PDF navigation actions work
- [x] Test with multiple documents
- [x] Performance testing
- [x] User acceptance testing

## Environment Variables Template
Create `.env.local.example`:
```bash
# Agno Backend Configuration
NEXT_PUBLIC_AGNO_API_URL=http://localhost:18886
NEXT_PUBLIC_AGNO_AGENT_ID=atena
NEXT_PUBLIC_AGNO_ENDPOINT_PATH=/agui

# CopilotKit Configuration
NEXT_PUBLIC_COPILOT_RUNTIME_URL=/api/copilotkit

# Optional: API Keys (if needed by your Agno backend)
# OPENAI_API_KEY=your_openai_api_key_here
```

**Note**: Copy this to `.env.local` and update values according to your environment.

## Testing Strategy

### Phase 1: Basic Functionality Tests
- [x] Verify environment variables are loaded correctly
- [x] Test API route responds to POST requests
- [x] Confirm CopilotSidebar renders without errors
- [x] Test basic message send/receive with Agno backend

### Phase 2: Integration Tests
- [x] Test document context is sent to Agno
- [x] Verify agent receives correct document information
- [x] Test sidebar state persistence
- [x] Validate message formatting and markdown rendering

### Phase 3: Advanced Tests (Post-Basic Implementation)
- [x] Test with real PDF documents
- [x] Verify multi-document switching
- [x] Test error handling and recovery
- [x] Performance testing with large documents

### Debug Checklist
If issues occur:
1. Check browser console for errors
2. Verify network tab shows requests to `/api/copilotkit`
3. Check Agno backend logs for incoming requests
4. Validate environment variables are set correctly
5. Ensure CORS is properly configured if needed

## Rollback Plan
If issues arise:
1. Git revert to previous commit
2. Restore package.json dependencies
3. Restore chat components from backup
4. Re-deploy previous version

## POC Timeline Estimate
- Phase 1: 30 minutes (Environment configuration)
- Phase 2: 1 hour (Backend setup)
- Phase 3: 30 minutes (Provider configuration)
- Phase 4: 2 hours (UI migration with CopilotSidebar)
- Phase 5: 3 hours (POC features implementation):
  - 1 hour: 3 contextual actions
  - 30 min: Quick chat prompts
  - 1 hour: Quiz with Generative UI
  - 30 min: "Em Breve" placeholders
- Phase 6: 30 minutes (Cleanup)
- Testing: 1 hour (End-to-end validation)
- **Total POC: ~8 hours**

## Key Dependencies
```json
{
  "@copilotkit/react-core": "latest",
  "@copilotkit/react-ui": "latest",
  "@copilotkit/runtime": "latest",
  "@ag-ui/agno": "latest"
}
```

## Success Metrics
- [x] Chat functionality fully replaced with CopilotSidebar
- [x] Document context properly shared with agent
- [x] PDF navigation working from chat commands
- [x] No regression in existing functionality
- [x] Improved user experience with prebuilt UI

## Important Notes

### Configuration Best Practices
- All environment-specific values are configurable via `.env.local`
- Type-safe configuration module ensures runtime errors are caught early
- No hardcoded URLs or IDs in the codebase
- Easy to switch between development, staging, and production environments

### Why CopilotSidebar?
- **Better UX**: Prebuilt components handle edge cases and accessibility
- **Built-in Features**: Typing indicators, message streaming, markdown rendering
- **Responsive**: Works on mobile out of the box
- **Customizable**: Full control over styling and behavior via props
- **Maintained**: Regular updates and bug fixes from CopilotKit team

### Agno Backend Requirements
Your Agno backend should:
1. Expose an AG-UI compatible endpoint (typically `/agui`)
2. Be configured with the AGUIApp wrapper
3. Handle the agent logic and tool execution
4. Return properly formatted responses for CopilotKit

### Next Steps After Basic Implementation
Once the basic integration is working:
1. Monitor real request/response payloads
2. Identify patterns in agent responses
3. Design custom UI components for specific response types
4. Plan advanced features based on actual capabilities
5. Optimize performance based on real usage patterns