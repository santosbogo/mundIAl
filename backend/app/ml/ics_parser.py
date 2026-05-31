"""
ICS parser — decodes a base64 .ics file and returns a Calendar object.

The availability calculation (checking whether the user is busy during a
specific match) is done in feature_engineering using recurring_ical_events,
which correctly expands recurring rules to exact datetimes.
"""

from __future__ import annotations

import base64
import logging

from icalendar import Calendar

logger = logging.getLogger(__name__)


def parse_calendar(ics_b64: str) -> Calendar | None:
    """Decode base64 ICS and return a parsed Calendar. Returns None on any error."""
    try:
        ics_bytes = base64.b64decode(ics_b64)
        return Calendar.from_ical(ics_bytes)  # type: ignore[return-value]
    except Exception:
        logger.warning("Failed to decode or parse ICS content")
        return None
