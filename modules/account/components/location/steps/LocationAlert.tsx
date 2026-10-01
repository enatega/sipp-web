interface Props {
  message: string;
}

export function LocationAlert({ message }: Props) {
  if (!message) return null;

  return (
    <p
      role="alert"
      className="mt-3 rounded-lg bg-danger-soft px-3.5 py-2.5 text-xs leading-relaxed text-danger"
    >
      {message}
    </p>
  );
}
