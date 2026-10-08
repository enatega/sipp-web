"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFormik } from "formik";
import { ArrowLeft, Bike, ChevronRight, CreditCard, LoaderCircle, MapPin, MessageSquareText, ShoppingBag, Store, Truck, WalletCards } from "lucide-react";
import { useTranslations } from "next-intl";
import { Header } from "@/components/shared/app-shell/Header";
import { useAppCurrency } from "@/lib/useAppCurrency";
import { useAddressesQuery, useSavedCardsQuery, useSessionQuery, useStoredPlace, useWalletQuery, type ChosenPlace, type SavedAddress, type SavedCard } from "@/modules/account";
import { openAuthRequiredDialog } from "@/components/shared/authRequiredEvent";
import { ApiError } from "@/services/api/client";
import { checkoutSchema, type CheckoutFormValues } from "../../schemas/checkoutSchema";
import { useCartQuery } from "../../hooks/useCart";
import { useCheckoutPreview, usePlaceOrderMutation, usePlacedOrderLookup, useStripeOrderStatus, useValidateCheckoutAddressMutation } from "../../hooks/useCheckout";
import type { CheckoutPreviewInput, PlaceOrderInput, StripePaymentQuote } from "../../types/checkout";
import { CheckoutAddressPicker } from "./CheckoutAddressPicker";
import { CheckoutAlertStack, type CheckoutAlert } from "./CheckoutAlertStack";
import { CheckoutCouponSection } from "./CheckoutCouponSection";
import { CheckoutSavedCardPicker } from "./CheckoutSavedCardPicker";
import { CheckoutSummary } from "./CheckoutSummary";
import { StripePaymentModal } from "./StripePaymentModal";

const TIP_OPTIONS = [0, 5, 10, 20];

function buildNote(values: CheckoutFormValues) {
  const restaurant = values.restaurantNote.trim();
  const courierParts = [values.leaveAtDoor ? "Leave at door." : "", values.courierNote.trim()].filter(Boolean);
  return [restaurant ? `Restaurant:\n${restaurant}` : "", courierParts.length ? `Courier:\n${courierParts.join(" ")}` : ""].filter(Boolean).join("\n\n") || undefined;
}

function locationKey(place: ChosenPlace | null) {
  return place
    ? `${place.latitude}:${place.longitude}:${place.address}`
    : "";
}

function placeFromSavedAddress(address: SavedAddress): ChosenPlace | null {
  const [longitude, latitude] = address.location?.coordinates ?? [];
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  return {
    address: address.address,
    latitude,
    longitude,
    label: address.location_name || address.type.toLowerCase(),
    savedAddressId: address.id,
  };
}

function deliveryLocationInput(
  place: ChosenPlace,
  selectedSavedAddressId: string | null,
) {
  return selectedSavedAddressId
    ? { addressId: selectedSavedAddressId }
    : {
        deliveryAddress: place.address,
        deliveryLatitude: place.latitude,
        deliveryLongitude: place.longitude,
        ...(place.label ? { deliveryLabel: place.label } : {}),
      };
}

function FieldError({ message }: { message?: string }) {
  return message ? <p role="alert" className="mt-2 text-xs font-medium text-brand">{message}</p> : null;
}

function isMissingCartBucketError(error: unknown) {
  return error instanceof ApiError && error.status === 404 && /bucket not found/i.test(error.message);
}

interface Props {
  initialStripeDraftId?: string;
  wasCardPaymentCancelled?: boolean;
}

