"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  XMarkIcon,
} from "@heroicons/react/20/solid";

type ToastType = "success" | "error";

interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastApi {
  success: (message: string) => void;
  error: (message: string) => void;
}

interface ToastProviderProps {
  children: ReactNode;
}

const MAX_TOASTS = 3;

const durations: Record<ToastType, number> = {
  success: 4000,
  error: 6000,
};

const iconClass: Record<ToastType, string> = {
  success: "w-5 h-5 mt-0.5 shrink-0 text-accent",
  error: "w-5 h-5 mt-0.5 shrink-0 text-red-600",
};

const toastIcons = {
  success: CheckCircleIcon,
  error: ExclamationCircleIcon,
} satisfies Record<ToastType, unknown>;

const noopToast: ToastApi = {
  success: () => {},
  error: () => {},
};

const ToastContext = createContext<ToastApi | null>(null);

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));

    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const show = useCallback(
    (type: ToastType, message: string) => {
      nextId.current += 1;
      const id = nextId.current;

      setToasts((current) =>
        [...current, { id, type, message }].slice(-MAX_TOASTS),
      );
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), durations[type]),
      );
    },
    [dismiss],
  );

  useEffect(() => {
    const activeTimers = timers.current;

    return () => {
      activeTimers.forEach((timer) => clearTimeout(timer));
      activeTimers.clear();
    };
  }, []);

  const api = useMemo<ToastApi>(
    () => ({
      success: (message) => show("success", message),
      error: (message) => show("error", message),
    }),
    [show],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}

      <div
        aria-live="polite"
        className="w-full sm:w-96 px-4 sm:px-0 flex flex-col gap-2 fixed bottom-4 right-0 sm:right-4 z-50 pointer-events-none"
      >
        {toasts.map((toast) => {
          const Icon = toastIcons[toast.type];

          return (
            <div
              key={toast.id}
              className="w-full p-4 flex items-start gap-3 text-sm leading-6 text-foreground bg-surface shadow-lg border border-border rounded-lg pointer-events-auto transition-[opacity,translate] duration-200 starting:opacity-0 starting:translate-y-2 motion-reduce:transition-none"
            >
              <Icon aria-hidden="true" className={iconClass[toast.type]} />

              <p className="min-w-0 flex-1">{toast.message}</p>

              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                aria-label="Dismiss notification"
                className="w-6 h-6 flex shrink-0 items-center justify-center text-muted rounded-lg transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <XMarkIcon aria-hidden="true" className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

/** Returns a do nothing version outside the admin, so a stray use never crashes a page */
export function useToast(): ToastApi {
  return useContext(ToastContext) ?? noopToast;
}
