"""Pollock 7-fold skinfold body composition calculations."""


def pollock_7fold(skinfolds: dict, age: float, sex: str) -> dict:
    """
    Jackson & Pollock 7-site skinfold formula.

    Sites: chest, midaxillary, triceps, subscapular, abdomen, suprailiac, thigh
    Returns body density, body fat %, lean mass, fat mass.
    """
    sites = ['chest', 'midaxillary', 'triceps', 'subscapular', 'abdomen', 'suprailiac', 'thigh']
    sum7 = sum(float(skinfolds.get(s, 0)) for s in sites)

    if sex.lower() in ('m', 'male', 'masculino'):
        bd = 1.112 - (0.00043499 * sum7) + (0.00000055 * sum7 ** 2) - (0.00028826 * age)
    else:
        bd = 1.097 - (0.00046971 * sum7) + (0.00000056 * sum7 ** 2) - (0.00012828 * age)

    body_fat_pct = (4.95 / bd - 4.50) * 100
    body_fat_pct = max(3.0, min(body_fat_pct, 60.0))

    return {
        'body_density': round(bd, 4),
        'body_fat_pct': round(body_fat_pct, 1),
        'sum7': round(sum7, 1),
    }


def classify_body_fat(pct: float, sex: str, age: float) -> str:
    male = sex.lower() in ('m', 'male', 'masculino')
    if male:
        if age < 30:
            if pct < 8: return 'Excelente'
            if pct < 13: return 'Bom'
            if pct < 18: return 'Médio'
            if pct < 23: return 'Abaixo do Médio'
            return 'Muito Acima'
        elif age < 40:
            if pct < 11: return 'Excelente'
            if pct < 16: return 'Bom'
            if pct < 21: return 'Médio'
            if pct < 26: return 'Abaixo do Médio'
            return 'Muito Acima'
        else:
            if pct < 13: return 'Excelente'
            if pct < 18: return 'Bom'
            if pct < 23: return 'Médio'
            if pct < 28: return 'Abaixo do Médio'
            return 'Muito Acima'
    else:
        if age < 30:
            if pct < 16: return 'Excelente'
            if pct < 20: return 'Bom'
            if pct < 25: return 'Médio'
            if pct < 30: return 'Abaixo do Médio'
            return 'Muito Acima'
        elif age < 40:
            if pct < 17: return 'Excelente'
            if pct < 22: return 'Bom'
            if pct < 27: return 'Médio'
            if pct < 32: return 'Abaixo do Médio'
            return 'Muito Acima'
        else:
            if pct < 18: return 'Excelente'
            if pct < 23: return 'Bom'
            if pct < 28: return 'Médio'
            if pct < 33: return 'Abaixo do Médio'
            return 'Muito Acima'


def calculate_bmi(weight_kg: float, height_cm: float) -> dict:
    h = height_cm / 100
    bmi = weight_kg / (h * h)
    if bmi < 18.5: cat = 'Abaixo do Peso'
    elif bmi < 25: cat = 'Peso Normal'
    elif bmi < 30: cat = 'Sobrepeso'
    elif bmi < 35: cat = 'Obesidade Grau I'
    elif bmi < 40: cat = 'Obesidade Grau II'
    else: cat = 'Obesidade Grau III'
    return {'bmi': round(bmi, 1), 'category': cat}


def ideal_weight_range(height_cm: float) -> dict:
    h = height_cm / 100
    return {
        'min': round(18.5 * h * h, 1),
        'max': round(24.9 * h * h, 1),
    }
