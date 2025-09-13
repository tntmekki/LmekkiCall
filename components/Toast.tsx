import React from 'react';
import Avatar from './Avatar';
import { CloseIcon } from './icons/Icons';

interface ToastProps {
  contactName: string;
  message: string;
  avatar: string;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ contactName, message, avatar, onClose }) => {
  return (
    <div
      className="fixed top-5 left-5 z-[200] w-full max-w-sm bg-white dark:bg-slate-800 shadow-2xl rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden transform animate-slide-in-from-right"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start p-4">
        <div className="flex-shrink-0 pt-0.5">
          <Avatar src={avatar} alt={contactName} size="sm" />
        </div>
        <div className="flex-1 mr-3 min-w-0">
          <p className="text-sm font-bold text-slate-900 dark:text-slate-50">{contactName}</p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 truncate">{message}</p>
        </div>
        <div className="flex-shrink-0 flex">
          <button
            onClick={onClose}
            className="inline-flex text-slate-400 hover:text-slate-500 dark:hover:text-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            aria-label="Close notification"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
      <style>{`
        @keyframes slide-in-from-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in-from-right {
          animation: slide-in-from-right 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
        }
      `}</style>
    </div>
  );
};

export default Toast;
