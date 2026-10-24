"use client";

import { CalendarDays, Clock } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";

interface SummaryCardsProps {
  eventCount: number;
  totalHours: number;
  compact: boolean;
}

export function SummaryCards({ eventCount, totalHours, compact }: SummaryCardsProps) {
  const { settings, t } = useSettings();
  const precision = settings.durationPrecision;

  // Fixed to en-US so hours read the same way as the table, which always uses a decimal point.
  const hours = `${totalHours.toLocaleString("en-US", {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  })}h`;

  if (compact) {
    return (
      <div className="flex items-center gap-4 text-xs text-ink-3">
        <span>
          <span className="font-semibold text-ink">{eventCount.toLocaleString()}</span> {t("events")}
        </span>
        <span>
          <span className="font-semibold text-ink">{hours}</span> {t("total")}
        </span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="flex items-center gap-4 rounded-xl bg-accent-soft p-4">
        <div className="rounded-lg bg-accent-icon-bg p-3">
          <CalendarDays className="h-6 w-6 text-accent" aria-hidden />
        </div>
        <div>
          <p className="text-sm font-medium text-accent-soft-ink/60">{t("totalEvents")}</p>
          <p className="text-2xl font-bold text-accent-soft-ink">{eventCount.toLocaleString()}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 rounded-xl bg-info-soft p-4">
        <div className="rounded-lg bg-info-icon-bg p-3">
          <Clock className="h-6 w-6 text-info" aria-hidden />
        </div>
        <div>
          <p className="text-sm font-medium text-info-soft-ink/60">{t("totalHours")}</p>
          <p className="text-2xl font-bold text-info-soft-ink">{hours}</p>
        </div>
      </div>
    </div>
  );
}
