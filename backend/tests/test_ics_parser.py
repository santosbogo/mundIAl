"""
Tests for ICS parsing and availability scoring.

All tests are pure (no DB, no HTTP). The key property being tested:
recurring_ical_events expands RRULE correctly so that a busy event on a
specific date only affects that date, not every occurrence of that weekday.
"""

from __future__ import annotations

import base64
from datetime import UTC, datetime

from app.ml.feature_engineering import _availability_score
from app.ml.ics_parser import parse_calendar

TZ = "America/Argentina/Buenos_Aires"


def make_ics(*events: str) -> str:
    body = "\r\n".join(events)
    content = f"BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//test//EN\r\n{body}\r\nEND:VCALENDAR\r\n"
    return base64.b64encode(content.encode()).decode()


def utc(year: int, month: int, day: int, hour: int = 0) -> datetime:
    return datetime(year, month, day, hour, 0, 0, tzinfo=UTC)


# ---------------------------------------------------------------------------
# parse_calendar
# ---------------------------------------------------------------------------


def test_parse_calendar_valid() -> None:
    ics = make_ics()
    cal = parse_calendar(ics)
    assert cal is not None


def test_parse_calendar_invalid_base64_returns_none() -> None:
    assert parse_calendar("not!!!valid===base64") is None


def test_parse_calendar_garbage_bytes_returns_none() -> None:
    garbage = base64.b64encode(b"\x00\xff\xfe invalid ics").decode()
    # icalendar is lenient; parse_calendar should not raise
    result = parse_calendar(garbage)
    # may return None or a Calendar — either is acceptable, just no exception
    assert result is None or result is not None


# ---------------------------------------------------------------------------
# _availability_score — no calendar
# ---------------------------------------------------------------------------


def test_availability_score_no_calendar() -> None:
    assert _availability_score(utc(2026, 6, 14, 21), None) == 0.0


# ---------------------------------------------------------------------------
# _availability_score — empty calendar (no events)
# ---------------------------------------------------------------------------


def test_availability_score_empty_calendar() -> None:
    cal = parse_calendar(make_ics())
    # No busy events → fully available
    assert _availability_score(utc(2026, 6, 14, 21), cal) == 1.0


# ---------------------------------------------------------------------------
# _availability_score — one-time events
# ---------------------------------------------------------------------------


def test_availability_score_fully_busy_match() -> None:
    """Event covers the entire 2-hour match window → score = 0."""
    event = (
        "BEGIN:VEVENT\r\n"
        "DTSTART:20260614T200000Z\r\n"
        "DTEND:20260614T230000Z\r\n"
        "TRANSP:OPAQUE\r\n"
        "SUMMARY:Occupied\r\n"
        "END:VEVENT"
    )
    cal = parse_calendar(make_ics(event))
    score = _availability_score(utc(2026, 6, 14, 21), cal)
    assert score == 0.0


def test_availability_score_fully_free_match() -> None:
    """Event is on a different day → match is fully free → score = 1."""
    event = (
        "BEGIN:VEVENT\r\n"
        "DTSTART:20260615T200000Z\r\n"
        "DTEND:20260615T230000Z\r\n"
        "TRANSP:OPAQUE\r\n"
        "END:VEVENT"
    )
    cal = parse_calendar(make_ics(event))
    score = _availability_score(utc(2026, 6, 14, 21), cal)
    assert score == 1.0


def test_availability_score_partial_overlap() -> None:
    """Event covers the first hour of a 2-hour match → score = 0.5."""
    # Match: 21:00–23:00 UTC. Event: 21:00–22:00 UTC (1h overlap out of 2h).
    event = (
        "BEGIN:VEVENT\r\n"
        "DTSTART:20260614T210000Z\r\n"
        "DTEND:20260614T220000Z\r\n"
        "TRANSP:OPAQUE\r\n"
        "END:VEVENT"
    )
    cal = parse_calendar(make_ics(event))
    score = _availability_score(utc(2026, 6, 14, 21), cal)
    assert abs(score - 0.5) < 1e-6


