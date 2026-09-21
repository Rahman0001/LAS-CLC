import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  addToast: (typeOrMessage: 'success' | 'error' | 'info' | string, messageOrType?: string | 'success' | 'error' | 'info') => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const addToast = useCallback((typeOrMessage: 'success' | 'error' | 'info' | string, messageOrType?: string | 'success' | 'error' | 'info') => {
    let type: 'success' | 'error' | 'info' = 'info';
    let message = '';
    if (typeOrMessage === 'success' || typeOrMessage === 'error' || typeOrMessage === 'info') {
      type = typeOrMessage;
      message = typeof messageOrType === 'string' ? messageOrType : '';
    } else {
      message = typeOrMessage;
      if (messageOrType === 'success' || messageOrType === 'error' || messageOrType === 'info') {
        type = messageOrType;
      }
    }
    showToast(message, type);
  }, [showToast]);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast, addToast }}>
      {children}
      <div
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4"
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-lg shadow-lg border text-sm transition-all duration-200 transform translate-y-0 ${
              toast.type === 'success'
                ? 'bg-[#0f241a] text-[#a7f3d0] border-[#10b981]/40'
                : toast.type === 'error'
                ? 'bg-[#2b1115] text-[#fecdd3] border-[#f43f5e]/40'
                : 'bg-[#0c1829] text-[#e2ded5] border-[#c59b43]/40'
            }`}
            role="alert"
          >
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-[#c59b43] shrink-0 mt-0.5" />}

            <div className="flex-1 font-medium leading-relaxed">{toast.message}</div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-white p-1 rounded transition-colors"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
