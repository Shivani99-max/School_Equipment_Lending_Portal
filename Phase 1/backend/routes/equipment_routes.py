# routes/equipment_routes.py
from flask import Blueprint, request, jsonify
from db import get_db_connection

equipment_bp = Blueprint("equipment_bp", __name__)

@equipment_bp.route("/equipment", methods=["GET"])
def get_equipment():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM equipment")
    data = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(data)


@equipment_bp.route("/equipment", methods=["POST"])
def add_equipment():
    data = request.get_json()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO equipment (name, category, condition_status, quantity, available_quantity)
        VALUES (%s, %s, %s, %s, %s)
    """, (data["name"], data["category"], data["condition_status"],
          data["quantity"], data["quantity"]))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "Equipment added"}), 201
