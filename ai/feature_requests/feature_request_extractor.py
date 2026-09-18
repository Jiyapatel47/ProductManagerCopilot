import re


FEATURE_REQUEST_PATTERNS = [
    r"\badd\b",
    r"\bplease add\b",
    r"\bwould like\b",
    r"\bwant\b",
    r"\bneed\b",
    r"\bshould have\b",
    r"\bwould be nice\b",
    r"\bcan you add\b",
    r"\brequest\b",
    r"\bsupport\b",
    r"\bintegration\b",
    r"\bexport\b",
    r"\bdark mode\b",
    r"\bdark theme\b",
    r"\bkeyboard shortcuts\b",
]


def is_feature_request(text: str) -> bool:
    """
    Determine whether feedback appears to contain
    a feature request.
    """

    if not text:
        return False

    text_lower = text.lower()

    return any(
        re.search(pattern, text_lower)
        for pattern in FEATURE_REQUEST_PATTERNS
    )


def normalize_feature_request(text: str) -> str:
    """
    Normalize a feature request while preserving
    its original meaning.
    """

    if not text:
        return ""

    normalized = str(text).strip()

    normalized = re.sub(
        r"\s+",
        " ",
        normalized,
    )

    return normalized