'use client';

import { useEffect, useState, useRef } from 'react';
import { BookOpen, Lightbulb, HelpCircle } from 'lucide-react';
import { useCopilotChat } from '@copilotkit/react-core';
import { TextMessage, MessageRole } from '@copilotkit/runtime-client-gql';
import { AtenaPrompts } from '@/lib/prompts/atena-prompts';

interface SelectionMenuProps {
  selectedText: string;
  x: number;
  y: number;
  onClose: () => void;
  onOpenChat?: () => void;
}

export function SelectionMenu({ selectedText, x, y, onClose, onOpenChat }: SelectionMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const { appendMessage } = useCopilotChat();

  const handleExplicar = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Explicar clicked for:', selectedText);
    
    // First open the chat if we have the callback
    if (onOpenChat) {
      onOpenChat();
    }
    
    // Then append the message using centralized prompt
    setTimeout(() => {
      appendMessage(
        new TextMessage({
          content: AtenaPrompts.selectionMenu.explain(selectedText),
          role: MessageRole.User,
        })
      );
    }, 200);
    
    onClose();
  };

  const handleExemplos = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Exemplos clicked for:', selectedText);
    
    // First open the chat if we have the callback
    if (onOpenChat) {
      onOpenChat();
    }
    
    // Then append the message using centralized prompt
    setTimeout(() => {
      appendMessage(
        new TextMessage({
          content: AtenaPrompts.selectionMenu.examples(selectedText),
          role: MessageRole.User,
        })
      );
    }, 200);
    
    onClose();
  };

  const handleTestar = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Quiz clicked for:', selectedText);
    
    // First open the chat if we have the callback
    if (onOpenChat) {
      onOpenChat();
    }
    
    // Then append the message using centralized prompt
    setTimeout(() => {
      appendMessage(
        new TextMessage({
          content: AtenaPrompts.selectionMenu.quiz(selectedText),
          role: MessageRole.User,
        })
      );
    }, 200);
    
    onClose();
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    // Use 'mousedown' instead of 'click' to prevent conflicts
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Adjust position to keep menu in viewport
  const [adjustedPosition, setAdjustedPosition] = useState({ x, y });

  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let newX = x;
      let newY = y;

      // Adjust X if menu goes off right edge
      if (x + rect.width > viewportWidth - 10) {
        newX = viewportWidth - rect.width - 10;
      }

      // Adjust Y if menu goes off bottom edge
      if (y + rect.height > viewportHeight - 10) {
        newY = y - rect.height - 10;
      }

      setAdjustedPosition({ x: newX, y: newY });
    }
  }, [x, y]);

  return (
    <div
      ref={menuRef}
      data-selection-menu="true"
      className="fixed bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-[200px]"
      style={{
        left: `${adjustedPosition.x}px`,
        top: `${adjustedPosition.y}px`,
        zIndex: 9999,
        pointerEvents: 'auto',
      }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="py-1">
        <button
          type="button"
          onClick={handleExplicar}
          onMouseDown={(e) => e.stopPropagation()}
          className="w-full flex items-center gap-3 px-3 py-2 hover:bg-blue-50 transition-colors group cursor-pointer"
        >
          <BookOpen className="w-4 h-4 text-blue-600 group-hover:text-blue-700 pointer-events-none" />
          <div className="text-left pointer-events-none">
            <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
              {AtenaPrompts.ui.selectionMenu.explicar.label}
            </p>
            <p className="text-xs text-gray-500">{AtenaPrompts.ui.selectionMenu.explicar.description}</p>
          </div>
        </button>

        <button
          type="button"
          onClick={handleExemplos}
          onMouseDown={(e) => e.stopPropagation()}
          className="w-full flex items-center gap-3 px-3 py-2 hover:bg-blue-50 transition-colors group cursor-pointer"
        >
          <Lightbulb className="w-4 h-4 text-yellow-600 group-hover:text-yellow-700 pointer-events-none" />
          <div className="text-left pointer-events-none">
            <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
              {AtenaPrompts.ui.selectionMenu.exemplos.label}
            </p>
            <p className="text-xs text-gray-500">{AtenaPrompts.ui.selectionMenu.exemplos.description}</p>
          </div>
        </button>

        <button
          type="button"
          onClick={handleTestar}
          onMouseDown={(e) => e.stopPropagation()}
          className="w-full flex items-center gap-3 px-3 py-2 hover:bg-blue-50 transition-colors group cursor-pointer"
        >
          <HelpCircle className="w-4 h-4 text-green-600 group-hover:text-green-700 pointer-events-none" />
          <div className="text-left pointer-events-none">
            <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
              {AtenaPrompts.ui.selectionMenu.quiz.label}
            </p>
            <p className="text-xs text-gray-500">{AtenaPrompts.ui.selectionMenu.quiz.description}</p>
          </div>
        </button>
      </div>
    </div>
  );
}