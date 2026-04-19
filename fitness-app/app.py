"""Flask backend for 3D Fitness Assessment App."""

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from datetime import datetime
import os

from database import init_db, list_patients, get_patient, save_patient, delete_patient
from database import list_assessments, save_assessment, get_evolution
from calculations import pollock_7fold, classify_body_fat, calculate_bmi, ideal_weight_range

app = Flask(__name__, static_folder='static', template_folder='templates')
CORS(app)

init_db()


@app.route('/')
def index():
    return send_from_directory('templates', 'index.html')


# --- Patients ---
@app.route('/api/patients', methods=['GET'])
def api_list_patients():
    return jsonify(list_patients())


@app.route('/api/patients', methods=['POST'])
def api_create_patient():
    data = request.json
    pid = save_patient(data)
    return jsonify({'id': pid, 'ok': True})


@app.route('/api/patients/<int:pid>', methods=['GET'])
def api_get_patient(pid):
    p = get_patient(pid)
    if not p:
        return jsonify({'error': 'Not found'}), 404
    return jsonify(p)


@app.route('/api/patients/<int:pid>', methods=['PUT'])
def api_update_patient(pid):
    data = request.json
    data['id'] = pid
    save_patient(data)
    return jsonify({'ok': True})


@app.route('/api/patients/<int:pid>', methods=['DELETE'])
def api_delete_patient(pid):
    delete_patient(pid)
    return jsonify({'ok': True})


# --- Assessments ---
@app.route('/api/patients/<int:pid>/assessments', methods=['GET'])
def api_list_assessments(pid):
    return jsonify(list_assessments(pid))


@app.route('/api/patients/<int:pid>/assessments', methods=['POST'])
def api_create_assessment(pid):
    data = request.json
    data['patient_id'] = pid

    patient = get_patient(pid)
    birth = patient.get('birth_date', '')
    age = 30.0
    if birth:
        try:
            born = datetime.strptime(birth, '%Y-%m-%d')
            age = (datetime.now() - born).days / 365.25
        except Exception:
            pass

    sex = patient.get('sex', 'M')
    skinfolds = data.get('skinfolds', {})
    weight = data.get('weight_kg', 0)
    height = data.get('height_cm', 170)

    pollock = pollock_7fold(skinfolds, age, sex)
    bmi_data = calculate_bmi(weight, height) if weight and height else {}
    ideal = ideal_weight_range(height) if height else {}

    fat_pct = pollock['body_fat_pct']
    lean_mass = round(weight * (1 - fat_pct / 100), 1) if weight else None
    fat_mass = round(weight * fat_pct / 100, 1) if weight else None

    results = {
        **pollock,
        **bmi_data,
        'ideal_weight': ideal,
        'lean_mass_kg': lean_mass,
        'fat_mass_kg': fat_mass,
        'classification': classify_body_fat(fat_pct, sex, age),
        'age': round(age, 1),
    }

    data['results'] = results
    aid = save_assessment(data)
    return jsonify({'id': aid, 'results': results, 'ok': True})


@app.route('/api/patients/<int:pid>/evolution', methods=['GET'])
def api_evolution(pid):
    return jsonify(get_evolution(pid))


# --- Calculate preview (without saving) ---
@app.route('/api/calculate', methods=['POST'])
def api_calculate():
    data = request.json
    age = float(data.get('age', 30))
    sex = data.get('sex', 'M')
    weight = float(data.get('weight_kg', 0) or 0)
    height = float(data.get('height_cm', 170) or 170)
    skinfolds = data.get('skinfolds', {})

    pollock = pollock_7fold(skinfolds, age, sex)
    bmi_data = calculate_bmi(weight, height) if weight and height else {}
    ideal = ideal_weight_range(height) if height else {}

    fat_pct = pollock['body_fat_pct']
    lean_mass = round(weight * (1 - fat_pct / 100), 1) if weight else None
    fat_mass = round(weight * fat_pct / 100, 1) if weight else None

    return jsonify({
        **pollock,
        **bmi_data,
        'ideal_weight': ideal,
        'lean_mass_kg': lean_mass,
        'fat_mass_kg': fat_mass,
        'classification': classify_body_fat(fat_pct, sex, age),
    })


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f'\n✓ Fitness Assessment App rodando em: http://localhost:{port}\n')
    app.run(host='0.0.0.0', port=port, debug=True)
