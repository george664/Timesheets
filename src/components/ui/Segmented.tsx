interface SegmentedProps<T extends string | number> {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  label?: string;
}

/** A row of mutually exclusive buttons. */
export function Segmented<T extends string | number>({ value, options, onChange, label }: SegmentedProps<T>) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              selected ? "bg-primary text-primary-ink" : "bg-muted text-ink-2 hover:bg-muted-strong"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
