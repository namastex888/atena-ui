'use client';

import React, { useEffect, useState } from 'react';
import { DocumentList } from '@/components/sidebar/DocumentList';
import { PDFViewer } from '@/components/pdf-viewer/PDFViewerAllPages';
import { CopilotKit } from '@copilotkit/react-core';
import { CopilotPopup, CopilotChat } from '@copilotkit/react-ui';
import { useCopilotReadable } from '@copilotkit/react-core';
import { BookOpen, Menu, Minimize2, X } from 'lucide-react';
import { CustomPopupHeader } from '@/components/chat/CustomPopupHeader';
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

// Separate component for CopilotKit context that remounts on document change
function CopilotKitProvider({ documentId, children }: { documentId: string | null, children: React.ReactNode }) {
  // Share current document context with the Agno agent
  const { currentDocument, extractedText, currentPage, totalPages } = useDocumentStore();
  
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
  useCopilotReadable({
    description: "System instructions for the assistant",
    value: AtenaPrompts.systemContext.getInstructions(
      currentDocument ? {
        name: currentDocument.name,
        currentPage,
        totalPages
      } : null
    ),
  });
  
  // Register contextual actions
  useCopilotActions();
  
  return <>{children}</>;
}

function HomeContent() {
  const { currentDocument, currentPage, totalPages } = useDocumentStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(
    typeof window !== 'undefined' && window.innerWidth < 1024
  );

  // Handle ESC key to close popup or exit fullscreen
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isMaximized) {
          setIsMaximized(false);
          setSidebarOpen(true);
        } else if (sidebarOpen) {
          setSidebarOpen(false);
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [sidebarOpen, isMaximized]);

  // Custom header component for the popup
  const PopupHeader = React.useCallback(() => {
    return (
      <CustomPopupHeader
        title={AtenaPrompts.chatSidebar.title}
        onClose={() => setSidebarOpen(false)}
        onMaximize={() => {
          setIsMaximized(true);
          setSidebarOpen(false);
        }}
      />
    );
  }, []);

  return (
    <CopilotKitProvider key={currentDocument?.id || 'no-doc'} documentId={currentDocument?.id || null}>
      <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-primary-dark text-white px-4 sm:px-6 py-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Hamburger Menu Button */}
            <button
              onClick={() => setLeftSidebarCollapsed(!leftSidebarCollapsed)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Toggle sidebar"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <BookOpen className="w-8 h-8" />
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Atena AI</h1>
              <p className="text-xs sm:text-sm text-primary-100 hidden sm:block">Seu tutor inteligente para dominar qualquer conteúdo</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative" style={{ height: 'calc(100vh - 80px)' }}>
        {/* Sidebar - Document List */}
        <aside className={`
          ${leftSidebarCollapsed ? 'w-0' : 'w-64'} 
          absolute lg:relative
          z-20 lg:z-auto
          bg-white
          h-full
          transition-all duration-300 ease-in-out
          flex-shrink-0
          overflow-hidden
          ${!leftSidebarCollapsed ? 'shadow-lg lg:shadow-none' : ''}
        `}>
          <DocumentList onDocumentSelect={() => {
            // Close sidebar on mobile when a document is selected
            if (window.innerWidth < 1024) {
              setLeftSidebarCollapsed(true);
            }
          }} />
        </aside>
        
        {/* Overlay for mobile when sidebar is open */}
        {!leftSidebarCollapsed && (
          <div 
            className="lg:hidden absolute inset-0 bg-black/50 z-10"
            onClick={() => setLeftSidebarCollapsed(true)}
          />
        )}

        {/* PDF Viewer */}
        <main className="flex-1 min-w-0 h-full overflow-hidden">
          <PDFViewer onOpenChat={() => setSidebarOpen(true)} />
        </main>

        {/* CopilotKit Chat Interface - Show popup or full chat based on maximized state */}
        {currentDocument && !isMaximized && (
          <>
            <CopilotPopup
              defaultOpen={sidebarOpen}
              onSetOpen={setSidebarOpen}
              clickOutsideToClose={true}
              hitEscapeToClose={true}
              instructions={AtenaPrompts.systemContext.getInstructions(
                currentDocument ? {
                  name: currentDocument.name,
                  currentPage,
                  totalPages
                } : null
              )}
              labels={{
                title: AtenaPrompts.chatSidebar.title,
                initial: AtenaPrompts.chatSidebar.initial,
                placeholder: "Digite sua pergunta...",
              }}
              Header={PopupHeader}
            />
          </>
        )}
        
        {/* Full screen CopilotChat when maximized */}
        {currentDocument && isMaximized && (
          <div className="fixed inset-0 z-50 bg-white flex flex-col">
            <div className="bg-gradient-to-r from-primary to-primary-dark text-white px-4 py-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">{AtenaPrompts.chatSidebar.title}</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsMaximized(false);
                    setSidebarOpen(true);
                  }}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="Minimizar"
                >
                  <Minimize2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    setIsMaximized(false);
                    setSidebarOpen(false);
                  }}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="Fechar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <CopilotChat
                instructions={AtenaPrompts.systemContext.getInstructions(
                  currentDocument ? {
                    name: currentDocument.name,
                    currentPage,
                    totalPages
                  } : null
                )}
                labels={{
                  title: AtenaPrompts.chatSidebar.title,
                  initial: AtenaPrompts.chatSidebar.initial,
                  placeholder: "Digite sua pergunta...",
                }}
                className="h-full"
              />
            </div>
          </div>
        )}
      </div>
    </div>
    </CopilotKitProvider>
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
      showDevConsole={false}
    >
      <HomeContent />
    </CopilotKit>
  );
}