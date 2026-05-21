"""
Loads the trained sklearn classifier and runs inference.

If no trained model is found, falls back to a rule-based heuristic
so the API works before the notebook is run.
"""

from __future__ import annotations

from pathlib import Path
from typing import Protocol

import numpy as np

CATEGORY_LABELS = ["imperdible", "vale_la_pena", "para_el_resumen"]

_MODEL_PATH = Path(__file__).parent.parent / "models" / "classifier.pkl"


class _SklearnClassifier(Protocol):
    classes_: list[str]

    def predict_proba(self, X: np.ndarray) -> np.ndarray: ...


_model: _SklearnClassifier | None = None


def load_model() -> None:
    global _model
    if _MODEL_PATH.exists():
        import joblib

        _model = joblib.load(_MODEL_PATH)
    else:
        _model = None


def _rule_based_score(features: np.ndarray) -> np.ndarray:
    """
    Fallback heuristic: weighted sum of features → scalar score per match.
    Weights mirror the importance order the RF is expected to learn.
    """
    weights = np.array(
        [
            3.0,  # team_affinity
            1.5,  # rival_affinity
            2.0,  # star_player_playing
            1.5,  # availability_score
            -1.5,  # timezone_penalty (negative — hurts score)
            1.0,  # rivalry_index
            1.0,  # star_power
            0.8,  # group_stakes
            0.5,  # expected_competitiveness
            1.2,  # narrative_score
            0.5,  # regional_affinity
        ]
    )
    # features shape: (n, 11)
    result: np.ndarray = features @ weights
    return result


def predict(features: np.ndarray) -> tuple[list[str], list[float], np.ndarray]:
    """
    Returns:
        categories: list of category strings per match
        scores: list of raw scores (higher = more recommended)
        feature_matrix: the input features (passed through for score_breakdown)
    """
    if _model is not None:
        proba: np.ndarray = _model.predict_proba(features)
        # Column order depends on label encoding in classifier.pkl (sorted order)
        labels: list[str] = list(_model.classes_)
        best_idx = proba.argmax(axis=1)
        categories = [labels[i] for i in best_idx]
        scores: list[float] = proba.max(axis=1).tolist()
    else:
        raw_scores = _rule_based_score(features)
        min_s, max_s = float(raw_scores.min()), float(raw_scores.max())
        if max_s > min_s:
            norm = (raw_scores - min_s) / (max_s - min_s)
        else:
            norm = np.full_like(raw_scores, 0.5)

        categories = []
        for s in norm:
            if s >= 0.65:
                categories.append("imperdible")
            elif s >= 0.35:
                categories.append("vale_la_pena")
            else:
                categories.append("para_el_resumen")
        scores = norm.tolist()

    return categories, scores, features
