import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }
    
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      />
      
      {/* Dialog Frame */}
      <div className="w-full max-w-lg relative z-10 animate-in fade-in zoom-in-95 duration-200">
        <Card
          header={
            <div className="flex items-center justify-between w-full">
              <span className="font-mono text-xs">{title}</span>
              <Button 
                variant="ghost" 
                onClick={onClose} 
                className="!p-1 border-0 hover:bg-slate-800/40 text-slate-400 hover:text-cyber-blue"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          }
          glow
          scanline
        >
          <div className="max-h-[70vh] overflow-y-auto pr-1 text-sm text-slate-300">
            {children}
          </div>
        </Card>
      </div>
    </div>
  );
};
