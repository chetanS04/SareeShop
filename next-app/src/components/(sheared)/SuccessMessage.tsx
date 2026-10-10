import { CheckCircle2, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface SuccessMessageProps {
  message: string;
  onClose: () => void;
}

const SuccessMessage: React.FC<SuccessMessageProps> = ({ message, onClose }) => {
  const latestOnClose = useRef(onClose);

  useEffect(() => {
    latestOnClose.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const duration = Math.min(15000, Math.max(3000, message.length * 80));
    const timer = setTimeout(() => {
      latestOnClose.current();
    }, duration);
    return () => clearTimeout(timer);
  }, [message]);

  return (
    <motion.div
      role="status"
      aria-live="polite"
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25 }}
      className="fixed top-[calc(var(--safe-top,0px)+1rem)] right-4 sm:top-6 sm:right-6 z-[10000] max-w-sm w-[calc(100vw-2rem)] sm:w-96 bg-surface border border-border-line border-l-2 border-l-accent-ochre p-4 sm:p-5 flex gap-3.5 pointer-events-auto select-none"
    >
      <div
        className="w-10 h-10 bg-surface-ivory border border-border-line flex items-center justify-center shrink-0"
        aria-hidden="true"
      >
        <CheckCircle2 className="w-5 h-5 text-accent-ochre" strokeWidth={1.5} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <span className="label-caps text-accent-ochre">Success</span>
          <button
            type="button"
            onClick={onClose}
            className="text-body-slate hover:text-primary p-1 -mr-1 -mt-1 transition-colors"
            aria-label="Dismiss success message"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[13px] text-on-surface leading-relaxed">{message}</p>
      </div>
    </motion.div>
  );
};

export default SuccessMessage;
