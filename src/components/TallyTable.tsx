"use client";

import type { Tally } from "@/lib/events";

export interface TallyRow extends Tally {
  /** What the row selects when clicked. Defaults to its name. */
  key?: string;
  /** Text shown instead of the name, e.g. a translated label. */
  label?: string;
}

interface TallyTableProps {
  nameHeader: string;
  countHeader: string;
  hoursHeader: string;
  rows: TallyRow[];
  /** Summary rows shown below the list, separated by a rule. */
  footerRows?: TallyRow[];
  selected: string | null;
  onSelect: (key: string | null) => void;
  precision: number;
  emptyText?: string;
}

/** A clickable table of event counts and hours per group. Clicking the selected row clears it. */
export function TallyTable({
  nameHeader,
  countHeader,
  hoursHeader,
  rows,
  footerRows = [],
  selected,
  onSelect,
  precision,
  emptyText,
}: TallyTableProps) {
  if (rows.length === 0 && emptyText) {
    return <div className="p-6 text-center text-sm text-ink-3">{emptyText}</div>;
  }

  const renderRow = (row: TallyRow, bold: boolean) => {
    const key = row.key ?? row.name;
    const isSelected = selected === key;
    const tone = isSelected ? "text-accent-soft-ink" : "text-ink";
    return (
      <tr
        key={key}
        onClick={() => onSelect(isSelected ? null : key)}
        aria-selected={isSelected}
        className={`cursor-pointer border-l-2 transition-colors ${
          isSelected ? "border-l-accent bg-accent-soft" : "border-l-transparent hover:bg-muted"
        }`}
      >
        <td className={`max-w-[120px] truncate px-3 py-1.5 text-sm font-semibold ${tone}`}>{row.label ?? row.name}</td>
        <td className={`px-1.5 py-1.5 text-right tabular-nums ${bold ? "font-semibold" : "font-medium"} ${tone}`}>
          {row.count}
        </td>
        <td className={`px-1.5 py-1.5 text-right tabular-nums ${bold ? "font-semibold" : "font-medium"} ${tone}`}>
          {row.hours.toFixed(precision)}
        </td>
      </tr>
    );
  };

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-xs uppercase tracking-wider text-ink-3">
          <th className="px-3 py-1.5 text-left font-medium">{nameHeader}</th>
          <th className="px-1.5 py-1.5 text-right font-medium">{countHeader}</th>
          <th className="px-1.5 py-1.5 text-right font-medium">{hoursHeader}</th>
        </tr>
      </thead>
      <tbody>{rows.map((row) => renderRow(row, false))}</tbody>
      {footerRows.length > 0 && (
        <tfoot className="border-t border-line">{footerRows.map((row) => renderRow(row, true))}</tfoot>
      )}
    </table>
  );
}