export function CheckoutPage({ initialStripeDraftId, wasCardPaymentCancelled = false }: Props) {
  const t = useTranslations("deliveries.checkout");
  const { symbol: currencySymbol } = useAppCurrency();
  const router = useRouter();
  const session = useSessionQuery();
  const authenticated = session.data?.authenticated === true;
  const cart = useCartQuery(authenticated);
  const refetchCart = cart.refetch;
  const addresses = useAddressesQuery(authenticated);
  const savedCards = useSavedCardsQuery(authenticated);
  const wallet = useWalletQuery(authenticated);
  const storedPlace = useStoredPlace();
  const placeOrder = usePlaceOrderMutation();
  const lookupPlacedOrder = usePlacedOrderLookup();
  const validateAddress = useValidateCheckoutAddressMutation();
  const [submitError, setSubmitError] = useState("");
  const [isOrderConfirmationUnknown, setIsOrderConfirmationUnknown] = useState(false);
  const unconfirmedAttemptRef = useRef<Pick<PlaceOrderInput, "bucketId" | "paymentMethod"> | null>(null);
  const [dismissedPreviewError, setDismissedPreviewError] = useState<unknown>(null);
  const [isAddressPickerOpen, setIsAddressPickerOpen] = useState(false);
  const [addressPickerError, setAddressPickerError] = useState("");
  const [validatingAddressId, setValidatingAddressId] = useState<string | null>(null);
  const [selectedCardChoice, setSelectedCardChoice] = useState<string | null | undefined>(undefined);
  const [addressOverride, setAddressOverride] = useState<{
    place: ChosenPlace;
    savedAddressId: string;
    sourcePlace: ChosenPlace | null;
  } | null>(null);
  const [stripePayment, setStripePayment] = useState<{
    clientSecret: string;
    draftId: string;
    paymentStatus: string;
    paymentQuote: StripePaymentQuote;
  } | null>(null);
  const [isStripeConfirmed, setIsStripeConfirmed] = useState(false);
  const [isWalletDialogOpen, setIsWalletDialogOpen] = useState(false);
  const [isCancellationNoticeVisible, setIsCancellationNoticeVisible] = useState(wasCardPaymentCancelled);
  const addressTriggerRef = useRef<HTMLButtonElement>(null);
  const checkoutAlertRegionRef = useRef<HTMLDivElement>(null);
  const activeAddressOverride =
    addressOverride?.sourcePlace === storedPlace.place ? addressOverride : null;
  const deliveryPlace = activeAddressOverride?.place ?? storedPlace.place;
  const selectedSavedAddressId =
    activeAddressOverride?.savedAddressId ?? storedPlace.place?.savedAddressId ?? null;
  const availableSavedCards = savedCards.data?.cards ?? [];
  const resolvedPaymentMethodId = selectedCardChoice === null
    ? null
    : selectedCardChoice && availableSavedCards.some((card) => card.id === selectedCardChoice)
      ? selectedCardChoice
      : availableSavedCards.find((card) => card.isDefault)?.id ?? availableSavedCards[0]?.id ?? null;
  const selectedSavedCard: SavedCard | null =
    availableSavedCards.find((card) => card.id === resolvedPaymentMethodId) ?? null;

  const formik = useFormik<CheckoutFormValues>({
    enableReinitialize: true,
    initialValues: { orderType: "delivery", deliveryLocationKey: locationKey(storedPlace.place), paymentMethod: "wallet", restaurantNote: "", courierNote: "", leaveAtDoor: false, riderTip: 0 },
    validationSchema: checkoutSchema({ addressRequired: t("addressRequired"), noteTooLong: t("noteTooLong"), invalidTip: t("invalidTip") }),
    onSubmit: async (values) => {
      if (!cart.data?.bucketId || !cart.data.storeId) return;
      if (values.orderType === "delivery" && !deliveryPlace) return;
      const retryingUnconfirmedWalletOrder =
        values.paymentMethod === "wallet" &&
        unconfirmedAttemptRef.current?.bucketId === cart.data.bucketId &&
        unconfirmedAttemptRef.current.paymentMethod === "wallet";
      if (values.paymentMethod === "wallet" && !retryingUnconfirmedWalletOrder) {
        if (wallet.isPending) {
          showSubmitError(t("walletLoading"));
          return;
        }
        if (wallet.isError) {
          showSubmitError(t("walletBalanceUnavailable"));
          return;
        }
        if (Number(wallet.data?.data?.wallet_balance ?? 0) < Number(preview.data?.pricing.totalAmount ?? 0)) {
          setIsWalletDialogOpen(true);
          return;
        }
      }
      setSubmitError("");
      setIsOrderConfirmationUnknown(false);
      const input: PlaceOrderInput = {
        storeId: cart.data.storeId,
        bucketId: cart.data.bucketId,
        orderType: values.orderType,
        paymentMethod: values.paymentMethod,
        ...(values.paymentMethod === "stripe" && resolvedPaymentMethodId
          ? { paymentMethodId: resolvedPaymentMethodId }
          : {}),
        ...(values.orderType === "delivery" && deliveryPlace
          ? {
              ...deliveryLocationInput(deliveryPlace, selectedSavedAddressId),
              riderTip: values.riderTip || undefined,
            }
          : {}),
        customerNote: buildNote(values),
      };
      try {
        const response = await placeOrder.mutateAsync(input);
        if (response.mode === "stripe") {
          if (response.orderId) {
            router.push(`/orders/${response.orderId}`);
            return;
          }
          if (response.checkoutUrl) {
            window.location.assign(response.checkoutUrl);
            return;
          }
          if (!response.clientSecret) {
            showSubmitError(t("paymentRedirectError"));
            return;
          }
          setStripePayment({
            clientSecret: response.clientSecret,
            draftId: response.draftId,
            paymentStatus: response.paymentStatus,
            paymentQuote: response.paymentQuote,
          });
          setIsStripeConfirmed(
            response.paymentStatus === "succeeded" ||
              response.paymentStatus === "processing",
          );
          return;
        }
        router.push(`/orders/${response.orderId}`);
        unconfirmedAttemptRef.current = null;
      } catch (error) {
        if (!(error instanceof ApiError) || error.status === 408 || error.status >= 500) {
          for (let attempt = 0; attempt < 3; attempt += 1) {
            if (attempt > 0) {
              await new Promise<void>((resolve) => window.setTimeout(resolve, 1_500));
            }
            try {
              const placed = await lookupPlacedOrder({ bucketId: input.bucketId, storeId: input.storeId });
              if (placed.orderId) {
                void refetchCart();
                router.push(`/orders/${placed.orderId}`);
                return;
              }
            } catch (lookupError) {
              if (lookupError instanceof ApiError && (lookupError.status === 401 || lookupError.status === 403)) {
                setIsOrderConfirmationUnknown(true);
                showSubmitError(checkoutErrorMessage(lookupError));
                return;
              }
            }
          }
          unconfirmedAttemptRef.current = { bucketId: input.bucketId, paymentMethod: input.paymentMethod };
          setIsOrderConfirmationUnknown(true);
          showSubmitError(t("orderConfirmationUnknown"));
          return;
        }
        if (isMissingCartBucketError(error)) {
          await refetchCart();
          showSubmitError(t("orderChangedError"));
          return;
        }
        showSubmitError(checkoutErrorMessage(error));
      }
    },
  });

  const previewInput = useMemo<CheckoutPreviewInput | null>(() => {
    if (!cart.data?.bucketId || !cart.data.storeId) return null;
    if (formik.values.orderType === "delivery" && !deliveryPlace) return null;
    return { storeId: cart.data.storeId, bucketId: cart.data.bucketId, orderType: formik.values.orderType, paymentMethod: formik.values.paymentMethod, ...(formik.values.orderType === "delivery" && deliveryPlace ? { ...deliveryLocationInput(deliveryPlace, selectedSavedAddressId), riderTip: formik.values.riderTip || undefined } : {}) };
  }, [cart.data, deliveryPlace, formik.values.orderType, formik.values.paymentMethod, formik.values.riderTip, selectedSavedAddressId]);
  const preview = useCheckoutPreview(previewInput);
  const activeStripeDraftId = stripePayment?.draftId ?? initialStripeDraftId ?? null;
  const stripeOrderStatus = useStripeOrderStatus(
    activeStripeDraftId,
    isStripeConfirmed || Boolean(initialStripeDraftId),
  );
  const walletBalance = Number(wallet.data?.data?.wallet_balance ?? 0);
  const walletShortfall = Math.max(
    500,
    Math.ceil((Number(preview.data?.pricing.totalAmount ?? 0) - walletBalance) * 100) / 100,
  );
  const walletTopUpHref = `/wallet?topUpAmount=${encodeURIComponent(String(walletShortfall))}&returnTo=checkout`;
  const isAddressPreviewError =
    formik.values.orderType === "delivery" &&
    preview.error instanceof ApiError &&
    preview.error.status === 400 &&
    /outside.*delivery area|does not deliver/i.test(preview.error.message);
  const hasPreviewError =
    preview.isError &&
    !isAddressPreviewError &&
    preview.error !== dismissedPreviewError;


  useEffect(() => {
    if (!session.isPending && !authenticated) {
      openAuthRequiredDialog("/checkout");
      router.replace("/cart");
    }
  }, [authenticated, router, session.isPending]);

  useEffect(() => {
    const orderId = stripeOrderStatus.data?.orderId;
    if (!orderId) return;
    void refetchCart();
    router.push(`/orders/${orderId}`);
  }, [refetchCart, router, stripeOrderStatus.data?.orderId]);

  useEffect(() => {
    if (isMissingCartBucketError(preview.error)) {
      void refetchCart();
    }
  }, [preview.error, refetchCart]);

  useEffect(() => {
    const store = preview.data?.store;
    if (!store) return;
    if (formik.values.orderType === "delivery" && !store.deliveryAllowed && store.pickupAllowed) void formik.setFieldValue("orderType", "pickup");
    if (formik.values.orderType === "pickup" && !store.pickupAllowed && store.deliveryAllowed) void formik.setFieldValue("orderType", "delivery");
    if (formik.values.paymentMethod === "stripe" && !store.stripeAllowed) void formik.setFieldValue("paymentMethod", "wallet");
  }, [formik, preview.data?.store]);

  function checkoutErrorMessage(error: unknown) {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      return t("offlineError");
    }
    if (error instanceof ApiError) {
      if (/store is currently closed/i.test(error.message)) return t("storeClosedMessage");
      if (
        /USD conversion rate|Active currency configuration|USD minimum charge/i.test(
          error.message,
        )
      ) {
        return t("cardPaymentUnavailable");
      }
      if (error.status === 401) return t("sessionError");
      if (error.status === 403) return t("permissionError");
      if (
        error.status === 400 &&
        /outside.*delivery area|does not deliver/i.test(error.message)
      ) {
        return t("addressUnavailable");
      }
      if (error.status === 409) return t("orderChangedError");
      if (isMissingCartBucketError(error)) return t("orderChangedError");
      if (/insufficient.*wallet|wallet.*balance/i.test(error.message)) {
        void wallet.refetch();
        setIsWalletDialogOpen(true);
        return t("walletInsufficientMessage");
      }
      if (error.status === 408) return t("timeoutError");
      if (error.status === 429) return t("rateLimitError");
      if (error.status >= 500) return t("serviceUnavailableError");
    }
    return t("placeOrderError");
  }

  function showSubmitError(message: string) {
    setSubmitError(message);
    window.requestAnimationFrame(() => checkoutAlertRegionRef.current?.focus());
  }

  function closeAddressPicker() {
    setIsAddressPickerOpen(false);
    window.requestAnimationFrame(() => addressTriggerRef.current?.focus());
  }

  async function selectDeliveryAddress(address: SavedAddress) {
    if (address.id === selectedSavedAddressId) {
      setIsAddressPickerOpen(false);
      window.requestAnimationFrame(() => addressTriggerRef.current?.focus());
      return;
    }
    if (!cart.data?.bucketId || !cart.data.storeId) return;

    setAddressPickerError("");
    setValidatingAddressId(address.id);
    try {
      await validateAddress.mutateAsync({
        storeId: cart.data.storeId,
        bucketId: cart.data.bucketId,
        orderType: "delivery",
        paymentMethod: formik.values.paymentMethod,
        addressId: address.id,
        ...(formik.values.riderTip > 0
          ? { riderTip: formik.values.riderTip }
          : {}),
      });
      const place = placeFromSavedAddress(address);
      if (!place) {
        setAddressPickerError(t("addressValidationError"));
        return;
      }
      setAddressOverride({
        place,
        savedAddressId: address.id,
        sourcePlace: storedPlace.place,
      });
      await formik.setFieldValue("deliveryLocationKey", locationKey(place));
      setIsAddressPickerOpen(false);
      window.requestAnimationFrame(() => addressTriggerRef.current?.focus());
    } catch (error) {
      const isOutsideDeliveryArea =
        error instanceof ApiError &&
        /outside.*delivery area|does not deliver/i.test(error.message);
      setAddressPickerError(
        isOutsideDeliveryArea
          ? t("addressUnavailable")
          : t("addressValidationError"),
      );
    } finally {
      setValidatingAddressId(null);
    }
  }

  if (session.isPending || cart.isPending || addresses.isPending || !storedPlace.isReady || !authenticated) return <><Header /><main className="grid min-h-[65vh] place-items-center text-brand"><LoaderCircle aria-hidden="true" className="size-8 animate-spin" /><span className="sr-only">{t("loading")}</span></main></>;
  if (initialStripeDraftId && !stripeOrderStatus.data?.orderId) {
    const hasFailed = stripeOrderStatus.data?.status === "payment_failed" || stripeOrderStatus.data?.status === "cancelled";
    const needsAttention = hasFailed || stripeOrderStatus.isError;
    return <><Header /><main className="section-wrap grid min-h-[65vh] place-items-center text-center"><div role={needsAttention ? "alert" : "status"}>{needsAttention ? null : <LoaderCircle aria-hidden="true" className="mx-auto size-8 animate-spin text-brand" />}<h1 className="mt-5 text-xl font-bold text-ink">{hasFailed ? t("cardPaymentError") : stripeOrderStatus.isError ? t("paymentConfirmationDelayedTitle") : t("confirmingPayment")}</h1><p className="mt-2 max-w-sm text-sm text-body">{hasFailed ? t("cardPaymentRetryHint") : stripeOrderStatus.isError ? t("paymentConfirmationDelayed") : t("confirmingPaymentHint")}</p>{needsAttention ? <div className="mt-5 flex justify-center gap-3"><Link href="/orders" className="inline-flex rounded-full bg-brand px-5 py-3 text-sm font-bold text-ink">{t("viewOrders")}</Link><Link href="/checkout" className="inline-flex rounded-full border border-line px-5 py-3 text-sm font-bold text-ink">{t("backToCheckout")}</Link></div> : null}</div></main></>;
  }
  if (cart.isError || !cart.data) return <><Header /><main className="section-wrap grid min-h-[65vh] place-items-center text-center"><div><h1 className="text-xl font-bold text-ink">{t("loadErrorTitle")}</h1><p className="mt-2 text-sm text-body">{t("loadErrorMessage")}</p><button type="button" onClick={() => void cart.refetch()} className="mt-5 rounded-full bg-brand px-6 py-3 text-sm font-bold text-ink">{t("retry")}</button></div></main></>;
  if (cart.data.isEmpty) return <><Header /><main className="section-wrap grid min-h-[65vh] place-items-center text-center"><div><ShoppingBag aria-hidden="true" className="mx-auto size-10 text-brand" /><h1 className="mt-4 text-xl font-bold text-ink">{t("emptyTitle")}</h1><p className="mt-2 text-sm text-body">{t("emptyMessage")}</p><div className="mt-5 flex flex-wrap justify-center gap-3"><Link href="/orders" className="inline-flex rounded-full border border-line px-6 py-3 text-sm font-bold text-ink">{t("viewOrders")}</Link><Link href="/discovery" className="inline-flex rounded-full bg-brand px-6 py-3 text-sm font-bold text-ink">{t("browseFood")}</Link></div></div></main></>;

  const store = preview.data?.store;
  const checkoutAlerts: CheckoutAlert[] = [
    ...(isCancellationNoticeVisible ? [{ id: "card-cancelled", title: t("cardPaymentTitle"), message: t("cardPaymentCancelled"), onDismiss: () => { setIsCancellationNoticeVisible(false); router.replace("/checkout"); } }] : []),
    ...(hasPreviewError
      ? [{
          id: "preview",
          title: preview.error instanceof ApiError && /store is currently closed/i.test(preview.error.message) ? t("storeClosedTitle") : t("previewErrorTitle"),
          message: checkoutErrorMessage(preview.error),
          onDismiss: () => setDismissedPreviewError(preview.error),
        }]
      : []),
    ...(submitError
      ? [{
          id: "submit",
          title: t(isOrderConfirmationUnknown ? "orderConfirmationUnknownTitle" : "placeOrderErrorTitle"),
          message: submitError,
          ...(isOrderConfirmationUnknown ? { actionHref: "/orders", actionLabel: t("viewOrders") } : {}),
          onDismiss: () => { setSubmitError(""); setIsOrderConfirmationUnknown(false); },
        }]
      : []),
  ];
  const fieldClass = "mt-2 w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink outline-none transition-[border-color,box-shadow] focus:border-brand focus:ring-4 focus:ring-brand/10";
  return (
    <>
      <Header cartCount={cart.data.totalItems} />
      <CheckoutAlertStack
        dismissLabel={t("dismissError")}
        notices={checkoutAlerts}
        regionRef={checkoutAlertRegionRef}
      />
      <main className="min-h-[calc(100vh-76px)] bg-[linear-gradient(180deg,var(--soft-surface)_0,transparent_320px)] pb-12 pt-7 sm:pt-10">
        <form onSubmit={formik.handleSubmit} className="section-wrap">
          <Link href="/cart" className="inline-flex items-center gap-2 text-sm font-semibold text-body transition-colors hover:text-brand"><ArrowLeft aria-hidden="true" className="size-4" />{t("backToCart")}</Link>
          <div className="mt-5"><p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">{t("eyebrow")}</p><h1 className="mt-1 text-3xl font-bold text-ink sm:text-4xl">{t("title")}</h1><p className="mt-2 text-sm text-body">{store ? t("orderingFrom", { store: store.name }) : t("subtitle")}</p></div>

          <div className="mt-7 grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_380px] xl:gap-10">
            <div className="space-y-5">
              <section className="rounded-3xl border border-line bg-card p-5 shadow-[0_8px_26px_rgba(35,22,26,0.045)] sm:p-6">
                <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-brand/10 text-brand"><Truck aria-hidden="true" className="size-5" /></span><div><h2 className="font-bold text-ink">{t("fulfilmentTitle")}</h2><p className="text-xs text-muted">{t("fulfilmentDescription")}</p></div></div>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  {(["delivery", "pickup"] as const).map((type) => { const disabled = type === "delivery" ? store?.deliveryAllowed === false : store?.pickupAllowed === false; const Icon = type === "delivery" ? Bike : Store; return <button key={type} type="button" disabled={disabled} onClick={() => { void formik.setFieldValue("orderType", type); if (type === "pickup") { void formik.setFieldValue("leaveAtDoor", false); void formik.setFieldValue("riderTip", 0); } }} className={`flex min-h-16 items-center gap-3 rounded-2xl border px-4 text-left transition-[border-color,background-color,transform] ${formik.values.orderType === type ? "border-brand bg-brand/5 text-brand" : "border-line text-body hover:border-brand/30"} disabled:cursor-not-allowed disabled:opacity-40`}><Icon aria-hidden="true" className="size-5 shrink-0" /><span><strong className="block text-sm text-ink">{t(type)}</strong><small className="text-[11px]">{t(`${type}Hint`)}</small></span></button>; })}
                </div>
              </section>

              {formik.values.orderType === "delivery" ? <section className="rounded-3xl border border-line bg-card p-5 shadow-[0_8px_26px_rgba(35,22,26,0.045)] sm:p-6"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-brand/10 text-brand"><MapPin aria-hidden="true" className="size-5" /></span><div><h2 className="font-bold text-ink">{t("addressTitle")}</h2><p className="text-xs text-muted">{t("addressDescription")}</p></div></div>{deliveryPlace ? <button ref={addressTriggerRef} type="button" onClick={() => { setAddressPickerError(""); setIsAddressPickerOpen(true); }} className={`mt-5 flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-[border-color,background-color] hover:border-brand/30 hover:bg-[var(--soft-surface)] ${isAddressPreviewError ? "border-red-300 bg-red-50" : "border-line"}`}><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand/10 text-brand"><MapPin aria-hidden="true" className="size-4" /></span><span className="min-w-0 flex-1"><strong className="block text-sm text-ink">{deliveryPlace.label || t("delivery")}</strong><span className="mt-1 block line-clamp-2 text-xs leading-5 text-body">{deliveryPlace.address}</span></span><span className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-brand">{t("changeAddress")}<ChevronRight aria-hidden="true" className="size-4" /></span></button> : <div className="mt-5 rounded-xl border border-dashed border-line p-5 text-center"><p className="text-sm text-body">{t("noAddress")}</p><Link href="/profile/address-book" className="mt-3 inline-flex text-sm font-bold text-brand">{t("addAddress")}</Link></div>}{isAddressPreviewError ? <p role="alert" className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium leading-5 text-red-700">{t("addressUnavailable")}</p> : null}<FieldError message={formik.touched.deliveryLocationKey ? formik.errors.deliveryLocationKey : undefined} /><label className={`mt-4 flex items-center gap-3 rounded-xl bg-[var(--soft-surface)] p-4 ${store?.stripeAllowed === false ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}><input type="checkbox" name="leaveAtDoor" checked={formik.values.leaveAtDoor} disabled={store?.stripeAllowed === false} onChange={(event) => { void formik.setFieldValue("leaveAtDoor", event.target.checked); if (event.target.checked) void formik.setFieldValue("paymentMethod", "stripe"); }} className="size-4 accent-[var(--color-brand)]" /><span><strong className="block text-sm text-ink">{t("leaveAtDoor")}</strong><small className="text-xs text-muted">{t("leaveAtDoorHint")}</small></span></label></section> : null}

              <section className="rounded-3xl border border-line bg-card p-5 shadow-[0_8px_26px_rgba(35,22,26,0.045)] sm:p-6">
                <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-brand/10 text-brand"><CreditCard aria-hidden="true" className="size-5" /></span><div><h2 className="font-bold text-ink">{t("paymentTitle")}</h2><p className="text-xs text-muted">{t("paymentDescription")}</p></div></div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">{(["wallet", "stripe"] as const).map((method) => { const disabled = method === "stripe" && store?.stripeAllowed === false; const Icon = method === "wallet" ? WalletCards : CreditCard; return <label key={method} className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition-colors ${disabled ? "cursor-not-allowed opacity-40" : ""} ${formik.values.paymentMethod === method ? "border-brand bg-brand/5" : "border-line"}`}><input type="radio" name="paymentMethod" value={method} checked={formik.values.paymentMethod === method} disabled={disabled} onChange={formik.handleChange} className="accent-[var(--color-brand)]" /><Icon aria-hidden="true" className="size-5 text-brand" /><span><strong className="block text-sm text-ink">{t(method)}</strong><small className="text-xs text-muted">{t(`${method}Hint`)}</small></span></label>; })}</div>
                {formik.values.paymentMethod === "stripe" ? (
                  <CheckoutSavedCardPicker
                    cards={savedCards.data?.cards ?? []}
                    isLoading={savedCards.isPending}
                    labels={{
                      title: t("savedCardTitle"),
                      description: t("savedCardDescription"),
                      defaultCard: t("defaultCard"),
                      expires: t("cardExpires"),
                      anotherCard: t("useAnotherCard"),
                      anotherCardHint: t("useAnotherCardHint"),
                      manageCards: t("manageCards"),
                      loading: t("loadingCards"),
                      error: t("cardsLoadError"),
                    }}
                    loadError={savedCards.isError}
                    onSelect={setSelectedCardChoice}
                    selectedCardId={resolvedPaymentMethodId}
                  />
                ) : null}
                {formik.values.leaveAtDoor ? <p className="mt-3 text-xs text-muted">{t("leaveAtDoorCard")}</p> : null}
              </section>

              <CheckoutCouponSection enabled={authenticated} storeId={cart.data.storeId} subtotal={cart.data.totalPrice} appliedCouponId={cart.data.appliedCouponId} appliedCouponCode={cart.data.appliedCouponCode} isCouponNotApplicable={preview.data?.coupon?.isApplied === false} />

              {formik.values.orderType === "delivery" ? <section className="rounded-3xl border border-line bg-card p-5 shadow-[0_8px_26px_rgba(35,22,26,0.045)] sm:p-6"><h2 className="font-bold text-ink">{t("tipTitle")}</h2><p className="mt-1 text-xs text-muted">{t("tipDescription")}</p><div className="mt-4 flex flex-wrap gap-2">{TIP_OPTIONS.map((tip) => <button key={tip} type="button" onClick={() => void formik.setFieldValue("riderTip", tip)} className={`min-h-10 rounded-full border px-4 text-sm font-semibold ${formik.values.riderTip === tip ? "border-brand bg-brand text-ink" : "border-line text-ink hover:border-brand/40"}`}>{tip === 0 ? t("noTip") : `${tip}${currencySymbol}`}</button>)}<label className="flex h-11 min-w-36 items-center rounded-full border border-line bg-surface px-4 text-sm text-muted transition-colors focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/10"><input aria-label={t("customTip")} inputMode="decimal" type="number" min="0" max="10000" step="0.01" name="riderTip" value={TIP_OPTIONS.includes(formik.values.riderTip) ? "" : formik.values.riderTip} onChange={(event) => void formik.setFieldValue("riderTip", Number(event.target.value) || 0)} placeholder={t("customTip")} className="w-24 appearance-none bg-transparent px-1 text-base text-ink outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" /><span>{currencySymbol}</span></label></div><FieldError message={formik.touched.riderTip ? formik.errors.riderTip : undefined} /></section> : null}

              <section className="rounded-3xl border border-line bg-card p-5 shadow-[0_8px_26px_rgba(35,22,26,0.045)] sm:p-6"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-brand/10 text-brand"><MessageSquareText aria-hidden="true" className="size-5" /></span><div><h2 className="font-bold text-ink">{t("notesTitle")}</h2><p className="text-xs text-muted">{t("notesDescription")}</p></div></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="text-xs font-semibold text-ink">{t("restaurantNote")}<textarea name="restaurantNote" maxLength={250} rows={3} value={formik.values.restaurantNote} onChange={formik.handleChange} onBlur={formik.handleBlur} placeholder={t("restaurantNotePlaceholder")} className={`${fieldClass} resize-none`} /><FieldError message={formik.touched.restaurantNote ? formik.errors.restaurantNote : undefined} /></label>{formik.values.orderType === "delivery" ? <label className="text-xs font-semibold text-ink">{t("courierNote")}<textarea name="courierNote" maxLength={250} rows={3} value={formik.values.courierNote} onChange={formik.handleChange} onBlur={formik.handleBlur} placeholder={t("courierNotePlaceholder")} className={`${fieldClass} resize-none`} /><FieldError message={formik.touched.courierNote ? formik.errors.courierNote : undefined} /></label> : null}</div></section>

            </div>
            <CheckoutSummary preview={preview.data} isLoading={preview.isFetching} isPlacing={placeOrder.isPending || formik.isSubmitting} disabled={!formik.isValid || !previewInput || cart.data.items.some((item) => !item.inStock)} paymentMethod={formik.values.paymentMethod} />
          </div>
        </form>
      </main>
      {isAddressPickerOpen ? <CheckoutAddressPicker addresses={addresses.data ?? []} error={addressPickerError} isOpen onClose={closeAddressPicker} onSelect={(address) => void selectDeliveryAddress(address)} selectedAddressId={selectedSavedAddressId ?? ""} validatingAddressId={validatingAddressId} /> : null}
      {(stripePayment || initialStripeDraftId) && preview.data ? (
        <StripePaymentModal
          clientSecret={stripePayment?.clientSecret ?? ""}
          draftId={activeStripeDraftId ?? ""}
          error={
            stripeOrderStatus.data?.status === "payment_failed" ||
            stripeOrderStatus.data?.status === "cancelled"
              ? t("cardPaymentError")
              : stripeOrderStatus.isError
                ? t("paymentConfirmationDelayed")
                : ""
          }
          isFinalizing={
            (isStripeConfirmed || Boolean(initialStripeDraftId)) &&
            !stripeOrderStatus.isError &&
            stripeOrderStatus.data?.status !== "payment_failed" &&
            stripeOrderStatus.data?.status !== "cancelled"
          }
          onClose={() => {
            setStripePayment(null);
            setIsStripeConfirmed(false);
            if (initialStripeDraftId) router.replace("/checkout");
          }}
          onConfirmed={() => setIsStripeConfirmed(true)}
          selectedCard={selectedSavedCard}
          total={preview.data.pricing.totalAmount}
          paymentQuote={stripePayment?.paymentQuote ?? null}
        />
      ) : null}
      {isWalletDialogOpen ? <div className="fixed inset-0 z-[90] grid place-items-center bg-black/55 p-4" role="dialog" aria-modal="true" aria-labelledby="wallet-insufficient-title"><div className="w-full max-w-sm rounded-3xl border border-line bg-card p-6 shadow-pop"><span className="grid size-11 place-items-center rounded-full bg-brand/10 text-brand"><WalletCards aria-hidden="true" className="size-5" /></span><h2 id="wallet-insufficient-title" className="mt-4 text-lg font-bold text-ink">{t("walletInsufficientTitle")}</h2><p className="mt-2 text-sm leading-6 text-body">{t("walletInsufficientMessage")}</p><div className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => setIsWalletDialogOpen(false)} className="min-h-10 rounded-full px-4 text-sm font-semibold text-body hover:bg-[var(--soft-surface)]">{t("close")}</button><Link href={walletTopUpHref} onClick={() => setIsWalletDialogOpen(false)} className="inline-flex min-h-10 items-center rounded-full bg-brand px-5 text-sm font-bold text-ink">{t("upgradeWallet")}</Link></div></div></div> : null}
    </>
  );
}
