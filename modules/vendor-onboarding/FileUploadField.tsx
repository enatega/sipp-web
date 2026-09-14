"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { FileImage, UploadCloud, X } from "lucide-react";

export function FileUploadField({
  label,
  value,
  error,
  chooseLabel,
  replaceLabel,
  dropLabel,
  fileHint,
  removeLabel,
  previewAlt,
  onChange,
}: {
  label: string;
  value: File | null;
  error?: string;
  chooseLabel: string;
  replaceLabel: string;
  dropLabel: string;
  fileHint: string;
  removeLabel: string;
  previewAlt: string;
  onChange: (file: File | null) => void;
}) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  const selectFile = (file: File | null) => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    const nextPreviewUrl = file ? URL.createObjectURL(file) : null;
    previewUrlRef.current = nextPreviewUrl;
    setPreviewUrl(nextPreviewUrl);
    onChange(file);
    if (inputRef.current) inputRef.current.value = "";
  };

  const errorId = `${id}-error`;

  return (
    <div>
      <p className="mb-2 text-[13px] font-bold text-ink">{label}</p>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        onChange={(event) => selectFile(event.currentTarget.files?.[0] ?? null)}
      />

      {value && previewUrl ? (
        <div className={`group relative flex min-h-[148px] overflow-hidden rounded-[14px] bg-[var(--soft-surface)] ${error ? "ring-1 ring-danger" : ""}`}>
          <div className="relative w-32 flex-none sm:w-36">
            <Image src={previewUrl} alt={previewAlt} fill unoptimized className="object-cover" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col justify-center p-4">
            <span className="inline-flex size-9 items-center justify-center rounded-[10px] bg-danger-soft text-brand">
              <FileImage className="size-[18px]" />
            </span>
            <span className="mt-3 truncate text-sm font-bold text-ink">{value.name}</span>
            <span className="mt-1 text-xs text-muted">{(value.size / (1024 * 1024)).toFixed(1)} MB</span>
            <label htmlFor={id} className="mt-3 w-fit cursor-pointer text-xs font-bold text-brand underline decoration-brand/30 underline-offset-4 hover:decoration-brand">
              {replaceLabel}
            </label>
          </div>
          <button
            type="button"
            onClick={() => selectFile(null)}
            aria-label={removeLabel}
            className="absolute right-3 top-3 grid size-8 place-items-center rounded-full bg-surface text-muted shadow-card transition-colors hover:text-danger focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <label
          htmlFor={id}
          onDragEnter={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node)) setIsDragging(false);
          }}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            selectFile(event.dataTransfer.files?.[0] ?? null);
          }}
          className={`group flex min-h-[148px] cursor-pointer flex-col items-center justify-center rounded-[14px] border border-dashed px-4 py-5 text-center outline-none transition-[border-color,box-shadow,background-color] focus-within:shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-brand)_12%,transparent)] ${
            error
              ? "border-danger bg-danger-soft/40"
              : isDragging
                ? "border-brand bg-danger-soft"
                : "border-line bg-[var(--soft-surface)] hover:border-brand/60 hover:bg-danger-soft/40"
          }`}
        >
          <span className="grid size-11 place-items-center rounded-full bg-surface text-brand shadow-card transition-transform group-hover:-translate-y-0.5">
            <UploadCloud className="size-5" strokeWidth={1.8} />
          </span>
          <span className="mt-3 text-sm font-bold text-ink">{dropLabel}</span>
          <span className="mt-1 text-xs text-muted">
            <span className="font-bold text-brand underline decoration-brand/30 underline-offset-4">{chooseLabel}</span>
            {` · ${fileHint}`}
          </span>
        </label>
      )}
      {error ? <p id={errorId} className="mt-1.5 text-xs font-medium text-danger">{error}</p> : null}
    </div>
  );
}
