"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Eye, ImageUp, LoaderCircle, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useUpdateProfileImageMutation } from "@/modules/account/queries/useAccountQueries";
import type { ProfileUser } from "@/modules/account/types";
import { userInitials } from "@/modules/account/utils/userInitials";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

interface Props {
  user: ProfileUser;
}

export function ProfilePhotoManager({ user }: Props) {
  const t = useTranslations("profileInformation");
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const avatarButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previewUrlRef = useRef<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [failedPhoto, setFailedPhoto] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const updateImage = useUpdateProfileImageMutation();
  const currentPhoto = user.image?.trim() || null;
  const displayedPhoto = previewUrl ?? currentPhoto;
  const visiblePhoto =
    displayedPhoto && failedPhoto !== displayedPhoto ? displayedPhoto : null;

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isViewerOpen) return;
    const previousOverflow = document.body.style.overflow;
    const trigger = avatarButtonRef.current;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsViewerOpen(false);
      if (event.key === "Tab") {
        event.preventDefault();
        closeButtonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      trigger?.focus();
    };
  }, [isViewerOpen]);

  function clearSelection() {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = null;
    setPreviewUrl(null);
    setSelectedFile(null);
    setError("");
  }

  function selectFile(file: File | null) {
    setSuccess("");
    if (!file) return;
    if (!ACCEPTED_TYPES.has(file.type) || file.size > MAX_FILE_SIZE) {
      setError(t("photoInvalid"));
      return;
    }
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    const nextUrl = URL.createObjectURL(file);
    previewUrlRef.current = nextUrl;
    setPreviewUrl(nextUrl);
    setSelectedFile(file);
    setError("");
  }

  async function uploadPhoto() {
    if (!selectedFile || updateImage.isPending) return;
    setError("");
    setSuccess("");
    try {
      await updateImage.mutateAsync(selectedFile);
      setFailedPhoto(null);
      clearSelection();
      setSuccess(t("photoUpdated"));
    } catch {
      setError(t("photoUploadError"));
    }
  }

  return (
    <>
      <section
        className={`rounded-xl bg-card px-4 py-5 text-center shadow-card transition-[box-shadow,background-color] sm:px-6 sm:py-7 ${
          isDragging ? "bg-danger-soft shadow-[0_10px_28px_rgba(183,24,47,0.14)]" : ""
        }`}
        onDragEnter={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node)) {
            setIsDragging(false);
          }
        }}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          selectFile(event.dataTransfer.files?.[0] ?? null);
        }}
      >
        <button
          ref={avatarButtonRef}
          type="button"
          disabled={!visiblePhoto}
          onClick={() => setIsViewerOpen(true)}
          className="group relative mx-auto grid size-24 place-items-center overflow-hidden rounded-full border-[4px] border-[#dceee8] bg-[var(--soft-surface)] text-2xl font-bold text-brand outline-none transition-transform enabled:hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-3 focus-visible:ring-offset-card disabled:cursor-default sm:size-32 sm:text-3xl dark:border-[#31534a]"
          aria-label={visiblePhoto ? t("viewPhoto") : undefined}
        >
          {visiblePhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={visiblePhoto}
              alt=""
              className="size-full object-cover"
              onError={() => setFailedPhoto(visiblePhoto)}
            />
          ) : (
            userInitials(user.name)
          )}
          {visiblePhoto ? (
            <span className="absolute inset-0 grid place-items-center bg-black/0 text-white opacity-0 transition-[background-color,opacity] group-hover:bg-black/35 group-hover:opacity-100 group-focus-visible:bg-black/35 group-focus-visible:opacity-100">
              <Eye className="size-5" aria-hidden="true" />
            </span>
          ) : null}
        </button>

        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(event) => {
            selectFile(event.currentTarget.files?.[0] ?? null);
            event.currentTarget.value = "";
          }}
        />

        {selectedFile ? (
          <div className="mt-5">
            <p className="truncate text-[11px] font-semibold text-foreground">
              {selectedFile.name}
            </p>
            <p className="mt-1 text-[10px] text-body">
              {t("photoReady", {
                size: (selectedFile.size / (1024 * 1024)).toFixed(1),
              })}
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <button
                type="button"
                onClick={clearSelection}
                disabled={updateImage.isPending}
                className="min-h-10 rounded-full px-4 text-[11px] font-semibold text-body transition-colors hover:bg-[var(--soft-surface)] hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-50"
              >
                {t("cancelPhoto")}
              </button>
              <button
                type="button"
                onClick={() => void uploadPhoto()}
                disabled={updateImage.isPending}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-brand px-5 text-[11px] font-semibold text-white transition-colors hover:bg-brand-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-wait disabled:opacity-60"
              >
                {updateImage.isPending ? (
                  <LoaderCircle className="size-3.5 animate-spin" aria-hidden="true" />
                ) : null}
                {updateImage.isPending ? t("uploadingPhoto") : t("savePhoto")}
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            aria-describedby={`${inputId}-requirements`}
            className="mx-auto mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-brand px-5 text-[11px] font-semibold text-white transition-colors hover:bg-brand-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <ImageUp className="size-4" aria-hidden="true" />
            {currentPhoto ? t("changePhoto") : t("addPhoto")}
          </button>
        )}

        <p
          id={`${inputId}-requirements`}
          className="mx-auto mt-3 max-w-[25ch] text-[10px] leading-relaxed text-body"
        >
          {isDragging ? t("dropPhotoNow") : t("photoRequirements")}
        </p>
        {error ? (
          <p role="alert" className="mx-auto mt-3 max-w-[26ch] text-[10px] font-semibold leading-relaxed text-danger">
            {error}
          </p>
        ) : null}
        {success ? (
          <p role="status" className="mx-auto mt-3 max-w-[26ch] text-[10px] font-semibold leading-relaxed text-success">
            {success}
          </p>
        ) : null}
      </section>

      {isViewerOpen && visiblePhoto ? (
        <div
          className="fixed inset-0 z-[100] grid place-items-center bg-black/90 p-4 opacity-100 backdrop-blur-sm transition-opacity duration-200 starting:opacity-0 motion-reduce:transition-none"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${inputId}-viewer-title`}
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setIsViewerOpen(false);
          }}
        >
          <h2 id={`${inputId}-viewer-title`} className="sr-only">
            {t("photoViewerTitle")}
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={() => setIsViewerOpen(false)}
            className="absolute right-4 top-4 grid size-11 place-items-center rounded-full bg-white/12 text-white transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:right-7 sm:top-7"
            aria-label={t("closePhoto")}
          >
            <X className="size-5" aria-hidden="true" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={visiblePhoto}
            alt={t("profilePhotoAlt", { name: user.name })}
            className="max-h-[86svh] max-w-[min(92vw,900px)] rounded-xl object-contain shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
          />
        </div>
      ) : null}
    </>
  );
}
