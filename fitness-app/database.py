"""SQLite database operations for patient and assessment management."""

import sqlite3
import json
from datetime import datetime
from pathlib import Path

DB_PATH = Path(__file__).parent / 'fitness_data.db'


def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    with get_conn() as conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS patients (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                birth_date TEXT,
                sex TEXT NOT NULL,
                email TEXT,
                phone TEXT,
                created_at TEXT DEFAULT (datetime('now'))
            );

            CREATE TABLE IF NOT EXISTS assessments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
                assessed_at TEXT DEFAULT (datetime('now')),
                weight_kg REAL,
                height_cm REAL,
                skinfolds TEXT,
                measurements TEXT,
                results TEXT,
                notes TEXT
            );
        """)


def list_patients():
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT p.*, COUNT(a.id) as assessment_count "
            "FROM patients p LEFT JOIN assessments a ON a.patient_id = p.id "
            "GROUP BY p.id ORDER BY p.name"
        ).fetchall()
    return [dict(r) for r in rows]


def get_patient(pid: int):
    with get_conn() as conn:
        row = conn.execute("SELECT * FROM patients WHERE id=?", (pid,)).fetchone()
    return dict(row) if row else None


def save_patient(data: dict) -> int:
    with get_conn() as conn:
        if data.get('id'):
            conn.execute(
                "UPDATE patients SET name=?,birth_date=?,sex=?,email=?,phone=? WHERE id=?",
                (data['name'], data.get('birth_date'), data['sex'],
                 data.get('email'), data.get('phone'), data['id'])
            )
            return data['id']
        else:
            cur = conn.execute(
                "INSERT INTO patients(name,birth_date,sex,email,phone) VALUES(?,?,?,?,?)",
                (data['name'], data.get('birth_date'), data['sex'],
                 data.get('email'), data.get('phone'))
            )
            return cur.lastrowid


def delete_patient(pid: int):
    with get_conn() as conn:
        conn.execute("DELETE FROM patients WHERE id=?", (pid,))


def list_assessments(patient_id: int):
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT * FROM assessments WHERE patient_id=? ORDER BY assessed_at DESC",
            (patient_id,)
        ).fetchall()
    result = []
    for r in rows:
        d = dict(r)
        d['skinfolds'] = json.loads(d['skinfolds'] or '{}')
        d['measurements'] = json.loads(d['measurements'] or '{}')
        d['results'] = json.loads(d['results'] or '{}')
        result.append(d)
    return result


def save_assessment(data: dict) -> int:
    skinfolds = json.dumps(data.get('skinfolds', {}))
    measurements = json.dumps(data.get('measurements', {}))
    results = json.dumps(data.get('results', {}))
    with get_conn() as conn:
        if data.get('id'):
            conn.execute(
                "UPDATE assessments SET weight_kg=?,height_cm=?,skinfolds=?,measurements=?,results=?,notes=?,assessed_at=? WHERE id=?",
                (data.get('weight_kg'), data.get('height_cm'), skinfolds,
                 measurements, results, data.get('notes'), data.get('assessed_at', datetime.now().isoformat()), data['id'])
            )
            return data['id']
        else:
            cur = conn.execute(
                "INSERT INTO assessments(patient_id,weight_kg,height_cm,skinfolds,measurements,results,notes,assessed_at) VALUES(?,?,?,?,?,?,?,?)",
                (data['patient_id'], data.get('weight_kg'), data.get('height_cm'),
                 skinfolds, measurements, results, data.get('notes'),
                 data.get('assessed_at', datetime.now().isoformat()))
            )
            return cur.lastrowid


def get_evolution(patient_id: int):
    assessments = list_assessments(patient_id)
    return [{
        'date': a['assessed_at'][:10],
        'weight': a.get('weight_kg'),
        'body_fat': a['results'].get('body_fat_pct'),
        'sum7': a['results'].get('sum7'),
        'bmi': a['results'].get('bmi'),
    } for a in reversed(assessments)]
