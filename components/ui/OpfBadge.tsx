export default function OpfBadge() {
  return (
    <div
      className="fixed bottom-5 left-5 z-40 flex w-28 flex-col items-center gap-1.5 text-center"
      aria-label="Operant Pharmacy Federation"
    >
      <img
        src="/logo/OPF_Logo.png"
        alt="Operant Pharmacy Federation logo"
        className="h-14 w-14 object-contain"
      />
      <p className="text-[10px] font-semibold leading-tight text-[var(--primary-900)]">
        Operant Pharmacy
        <br />
        Federation
      </p>
    </div>
  );
}
