import React from 'react';
import { Maximize2, X } from 'lucide-react';
import { AtenaPrompts } from '@/lib/prompts/atena-prompts';

interface CustomPopupHeaderProps {
  title?: string;
  onClose?: () => void;
  onMaximize?: () => void;
}

export const CustomPopupHeader: React.FC<CustomPopupHeaderProps> = ({ 
  title = AtenaPrompts.ui.chatHeader.title, 
  onClose,
  onMaximize 
}) => {
  return (
    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary to-primary-dark text-white">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="flex items-center gap-2">
        {onMaximize && (
          <button
            onClick={onMaximize}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Maximize"
            title={AtenaPrompts.ui.chatHeader.maximize}
          >
            <Maximize2 className="w-5 h-5" />
          </button>
        )}
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Close"
            title={AtenaPrompts.ui.chatHeader.close}
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};