from flask import Blueprint, request, jsonify
from db import get_db_connection

borrow_bp = Blueprint("borrow_bp", __name__)

@borrow_bp.route("/borrow", methods=["POST"])
def request_equipment():
    data = request.get_json()
    user_id = data["user_id"]                # numeric user ID
    equipment_id = data["equipment_id"]      # numeric equipment ID

    conn = get_db_connection()
    cursor = conn.cursor()
    
    # check if equipment is available
    cursor.execute("SELECT available_quantity FROM equipment WHERE id = %s", (equipment_id,))
    result = cursor.fetchone()
    if not result or result[0] <= 0:
        cursor.close()
        conn.close()
        return jsonify({"error": "Equipment not available"}), 400

    # insert borrow request with issue_date = current timestamp, return_date = NULL
    cursor.execute("""
        INSERT INTO requests (user_id, equipment_id, status, issue_date, return_date)
        VALUES (%s, %s, 'pending', NOW(), NULL)
    """, (user_id, equipment_id))
    
    # decrease available quantity
    cursor.execute("""
        UPDATE equipment SET available_quantity = available_quantity - 1
        WHERE id = %s
    """, (equipment_id,))
    
    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({"message": "Request submitted successfully"}), 201
