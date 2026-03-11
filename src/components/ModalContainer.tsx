import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalContainerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export default function ModalContainer({ isOpen, onClose, title, children }: ModalContainerProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center"
      style={{ maxWidth: '430px', margin: '0 auto', left: 0, right: 0 }}
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="
        relative z-10
        glass-strong
        rounded-t-4xl
        w-full
        slide-up
        shadow-glass
        max-h-[85vh]
        overflow-y-auto
        pb-8
      ">
        <div className="flex items-center justify-between p-5 pb-0">
          <div className="w-10 h-1 rounded-full bg-white/20 absolute top-3 left-1/2 -translate-x-1/2" />
          {title && (
            <h3 className="text-lg font-bold text-white mt-2">{title}</h3>
          )}
          <button
            onClick={onClose}
            className="ml-auto mt-2 p-2 rounded-xl glass text-white/50 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        <div className="px-5 pt-4">
          {children}
        </div>
      </div>
    </div>
  );
}
