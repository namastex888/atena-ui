# Atena UI - Project Plan

## Project Overview
Atena UI is a proof-of-concept web application for intelligent PDF document interaction. It provides a high-performance, modern interface for viewing pre-loaded PDF documents while enabling AI-powered conversations about the content.

## Core Features

### 1. PDF Document Management
- **Pre-loaded PDFs**: Documents stored in `/public/documents` folder
- **Document Selector**: Dropdown/list to switch between available PDFs
- **PDF Viewer**: Full-featured PDF viewer with:
  - Page navigation controls
  - Zoom controls  
  - Page counter (e.g., "1 de 14")
  - Smooth scrolling through pages
  - Virtual scrolling for performance

### 2. AI Chat Interface
- **Chat Panel**: Right-side panel for AI interactions
- **Message Types**:
  - User questions
  - AI responses with markdown support
- **Chat Features**:
  - Message history with virtualization
  - Clear conversation option
  - Typing indicators with animations
  - Send button with micro-interactions

### 3. Document Organization (POC)
- **Document List**: Display available PDFs from folder
- **Current Document**: Display active document name in header
- **Session Management**: Maintain chat history per document

## Technical Stack (Modern React Architecture)

### Frontend Core
- **Framework**: Next.js 14+ (App Router with Server Components)
- **Language**: TypeScript 5+ (strict mode)
- **Styling**: Tailwind CSS 3+ with custom design system
- **Animations**: Framer Motion for micro-interactions
- **UI Components**: shadcn/ui + custom compound components
- **PDF Rendering**: @react-pdf/renderer with react-window for virtualization
- **Icons**: Lucide React

### State Management
- **Client State**: Zustand with TypeScript
- **Server State**: TanStack Query (React Query) v5
- **Form State**: React Hook Form + Zod validation

### Performance Optimization
- **Code Splitting**: Route-based with dynamic imports
- **Virtualization**: react-window for long lists
- **Memoization**: Strategic use of useMemo, useCallback
- **Suspense**: Loading boundaries for better UX

### Backend Integration
- **API Client**: Axios with interceptors
- **Mock Service**: MSW (Mock Service Worker) for development
- **Real API**: RESTful endpoints (to be integrated later)
- **WebSockets**: For real-time chat updates (future)

### Testing & Quality
- **Unit Tests**: Vitest + React Testing Library
- **E2E Tests**: Playwright
- **Type Safety**: TypeScript strict mode
- **Linting**: ESLint + Prettier

## Project Structure

