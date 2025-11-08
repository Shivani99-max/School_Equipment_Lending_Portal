# routes/equipment_routes.py
from flask import Blueprint, request, jsonify
from db import get_db_connection

equipment_bp = Blueprint("equipment_bp", __name__)

@equipment_bp.route("/equipments", methods=["GET"])
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


# UPDATE equipment
@equipment_bp.route("/equipment/<int:eid>", methods=["PUT"])
def update_equipment(eid):
    data = request.get_json() or {}
    fields = []
    params = []

    for col in ["name", "category", "condition_status", "quantity", "available_quantity"]:
        if col in data:
            fields.append(f"{col}=%s")
            params.append(data[col])

    if not fields:
        return jsonify({"error": "No fields to update"}), 400

    params.append(eid)
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(f"UPDATE equipment SET {', '.join(fields)} WHERE id=%s", tuple(params))
    conn.commit()
    cur.close(); conn.close()
    return jsonify({"message": "updated"}), 200


# DELETE equipment
@equipment_bp.route("/equipment/<int:eid>", methods=["DELETE"])
def delete_equipment(eid):
    conn = get_db_connection()
    cur = conn.cursor()
    # optional: check if equipment is currently borrowed (pending/approved)
    cur.execute("""
        SELECT COUNT(*) FROM requests
        WHERE equipment_id=%s AND status IN ('pending','approved')
    """, (eid,))
    (active_count,) = cur.fetchone()
    if active_count:
        cur.close(); conn.close()
        return jsonify({"error":"Cannot delete: active requests exist"}), 400

    cur.execute("DELETE FROM equipment WHERE id=%s", (eid,))
    conn.commit()
    cur.close(); conn.close()
    return jsonify({"message": "deleted"}), 200

