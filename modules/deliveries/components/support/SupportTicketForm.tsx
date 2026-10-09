"use client";
import { useState } from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { ArrowLeft, LoaderCircle, Paperclip, X } from "lucide-react";
import { supportApi } from "../../api/support";
import { ordersApi } from "../../api/orders";
import { deliveryQueryKeys as keys } from "../../queries/queryKeys";
import type { TicketInput } from "../../types/support";

interface Props { email: string; initialCategory?: string; initialReason?: string; initialOrderId?: string; onCancel: () => void; onSubmit: (values: TicketInput) => Promise<void> }
const inputClass = "mt-1.5 w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-base text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/15 disabled:opacity-60";

export function SupportTicketForm({ email, initialCategory = "", initialReason = "", initialOrderId = "", onCancel, onSubmit }: Props) {
  const t = useTranslations("deliveries.support");
  const config = useQuery({ queryKey: keys.supportOptions(), queryFn: ({ signal }) => supportApi.options(signal), staleTime: 300000 });
  const [hasError, setHasError] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const orders = useQuery({
    queryKey: ["support-order-options"],
    queryFn: async ({ signal }) => {
      const [results, initialOrder] = await Promise.all([
        Promise.all((["active", "past", "scheduled"] as const).map((tab) => ordersApi.list(tab, 0, signal))),
        initialOrderId ? ordersApi.detail(initialOrderId, signal).catch(() => null) : Promise.resolve(null),
      ]);
      const items = results.flatMap((result) => result.items);
      if (initialOrder) items.unshift({
        orderId: initialOrder.orderId,
        orderCode: initialOrder.orderCode ?? undefined,
        status: initialOrder.status,
        orderedAt: initialOrder.orderedAt,
        store: initialOrder.store,
      });
      return [...new Map(items.map((order) => [order.orderId, order])).values()];
    },
    staleTime: 60000,
  });
  const form = useFormik<TicketInput>({
    initialValues: { category: initialCategory, reason: initialReason, orderId: initialOrderId || null, email, description: "", fullName: "", countryRegion: "", mobileNumber: "", businessName: "", businessType: "", teamSize: "", priority: "low", attachmentUrls: [] },
    validate(values) {
      const errors: Record<string, string> = {};
      const required = ["category", "email", ...(config.data?.requiredByCategory[values.category] ?? ["reason", "description"])];
      for (const field of required) if (!String(values[field as keyof TicketInput] ?? "").trim()) errors[field] = t("required");
      if (values.email && !yup.string().email().isValidSync(values.email)) errors.email = t("invalidEmail");
      if (values.description.length > 10000) errors.description = t("tooLong");
      if (values.category === "customer_support" && values.reason === "order_related_issue" && !values.orderId) errors.orderId = t("required");
      return errors;
    },
    async onSubmit(values) {
      setHasError(false);
      try { await onSubmit({ ...values, reason: values.reason || "other" }); }
      catch { setHasError(true); }
    },
  });
  const required = config.data?.requiredByCategory[form.values.category] ?? [];
  const reasons = config.data?.categories.find((category) => category.key === form.values.category)?.reasons ?? [];
  const label = (key: string) => t.has(`options.${key}`) ? t(`options.${key}`) : key.replaceAll("_", " ");
  const error = (key: keyof TicketInput) => (form.touched[key] || form.submitCount > 0) && form.errors[key] ? <span className="mt-1 block text-sm text-danger" id={`error-${key}`}>{String(form.errors[key])}</span> : null;
  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setHasError(false); setIsUploading(true);
    try {
      const available = Math.max(0, 5 - form.values.attachmentUrls.length);
      const urls = await Promise.all(Array.from(files).slice(0, available).map(supportApi.upload));
      await form.setFieldValue("attachmentUrls", [...form.values.attachmentUrls, ...urls]);
    } catch { setHasError(true); } finally { setIsUploading(false); }
  };

  return <div className="mx-auto w-full max-w-2xl p-5 sm:p-8">
    <button type="button" onClick={onCancel} disabled={form.isSubmitting} className="mb-5 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-body"><ArrowLeft className="size-4" />{t("back")}</button>
    <h2 className="text-2xl font-bold text-ink">{t("newTicket")}</h2>
    <p className="mt-2 text-sm text-muted">{t("formHint")}</p>
    {config.isPending ? <p role="status" className="flex items-center gap-2 py-10 text-body"><LoaderCircle className="size-5 animate-spin" />{t("loading")}</p> : config.isError ? <button onClick={() => void config.refetch()} className="my-8 text-danger" type="button">{t("loadError")} {t("retry")}</button> :
    <form className="mt-6 space-y-5" onSubmit={form.handleSubmit} noValidate>
      {hasError ? <p className="sticky top-0 z-10 rounded-xl bg-danger-soft p-4 text-sm text-danger" role="alert">{t("sendError")}</p> : null}
      <fieldset disabled={form.isSubmitting} className="space-y-5 disabled:opacity-70">
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-semibold text-body">{t("category")}<select className={inputClass} name="category" value={form.values.category} onBlur={form.handleBlur} onChange={(event) => { void form.setFieldValue("category", event.target.value); void form.setFieldValue("reason", ""); void form.setFieldValue("orderId", null); }} aria-describedby="error-category"><option value="">{t("choose")}</option>{config.data?.categories.map((category) => <option key={category.key} value={category.key}>{label(category.key)}</option>)}</select>{error("category")}</label>
          <label className="text-sm font-semibold text-body">{t("reason")}<select className={inputClass} name="reason" value={form.values.reason} onChange={(event) => { form.handleChange(event); if (event.target.value !== "order_related_issue") void form.setFieldValue("orderId", null); }} onBlur={form.handleBlur} disabled={!form.values.category} aria-describedby="error-reason"><option value="">{t("choose")}</option>{reasons.map((reason) => <option key={reason} value={reason}>{label(reason)}</option>)}</select>{error("reason")}</label>
        </div>
        {form.values.category === "customer_support" && form.values.reason === "order_related_issue" ? <label className="block text-sm font-semibold text-body">{t("selectOrder")}<select className={inputClass} name="orderId" value={form.values.orderId ?? ""} onChange={form.handleChange} onBlur={form.handleBlur} disabled={orders.isPending}><option value="">{orders.isPending ? t("loadingOrders") : t("choose")}</option>{orders.data?.map((order) => <option key={order.orderId} value={order.orderId}>{order.orderCode ? `#${order.orderCode}` : `#${order.orderId.slice(0, 8).toUpperCase()}`} · {order.store?.name ?? order.storeName ?? "SIPP"}</option>)}</select>{error("orderId")}</label> : null}
        <label className="block text-sm font-semibold text-body">{t("email")}<input type="email" name="email" value={form.values.email} onChange={form.handleChange} onBlur={form.handleBlur} className={inputClass} maxLength={255} aria-describedby="error-email" />{error("email")}</label>
        <div className="grid gap-5 sm:grid-cols-2">{(["fullName", "countryRegion", "mobileNumber", "businessName", "businessType", "teamSize"] as const).filter((key) => required.includes(key)).map((key) => <label key={key} className="text-sm font-semibold text-body">{t(key)}{key === "businessType" || key === "teamSize" ? <select name={key} value={form.values[key]} onChange={form.handleChange} onBlur={form.handleBlur} className={inputClass}><option value="">{t("choose")}</option>{(key === "businessType" ? config.data?.businessTypes : config.data?.teamSizes)?.map((value) => <option key={value} value={value}>{value}</option>)}</select> : <input name={key} value={form.values[key]} onChange={form.handleChange} onBlur={form.handleBlur} className={inputClass} maxLength={key === "mobileNumber" ? 40 : 120} />}{error(key)}</label>)}</div>
        <label className="block text-sm font-semibold text-body">{t("description")}<textarea name="description" value={form.values.description} onChange={form.handleChange} onBlur={form.handleBlur} rows={5} maxLength={10000} className={inputClass} placeholder={t("descriptionHint")} aria-describedby="error-description" />{error("description")}</label>
        <div><label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-line bg-card px-5 text-sm font-semibold text-body hover:bg-[var(--soft-surface)]"><Paperclip className="size-4" />{isUploading ? t("uploading") : t("attach")}<input className="sr-only" type="file" accept="image/png,image/jpeg,image/heic,image/heif,image/webp,application/pdf" multiple disabled={isUploading || form.values.attachmentUrls.length >= 5} onChange={(event) => { void upload(event.target.files); event.target.value = ""; }} /></label><p className="mt-2 text-xs text-muted">{t("attachmentHint")}</p><div className="mt-2 space-y-2">{form.values.attachmentUrls.map((url, index) => <div key={url} className="flex items-center justify-between rounded-lg bg-[var(--soft-surface)] px-3 py-2 text-sm"><a href={url} target="_blank" rel="noreferrer" className="truncate text-brand underline">{t("attachment", { number: index + 1 })}</a><button type="button" aria-label={t("removeAttachment")} onClick={() => void form.setFieldValue("attachmentUrls", form.values.attachmentUrls.filter((item) => item !== url))}><X className="size-4" /></button></div>)}</div></div>
      </fieldset>
      <button type="submit" disabled={form.isSubmitting} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-brand px-6 font-semibold text-ink disabled:opacity-60">{form.isSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : null}{form.isSubmitting ? t("creating") : t("create")}</button>
    </form>}
  </div>;
}
