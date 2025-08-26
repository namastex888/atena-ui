'use client';

import { useState } from 'react';
import { RotateCcw, Trash2, Hash } from 'lucide-react';
import { useCopilotContext } from '@copilotkit/react-core';

interface ThreadManagerProps {
  onThreadChange?: () => void;
}

// Generate UUID for thread management
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function ThreadManager({ onThreadChange }: ThreadManagerProps) {
  const { threadId, setThreadId } = useCopilotContext();
  const [showConfirm, setShowConfirm] = useState(false);
  
  const handleNewSession = () => {
    if (showConfirm) {
      const newThreadId = generateUUID();
      localStorage.setItem('atena-thread-id', newThreadId);
      setThreadId(newThreadId);
      setShowConfirm(false);
      
      // Reload to reset the chat
      window.location.reload();
    } else {
      setShowConfirm(true);
      setTimeout(() => setShowConfirm(false), 3000);
    }
  };
  
  const handleCopyThreadId = () => {
    if (threadId) {
      navigator.clipboard.writeText(threadId);
    }
  };
  
  return (
    <div className="p-4 border-t border-gray-200 bg-gray-50">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-700">Sessão de Estudo</h3>
        <button
          onClick={handleNewSession}
          className={`
            px-3 py-1 rounded-lg text-xs font-medium transition-all
            ${showConfirm 
              ? 'bg-red-600 hover:bg-red-700 text-white' 
              : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-300'
            }
          `}
          title={showConfirm ? 'Clique novamente para confirmar' : 'Nova sessão'}
        >
          {showConfirm ? (
            <>
              <Trash2 className="w-3 h-3 inline mr-1" />
              Confirmar
            </>
          ) : (
            <>
              <RotateCcw className="w-3 h-3 inline mr-1" />
              Nova Sessão
            </>
          )}
        </button>
      </div>
      
      {threadId && (
        <div className="flex items-center gap-2">
          <div 
            className="flex-1 px-2 py-1 bg-white rounded border border-gray-200 cursor-pointer hover:bg-gray-50"
            onClick={handleCopyThreadId}
            title="Clique para copiar ID da sessão"
          >
            <div className="flex items-center gap-1">
              <Hash className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-500 font-mono truncate">
                {threadId.substring(0, 8)}...
              </span>
            </div>
          </div>
          <span className="text-xs text-gray-400">
            ID da sessão
          </span>
        </div>
      )}
      
      <p className="text-xs text-gray-500 mt-2">
        Sua conversa está sendo salva automaticamente
      </p>
    </div>
  );
}