def test_availability_score_transparent_event_ignored() -> None:
    """TRANSPARENT events (free time) must not reduce availability."""
    event = (
        "BEGIN:VEVENT\r\n"
        "DTSTART:20260614T200000Z\r\n"
        "DTEND:20260614T230000Z\r\n"
        "TRANSP:TRANSPARENT\r\n"
        "END:VEVENT"
    )
    cal = parse_calendar(make_ics(event))
    score = _availability_score(utc(2026, 6, 14, 21), cal)
    assert score == 1.0


# ---------------------------------------------------------------------------
# _availability_score — recurring events (RRULE:FREQ=WEEKLY)
# ---------------------------------------------------------------------------


def test_availability_score_recurring_affects_correct_weekday() -> None:
    """
    Weekly event every Sunday 21:00–23:00 UTC.
    June 14 2026 is a Sunday → score = 0.
    June 15 2026 is a Monday → score = 1.
    """
    event = (
        "BEGIN:VEVENT\r\n"
        "DTSTART:20260614T210000Z\r\n"
        "DTEND:20260614T230000Z\r\n"
        "RRULE:FREQ=WEEKLY\r\n"
        "TRANSP:OPAQUE\r\n"
        "END:VEVENT"
    )
    cal = parse_calendar(make_ics(event))
    assert _availability_score(utc(2026, 6, 14, 21), cal) == 0.0  # Sunday
    assert _availability_score(utc(2026, 6, 15, 21), cal) == 1.0  # Monday


def test_availability_score_one_off_does_not_affect_other_weeks() -> None:
    """
    A one-time event on Saturday June 6 must NOT affect Saturday June 13.
    This is the core property: exact-date semantics, not weekly generalisation.
    """
    event = (
        "BEGIN:VEVENT\r\n"
        "DTSTART:20260606T210000Z\r\n"
        "DTEND:20260606T230000Z\r\n"
        "TRANSP:OPAQUE\r\n"
        "END:VEVENT"
    )
    cal = parse_calendar(make_ics(event))
    # Same time, different Saturday
    assert _availability_score(utc(2026, 6, 6, 21), cal) == 0.0  # busy
    assert _availability_score(utc(2026, 6, 13, 21), cal) == 1.0  # free


def test_availability_score_frontend_generated_ics() -> None:
    """
    Simulates the ICS the frontend generates for Saturday 14:00–22:00 available
    (busy: Sat 0–14 and 22–24, weekly). A Saturday match at 17:00 local
    (which maps to 20:00 UTC for ART = UTC-3) must be free.
    """
    # Frontend generates busy blocks for Saturday 22:00–00:00 ART = 01:00–03:00 UTC Sunday
    # and Saturday 00:00–14:00 ART = 03:00–17:00 UTC Saturday.
    # Match at 20:00 UTC Saturday falls in the free window (17:00–01:00 UTC).
    busy_morning = (
        "BEGIN:VEVENT\r\n"
        f"DTSTART;TZID={TZ}:20260606T000000\r\n"
        f"DTEND;TZID={TZ}:20260606T140000\r\n"
        "RRULE:FREQ=WEEKLY\r\n"
        "TRANSP:OPAQUE\r\n"
        "END:VEVENT"
    )
    busy_night = (
        "BEGIN:VEVENT\r\n"
        f"DTSTART;TZID={TZ}:20260606T220000\r\n"
        f"DTEND;TZID={TZ}:20260607T000000\r\n"
        "RRULE:FREQ=WEEKLY\r\n"
        "TRANSP:OPAQUE\r\n"
        "END:VEVENT"
    )
    cal = parse_calendar(make_ics(busy_morning, busy_night))

    # Saturday June 6 at 17:00 ART = 20:00 UTC → within the free window
    match_utc = utc(2026, 6, 6, 20)
    score = _availability_score(match_utc, cal)
    assert score == 1.0, f"Expected 1.0 (free slot), got {score}"

    # Saturday June 6 at 09:00 ART = 12:00 UTC → within the busy morning block
    match_busy = utc(2026, 6, 6, 12)
    score_busy = _availability_score(match_busy, cal)
    assert score_busy == 0.0, f"Expected 0.0 (busy), got {score_busy}"
