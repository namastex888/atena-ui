'use client';

import { useEffect } from 'react';
import { FileText } from 'lucide-react';
import { useDocumentStore } from '@/stores/document.store';
import { Document } from '@/types/document';
import { cn } from '@/lib/utils/cn';
import { ScrollArea } from '@/components/ui/scroll-area';

const availableDocuments: Document[] = [
  { id: '1', name: 'I - Teórico', path: '/documents/I_Teorico.pdf' },
  { id: '2', name: 'II - Teórico', path: '/documents/II_Teorico.pdf' },
  { id: '3', name: 'III - Teórico', path: '/documents/III_Teorico.pdf' },
  { id: '4', name: 'IV - Teórico', path: '/documents/IV_Teorico.pdf' },
];

interface DocumentListProps {
  onDocumentSelect?: () => void;
}

export function DocumentList({ onDocumentSelect }: DocumentListProps = {}) {
  const { currentDocument, setCurrentDocument, setDocuments } = useDocumentStore();

  useEffect(() => {
    setDocuments(availableDocuments);
  }, [setDocuments]);

  return (
    <div className="h-full flex flex-col bg-gray-50 border-r border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-semibold text-primary">Documentos</h2>
      </div>
      
      <ScrollArea className="flex-1 px-3 py-2">
        <div className="space-y-1">
          {availableDocuments.map((doc) => (
            <button
              key={doc.id}
              onClick={() => {
                setCurrentDocument(doc);
                onDocumentSelect?.();
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                "hover:bg-primary-50 hover:text-primary-700",
                currentDocument?.id === doc.id
                  ? "bg-primary text-white hover:bg-primary-dark hover:text-white"
                  : "text-gray-700"
              )}
            >
              <FileText className="w-4 h-4 flex-shrink-0" />
              <span className="truncate text-left">{doc.name}</span>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}