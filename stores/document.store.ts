import { create } from 'zustand';
import { Document } from '@/types/document';

interface DocumentState {
  documents: Document[];
  currentDocument: Document | null;
  currentPage: number;
  totalPages: number;
  zoom: number;
  setDocuments: (documents: Document[]) => void;
  setCurrentDocument: (document: Document | null) => void;
  setCurrentPage: (page: number) => void;
  setTotalPages: (total: number) => void;
  setZoom: (zoom: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
  documents: [],
  currentDocument: null,
  currentPage: 1,
  totalPages: 0,
  zoom: 1,
  setDocuments: (documents) => set({ documents }),
  setCurrentDocument: (document) => set({ currentDocument: document, currentPage: 1 }),
  setCurrentPage: (page) => set({ currentPage: page }),
  setTotalPages: (total) => set({ totalPages: total }),
  setZoom: (zoom) => set({ zoom: Math.max(0.5, Math.min(2, zoom)) }),
  nextPage: () => {
    const { currentPage, totalPages } = get();
    if (currentPage < totalPages) {
      set({ currentPage: currentPage + 1 });
    }
  },
  prevPage: () => {
    const { currentPage } = get();
    if (currentPage > 1) {
      set({ currentPage: currentPage - 1 });
    }
  },
  zoomIn: () => {
    const { zoom } = get();
    set({ zoom: Math.min(2, zoom + 0.1) });
  },
  zoomOut: () => {
    const { zoom } = get();
    set({ zoom: Math.max(0.5, zoom - 0.1) });
  },
}));