```
atena-ui/
├── public/
│   └── documents/           # Pre-loaded PDF files
│       ├── sample1.pdf
│       ├── sample2.pdf
│       └── ...
├── src/
│   ├── app/
│   │   ├── layout.tsx       # Root layout with providers
│   │   ├── page.tsx         # Main application
│   │   └── globals.css      # Tailwind + custom styles
│   ├── components/
│   │   ├── pdf-viewer/
│   │   │   ├── PDFViewer.tsx        # Main PDF component
│   │   │   ├── PDFControls.tsx      # Zoom/navigation controls
│   │   │   ├── PageNavigation.tsx   # Page selector
│   │   │   └── VirtualPDFPage.tsx   # Virtualized page component
│   │   ├── chat/
│   │   │   ├── ChatPanel.tsx        # Chat container
│   │   │   ├── MessageList.tsx      # Virtualized message list
│   │   │   ├── MessageInput.tsx     # Input with validation
│   │   │   ├── Message.tsx          # Message component
│   │   │   └── TypingIndicator.tsx  # Animated typing state
│   │   ├── sidebar/
│   │   │   ├── DocumentList.tsx     # Available documents
│   │   │   └── DocumentCard.tsx     # Document item
│   │   └── ui/
│   │       └── (shadcn components + custom)
│   ├── hooks/
│   │   ├── useDocument.ts
│   │   ├── useChat.ts
│   │   └── useOptimisticUpdate.ts
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts            # Axios setup
│   │   │   ├── chat.api.ts          # Chat endpoints
│   │   │   └── mock-handlers.ts     # MSW handlers
│   │   └── utils/
│   │       ├── pdf.ts
│   │       └── cn.ts                # Class name utility
│   ├── stores/
│   │   ├── document.store.ts        # Zustand document state
│   │   └── chat.store.ts            # Zustand chat state
│   ├── types/
│   │   ├── document.ts
│   │   ├── chat.ts
│   │   └── api.ts
│   └── styles/
│       └── themes.ts                # Design tokens
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

## UI Layout Design

### Desktop Layout (Primary)
```
┌─────────────────────────────────────────────────────────┐
│                    Header Bar                           │
│  [Logo] Atena UI    [Current Doc]    [Doc Selector ▼]  │
├─────────┬───────────────────────────┬──────────────────┤
│         │                           │                  │
│ Sidebar │      PDF Viewer          │   Chat Panel     │
│         │                           │                  │
│ Docs    │   ┌─────────────┐        │  ┌─ AI Agent ─┐  │
│  List   │   │             │        │  │            │  │
│         │   │   PDF Page   │        │  │  Messages  │  │
│ ─────── │   │             │        │  │            │  │
│         │   │             │        │  │            │  │
│ Doc 1   │   └─────────────┘        │  └────────────┘  │
│ Doc 2   │                           │                  │
│ Doc 3   │   [◀] Page 1/14 [▶]      │  [Input] [Send]  │
│         │   [−] Zoom [+]           │                  │
└─────────┴───────────────────────────┴──────────────────┘
```

### Color Scheme (Brand Colors)
```css
:root {
  /* Primary Brand Blue */
  --primary-blue: rgb(11, 66, 121);      /* #0B4279 */
  --primary-blue-light: rgb(28, 97, 166); 
  --primary-blue-dark: rgb(7, 44, 80);
  
  /* Accent Colors */
  --accent-cyan: rgb(34, 211, 238);      /* Modern cyan accent */
  --accent-indigo: rgb(99, 102, 241);    /* Complementary indigo */
  
  /* Neutrals */
  --gray-50: rgb(249, 250, 251);
  --gray-100: rgb(243, 244, 246);
  --gray-200: rgb(229, 231, 235);
  --gray-900: rgb(17, 24, 39);
  
  /* Semantic */
  --success: rgb(34, 197, 94);
  --warning: rgb(251, 146, 60);
  --error: rgb(239, 68, 68);
}
```

### Design System
- **Primary**: Deep Blue (`rgb(11, 66, 121)`) - Client's brand color
- **Background**: Light gray with subtle blue tint
- **PDF Viewer**: White with soft shadow and blue accent border
- **Chat**: Glass morphism effect with blue gradients
- **Text**: High contrast dark gray
- **Interactive Elements**: Blue gradients with hover states

## Development Phases

### Phase 1: Foundation (Day 1)
- [ ] Initialize Next.js 14 with TypeScript
- [ ] Setup Tailwind CSS with custom theme
- [ ] Install shadcn/ui and configure
- [ ] Setup Zustand and TanStack Query
- [ ] Create base layout structure
- [ ] Configure MSW for API mocking

### Phase 2: PDF Viewer (Day 2)
- [ ] Integrate react-pdf
- [ ] Load PDFs from public folder
- [ ] Implement document selector
- [ ] Add page navigation
- [ ] Add zoom controls
- [ ] Implement virtual scrolling

### Phase 3: Chat Interface (Day 3)
- [ ] Create chat components with Framer Motion
- [ ] Implement message virtualization
- [ ] Add React Hook Form for input
- [ ] Setup mock AI responses
- [ ] Add typing indicators
- [ ] Implement optimistic updates

### Phase 4: Integration & Polish (Day 4-5)
- [ ] Connect PDF context to chat
- [ ] Add loading states with Suspense
- [ ] Implement error boundaries
- [ ] Optimize performance
- [ ] Add micro-interactions
- [ ] Responsive design adjustments

## API Specification (Mock)

### Chat Endpoints

#### Send Message
```typescript
POST /api/chat/message
{
  message: string;
  documentId: string;
  sessionId: string;
  context?: {
    currentPage: number;
    selectedText?: string;
  }
}

Response:
{
  id: string;
  response: string;
  sessionId: string;
  timestamp: string;
  tokens: {
    prompt: number;
    completion: number;
  }
}
```

#### Get Chat History
```typescript
GET /api/chat/sessions/:sessionId

Response:
{
  sessionId: string;
  documentId: string;
  messages: Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>;
}
```

#### Stream Response (Future)
```typescript
GET /api/chat/stream
EventSource for real-time streaming
```

## Performance Targets

- **Lighthouse Score**: 95+
- **First Contentful Paint**: < 1s
- **Time to Interactive**: < 2s
- **Bundle Size**: < 200KB initial
- **PDF Rendering**: < 500ms per page

## Key Modern Patterns

1. **Server Components**: Reduce bundle size for static parts
2. **Suspense Boundaries**: Graceful loading states
3. **Optimistic UI**: Immediate feedback on user actions
4. **Virtual Scrolling**: Handle large PDFs and chat histories
5. **Compound Components**: Flexible, composable UI
6. **Custom Hooks**: Reusable business logic
7. **Type Safety**: End-to-end TypeScript

## Success Criteria

- [ ] Load and display PDFs from `/public/documents`
- [ ] Smooth PDF navigation with < 100ms response
- [ ] Chat responses appear instantly (optimistic)
- [ ] Professional UI with brand colors
- [ ] Mobile-responsive layout
- [ ] All interactions have micro-animations
- [ ] TypeScript strict mode with no errors
- [ ] Mock API simulates realistic AI behavior

## Next Steps

1. **Immediate**: Setup Next.js with modern stack
2. **Day 1**: Foundation and layout
3. **Day 2**: PDF viewer implementation
4. **Day 3**: Chat interface
5. **Day 4-5**: Integration and polish
6. **Future**: Real backend API integration

## Notes

- POC focused on core functionality
- No authentication or user management
- PDFs pre-loaded in public folder
- Emphasis on performance and modern UX
- Production-ready code quality despite POC status