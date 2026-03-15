import { ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalContainerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export default function ModalContainer({
  isOpen,
  onClose,
  title,
  children,
}: ModalContainerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setMounted(true);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9998] flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/65 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className="relative z-10 rounded-t-4xl w-full max-w-[430px] lg:max-w-[760px] overflow-hidden"
        style={{
          background: '#0d1224',
          border: '1px solid rgba(255,255,255,0.1)',
          borderBottom: 'none',
          maxHeight: 'calc(100dvh - 12px)',
          boxShadow: '0 -10px 40px rgba(0,0,0,0.45)',
        }}
      >
        <div className="flex items-center justify-between p-5 pb-0 relative">
          <div className="w-10 h-1 rounded-full bg-white/20 absolute top-3 left-1/2 -translate-x-1/2" />

          {title && <h3 className="text-lg font-bold text-white mt-2">{title}</h3>}

          <button
            onClick={onClose}
            className="ml-auto mt-2 p-2 rounded-xl text-white/50 hover:text-white transition-colors"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div
          className="px-5 pt-4 overflow-y-auto"
          style={{
            maxHeight: 'calc(100dvh - 90px)',
            paddingBottom: 'calc(28px + env(safe-area-inset-bottom))',
          }}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
