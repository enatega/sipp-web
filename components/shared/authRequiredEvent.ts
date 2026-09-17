const AUTH_REQUIRED_EVENT = "shaanieol:auth-required";

export function openAuthRequiredDialog(returnTo?: string) {
  window.dispatchEvent(
    new CustomEvent<{ returnTo?: string }>(AUTH_REQUIRED_EVENT, {
      detail: { returnTo },
    }),
  );
}

export function onAuthRequiredDialog(
  handler: (detail: { returnTo?: string }) => void,
) {
  const listener = (event: Event) => {
    handler((event as CustomEvent<{ returnTo?: string }>).detail ?? {});
  };
  window.addEventListener(AUTH_REQUIRED_EVENT, listener);
  return () => window.removeEventListener(AUTH_REQUIRED_EVENT, listener);
}
