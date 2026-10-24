interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  hint?: string;
}

/** A labelled on/off switch. */
export function Toggle({ checked, onChange, label, hint }: ToggleProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <span className="text-sm font-medium text-ink">{label}</span>
        {hint && <p className="text-xs text-ink-3">{hint}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 flex-shrink-0 rounded-full transition-colors ${
          checked ? "bg-primary" : "bg-muted-strong"
        }`}
      >
        <span
          className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-surface shadow transition-transform ${
            checked ? "translate-x-5" : ""
          }`}
        />
      </button>
    </div>
  );
}
