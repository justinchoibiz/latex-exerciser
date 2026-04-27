BASE_SCORE = 100.0

DIFFICULTY_WEIGHT: dict[int, float] = {
    1: 1.0,
    2: 1.1,
    3: 1.2,
    4: 1.3,
    5: 1.4,
    6: 1.6,
    7: 1.8,
    8: 2.0,
    9: 2.3,
    10: 2.6,
}


def normalize_latex(value: str) -> str:
    return (
        value.strip()
        .replace(" ", "")
        .replace("\\,", "")
        .replace("\\;", "")
    )


def grade_latex_answer(
    submitted_latex: str,
    target_latex: str,
    accepted_variants: list[str],
    strict_mode: bool,
) -> bool:
    if strict_mode:
        return submitted_latex == target_latex

    normalized_submitted = normalize_latex(submitted_latex)
    normalized_target = normalize_latex(target_latex)
    normalized_variants = {
        normalize_latex(variant) for variant in accepted_variants
    }

    return (
        normalized_submitted == normalized_target
        or normalized_submitted in normalized_variants
    )


def get_speed_multiplier(response_time_sec: float, time_limit_sec: int) -> float:
    if response_time_sec <= time_limit_sec * 0.5:
        return 1.1

    if response_time_sec <= time_limit_sec:
        return 1.0

    return 0.6


def calculate_question_score(
    is_correct: bool,
    difficulty_level: int,
    response_time_sec: float,
    time_limit_sec: int,
    used_reveal: bool,
) -> float:
    if not is_correct:
        return 0.0

    difficulty_weight = DIFFICULTY_WEIGHT[difficulty_level]
    speed_multiplier = get_speed_multiplier(
        response_time_sec=response_time_sec,
        time_limit_sec=time_limit_sec,
    )
    hint_penalty = 0.5 if used_reveal else 1.0

    return round(
        BASE_SCORE * difficulty_weight * speed_multiplier * hint_penalty,
        2,
    )