"""
Tests for the ICS → TimeSlot parser.

All tests use pure functions; no database or HTTP layer involved.
The ICS content is crafted to match exactly what the frontend generates
(weekly recurring OPAQUE events representing busy hours).
"""

from __future__ import annotations

import base64

from app.ml.ics_parser import (
    _busy_to_available,
    _complement_intervals,
    parse_to_available_slots,
)
from app.modules.recommendations.recommendations_schemas import TimeSlot

TZ = "America/Argentina/Buenos_Aires"

# Reference week dates used by the frontend ICS generator (June 1–7, 2026)
REF = {
    "monday": "20260601",
    "tuesday": "20260602",
    "wednesday": "20260603",
    "thursday": "20260604",
    "friday": "20260605",
    "saturday": "20260606",
    "sunday": "20260607",
}


def make_ics(*events: str) -> str:
    """Wrap VEVENT strings in a VCALENDAR envelope and base64-encode."""
    body = "\r\n".join(events)
    content = f"BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//test//EN\r\n{body}\r\nEND:VCALENDAR\r\n"
    return base64.b64encode(content.encode()).decode()


def busy_event(day: str, start_h: int, end_h: int, tz: str = TZ) -> str:
    ref = REF[day]
    # DTEND for end_hour=24 must point to next day 00:00
    if end_h == 24:
        next_dates = list(REF.values())
        idx = list(REF.keys()).index(day)
        next_ref = next_dates[idx + 1] if idx < 6 else "20260608"
        dtend = f"DTEND;TZID={tz}:{next_ref}T000000"
    else:
        dtend = f"DTEND;TZID={tz}:{ref}T{end_h:02d}0000"
    return (
        f"BEGIN:VEVENT\r\n"
        f"DTSTART;TZID={tz}:{ref}T{start_h:02d}0000\r\n"
        f"{dtend}\r\n"
        f"RRULE:FREQ=WEEKLY\r\n"
        f"TRANSP:OPAQUE\r\n"
        f"SUMMARY:Ocupado\r\n"
        f"END:VEVENT"
    )


# ---------------------------------------------------------------------------
# _complement_intervals unit tests
# ---------------------------------------------------------------------------


def test_complement_empty_intervals() -> None:
    assert _complement_intervals([], (0, 24)) == [(0, 24)]


def test_complement_full_coverage() -> None:
    assert _complement_intervals([(0, 24)], (0, 24)) == []


def test_complement_middle_gap() -> None:
    result = _complement_intervals([(0, 8), (18, 24)], (0, 24))
    assert result == [(8, 18)]


def test_complement_leading_gap() -> None:
    assert _complement_intervals([(8, 24)], (0, 24)) == [(0, 8)]


def test_complement_trailing_gap() -> None:
    assert _complement_intervals([(0, 22)], (0, 24)) == [(22, 24)]


def test_complement_multiple_gaps() -> None:
    result = _complement_intervals([(2, 6), (10, 14), (20, 24)], (0, 24))
    assert result == [(0, 2), (6, 10), (14, 20)]


# ---------------------------------------------------------------------------
# _busy_to_available unit tests
# ---------------------------------------------------------------------------


def test_busy_to_available_empty() -> None:
    """No busy slots → every hour of every day is available."""
    result = _busy_to_available([])
    days = {s.day_of_week for s in result}
    assert days == {
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
    }
    for slot in result:
        assert slot.start_hour == 0
        assert slot.end_hour == 24


def test_busy_to_available_fully_busy() -> None:
    busy = [
        TimeSlot(day_of_week=d, start_hour=0, end_hour=24)
        for d in ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    ]
    assert _busy_to_available(busy) == []


def test_busy_to_available_saturday_split() -> None:
    """Busy 0-14 and 22-24 on Saturday → available 14-22."""
    busy = [
        TimeSlot(day_of_week="saturday", start_hour=0, end_hour=14),
        TimeSlot(day_of_week="saturday", start_hour=22, end_hour=24),
    ]
    result = _busy_to_available(busy)
    sat = [s for s in result if s.day_of_week == "saturday"]
    assert len(sat) == 1
    assert sat[0].start_hour == 14
    assert sat[0].end_hour == 22


# ---------------------------------------------------------------------------
# parse_to_available_slots integration tests
# ---------------------------------------------------------------------------


def test_parse_invalid_base64_returns_empty() -> None:
    result = parse_to_available_slots("not_valid_base64!!!", TZ)
    assert result == []


def test_parse_invalid_ics_returns_empty() -> None:
    garbage = base64.b64encode(b"this is not ical").decode()
    # icalendar is lenient; we just verify no exception is raised
    result = parse_to_available_slots(garbage, TZ)
    assert isinstance(result, list)


def test_parse_full_week_busy_gives_no_slots() -> None:
    """All 7 days fully busy → no available slots."""
    events = [busy_event(day, 0, 24) for day in REF]
    ics = make_ics(*events)
    result = parse_to_available_slots(ics, TZ)
    assert result == []


def test_parse_saturday_afternoon_available() -> None:
    """
    Simulates the frontend output for a user who selected Saturday 14:00–22:00.
    Busy blocks: Mon–Fri all day, Sat 0–14, Sat 22–24, Sun all day.
    Expected available: Saturday 14–22 only.
    """
    events = [
        busy_event("monday", 0, 24),
        busy_event("tuesday", 0, 24),
        busy_event("wednesday", 0, 24),
        busy_event("thursday", 0, 24),
        busy_event("friday", 0, 24),
        busy_event("saturday", 0, 14),
        busy_event("saturday", 22, 24),
        busy_event("sunday", 0, 24),
    ]
    ics = make_ics(*events)
    result = parse_to_available_slots(ics, TZ)

    sat = [s for s in result if s.day_of_week == "saturday"]
    assert len(sat) == 1, f"Expected 1 Saturday slot, got {sat}"
    assert sat[0].start_hour == 14
    assert sat[0].end_hour == 22

    # All other days should have no available slots
    other = [s for s in result if s.day_of_week != "saturday"]
    assert other == []


def test_parse_transparent_event_ignored() -> None:
    """TRANSPARENT (free) events must not contribute to busy blocks."""
    free_event = (
        f"BEGIN:VEVENT\r\n"
        f"DTSTART;TZID={TZ}:{REF['monday']}T000000\r\n"
        f"DTEND;TZID={TZ}:{REF['tuesday']}T000000\r\n"
        f"RRULE:FREQ=WEEKLY\r\n"
        f"TRANSP:TRANSPARENT\r\n"
        f"END:VEVENT"
    )
    ics = make_ics(free_event)
    result = parse_to_available_slots(ics, TZ)
    # Monday should be fully available since the event is transparent
    mon = [s for s in result if s.day_of_week == "monday"]
    assert any(s.start_hour == 0 and s.end_hour == 24 for s in mon)


def test_parse_multiple_slots_per_day() -> None:
    """User available Wed 8–12 and 18–22 → busy 0–8, 12–18, 22–24."""
    events = [
        busy_event("wednesday", 0, 8),
        busy_event("wednesday", 12, 18),
        busy_event("wednesday", 22, 24),
    ]
    ics = make_ics(*events)
    result = parse_to_available_slots(ics, TZ)

    wed = sorted(
        [s for s in result if s.day_of_week == "wednesday"],
        key=lambda s: s.start_hour,
    )
    assert len(wed) == 2
    assert wed[0].start_hour == 8 and wed[0].end_hour == 12
    assert wed[1].start_hour == 18 and wed[1].end_hour == 22
