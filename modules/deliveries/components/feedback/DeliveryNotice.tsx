import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  dismissLabel: string;
  message: string;
  onDismiss: () => void;
  title?: string;
  tone: "error" | "success";
}

const toneClasses = {
  error: "bg-danger-soft text-danger",
  success: "bg-success-soft text-success",
};

export function DeliveryNotice({
  className,
  dismissLabel,
  message,
  onDismiss,
  title,
  tone,
}: Props) {
  const Icon = tone === "error" ? AlertCircle : CheckCircle2;

  return (
    <div
      className={cn(
        "flex items-start gap-2.5 rounded-xl px-3 py-2.5 text-sm leading-5",
        toneClasses[tone],
        className,
      )}
      role={tone === "error" ? "alert" : "status"}
    >
      <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <div className="min-w-0 flex-1">
        {title ? <p className="font-bold">{title}</p> : null}
        <p className={cn("text-pretty", title ? "mt-0.5" : "font-semibold")}>{message}</p>
      </div>
      <button
        aria-label={dismissLabel}
        className="grid size-7 shrink-0 place-items-center rounded-md transition-colors hover:bg-current/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
        onClick={onDismiss}
        type="button"
      >
        <X aria-hidden="true" className="size-3.5" />
      </button>
    </div>
  );
}
