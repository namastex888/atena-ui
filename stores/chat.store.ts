import { create } from 'zustand';
import { Message, ChatSession } from '@/types/chat';

interface ChatState {
  sessions: Map<string, ChatSession>;
  currentSessionId: string | null;
  isTyping: boolean;
  addMessage: (documentId: string, message: Omit<Message, 'id' | 'timestamp'>) => void;
  setTyping: (isTyping: boolean) => void;
  clearSession: (documentId: string) => void;
  getCurrentSession: () => ChatSession | null;
}

export const useChatStore = create<ChatState>((set, get) => ({
  sessions: new Map(),
  currentSessionId: null,
  isTyping: false,
  
  addMessage: (documentId, message) => {
    const sessions = new Map(get().sessions);
    let session = sessions.get(documentId);
    
    if (!session) {
      session = {
        id: documentId,
        documentId,
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
    
    const newMessage: Message = {
      ...message,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };
    
    session.messages.push(newMessage);
    session.updatedAt = new Date();
    sessions.set(documentId, session);
    
    set({ sessions, currentSessionId: documentId });
  },
  
  setTyping: (isTyping) => set({ isTyping }),
  
  clearSession: (documentId) => {
    const sessions = new Map(get().sessions);
    sessions.delete(documentId);
    set({ sessions });
  },
  
  getCurrentSession: () => {
    const { sessions, currentSessionId } = get();
    if (!currentSessionId) return null;
    return sessions.get(currentSessionId) || null;
  },
}));