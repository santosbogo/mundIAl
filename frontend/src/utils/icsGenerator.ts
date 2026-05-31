/**
 * ICS generator for manual slot selection.
 *
 * Given the user's available time slots, produces an ICS file where the
 * *complement* (busy hours) is encoded as weekly OPAQUE events. This is
 * what gets sent to the backend for parsing — the backend doesn't care
 * whether the ICS came from here or was uploaded by the user.
 */

import type { TimeSlot } from "@/types";

// Reference Monday in June 2026 (WC starts June 11, 2026)
// The RRULE:FREQ=WEEKLY makes the actual date irrelevant for weekly patterns.
const REF_DATES: Record<string, string> = {
  monday: "20260601",
  tuesday: "20260602",
  wednesday: "20260603",
  thursday: "20260604",
  friday: "20260605",
  saturday: "20260606",
  sunday: "20260607",
  // next Monday, needed for DTEND when a Sunday event ends at midnight
  next_monday: "20260608",
};

const DAYS_ORDER = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

// Day index → next day key (for DTEND crossing midnight)
const NEXT_DAY: Record<string, string> = {
  monday: "tuesday",
  tuesday: "wednesday",
  wednesday: "thursday",
  thursday: "friday",
  friday: "saturday",
  saturday: "sunday",
  sunday: "next_monday",
};

/** Compute the complement of available intervals within [0, 24]. */
function complementIntervals(
  available: [number, number][],
): [number, number][] {
  const sorted = [...available].sort(([a], [b]) => a - b);
  const result: [number, number][] = [];
  let cursor = 0;

  for (const [start, end] of sorted) {
    if (start > cursor) result.push([cursor, start]);
    cursor = Math.max(cursor, end);
  }
  if (cursor < 24) result.push([cursor, 24]);

  return result;
}

function formatHour(hour: number): string {
  return `${String(hour).padStart(2, "0")}0000`;
}

/**
 * Generate a base64-encoded ICS string from a list of available slots.
 * The ICS contains weekly OPAQUE (busy) events for every hour the user
 * did NOT select. RRULE:FREQ=WEEKLY ensures it repeats every week.
 */
export function generateBusyIcs(slots: TimeSlot[], timezone: string): string {
  const eventLines: string[] = [];

  for (const day of DAYS_ORDER) {
    const available = slots
      .filter((s) => s.day_of_week === day)
      .map((s) => [s.start_hour, s.end_hour] as [number, number]);

    const busyIntervals = complementIntervals(available);

    for (const [start, end] of busyIntervals) {
      const refDate = REF_DATES[day];

      // DTEND: if busy block ends at midnight, point to next day at 00:00
      const dtendDate = end === 24 ? REF_DATES[NEXT_DAY[day]] : refDate;
      const dtendHour = end === 24 ? "000000" : formatHour(end);

      eventLines.push(
        [
          "BEGIN:VEVENT",
          `DTSTART;TZID=${timezone}:${refDate}T${formatHour(start)}`,
          `DTEND;TZID=${timezone}:${dtendDate}T${dtendHour}`,
          "RRULE:FREQ=WEEKLY",
          "SUMMARY:Ocupado",
          "TRANSP:OPAQUE",
          "END:VEVENT",
        ].join("\r\n"),
      );
    }
  }

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//mundIAl//Schedule//ES",
    "X-WR-CALNAME:Disponibilidad mundIAl",
    ...eventLines,
    "END:VCALENDAR",
  ].join("\r\n");

  return toBase64(ics);
}

/** Read a File as a base64-encoded string. */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // result is "data:...;base64,<data>" — strip the prefix
      resolve(result.split(",")[1] ?? "");
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function toBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}
