'use client';

import { useEffect, useState } from 'react';
import { DocumentList } from '@/components/sidebar/DocumentList';
import { PDFViewer } from '@/components/pdf-viewer/PDFViewerAllPages';
import { CopilotKit } from '@copilotkit/react-core';
import { CopilotSidebar } from '@copilotkit/react-ui';
import { useCopilotReadable, useCopilotContext } from '@copilotkit/react-core';
import { BookOpen } from 'lucide-react';
import { useDocumentStore } from '@/stores/document.store';
import { useCopilotActions } from '@/lib/copilot/actions';
import { config } from '@/lib/config/environment';
import { AtenaPrompts } from '@/lib/prompts/atena-prompts';

// Generate UUID for thread management
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function HomeContent() {
  const { currentDocument, extractedText, currentPage, totalPages } = useDocumentStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Share current document context with the Agno agent
  useCopilotReadable({
    description: AtenaPrompts.documentContext.description,
    value: currentDocument ? 
      AtenaPrompts.documentContext.getDocumentData(
        currentDocument, 
        extractedText, 
        currentPage, 
        totalPages
      ) : null,
  });
  
  // Provide instructions context for the agent
  useCopilotContext({
    instructions: AtenaPrompts.systemContext.getInstructions(
      currentDocument ? {
        name: currentDocument.name,
        currentPage,
        totalPages
      } : null
    ),
  });
  
  // Register contextual actions
  useCopilotActions();

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">Atena UI</h1>
              <p className="text-sm text-primary-100">Assistente Inteligente de Documentos</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden" style={{ height: 'calc(100vh - 80px)' }}>
        {/* Sidebar - Document List */}
        <aside className="w-64 flex-shrink-0 h-full">
          <DocumentList />
        </aside>

        {/* PDF Viewer */}
        <main className="flex-1 min-w-0 h-full overflow-hidden">
          <PDFViewer onOpenChat={() => setSidebarOpen(true)} />
        </main>

        {/* CopilotKit Sidebar - Only show when document is selected */}
        {currentDocument && (
          <CopilotSidebar
            defaultOpen={sidebarOpen}
            onSetOpen={setSidebarOpen}
            clickOutsideToClose={false}
            labels={{
              title: AtenaPrompts.chatSidebar.title,
              initial: AtenaPrompts.chatSidebar.initial,
            }}
            className="w-96 flex-shrink-0"
          />
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const [threadId, setThreadId] = useState<string | null>(null);
  
  // Initialize thread ID from localStorage or create new one
  useEffect(() => {
    const storedThreadId = localStorage.getItem('atena-thread-id');
    if (storedThreadId) {
      setThreadId(storedThreadId);
    } else {
      const newThreadId = generateUUID();
      localStorage.setItem('atena-thread-id', newThreadId);
      setThreadId(newThreadId);
    }
  }, []);
  
  // Don't render until threadId is ready
  if (!threadId) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <CopilotKit 
      runtimeUrl="/api/copilotkit"
    >
      <HomeContent />
    </CopilotKit>
  );
}